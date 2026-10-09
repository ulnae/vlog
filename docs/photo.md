---
layout: page
footer: false
---

<canvas ref="canvasRef" id="cv"></canvas>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { PHOTOS, photoUrl, dateFromUrl } from './.vitepress/theme/utils/photos'
import { IMG_ASPECT, MIN_SCALE, MAX_SCALE, TWEEN_MS, WORLD_SCALE } from './.vitepress/theme/utils/constants'
import { solveLayout, worldUnits } from './.vitepress/theme/utils/layout'
import { drawCard, type Card } from './.vitepress/theme/utils/renderer'
import { bindGestures } from './.vitepress/theme/utils/gestures'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let canvas: HTMLCanvasElement
let ctx: CanvasRenderingContext2D
let dpr = 1
let destroyed = false
let rafId = 0
let rafPending = false
let rebuildTimer: ReturnType<typeof setTimeout> | null = null
let unbind: (() => void) | null = null

const view = { scale: 1, x: 0, y: 0 }
let CARD_W = 100
let MAX_CARD_H = 100
let cards: Card[] = []
let worldBounds = { w: 1, h: 1 }
let userInteracted = false

const aspectCache = new Map<string, number>()
const imgCache = new Map<string, { loaded: boolean; img: HTMLImageElement | null }>()

let tween: any = null

function aspectOf(url: string) {
  const a = aspectCache.get(url)
  return typeof a === 'number' && isFinite(a) && a > 0 ? a : IMG_ASPECT
}

function getImage(url: string) {
  let rec = imgCache.get(url)
  if (rec) return rec
  rec = { loaded: false, img: null }
  imgCache.set(url, rec)
  const im = new Image()
  im.onload = () => {
    rec!.loaded = true
    rec!.img = im
    const iw = im.naturalWidth || im.width
    const ih = im.naturalHeight || im.height
    if (iw > 0 && ih > 0) {
      const a = iw / ih
      if (Math.abs((aspectCache.get(url) ?? 0) - a) > 1e-4) {
        aspectCache.set(url, a)
        if (cards.length > 0) scheduleRebuild()
      }
    }
    requestRender()
  }
  im.onerror = () => { rec!.loaded = false }
  im.src = photoUrl(url)
  return rec
}

async function preloadAll() {
  await Promise.all(PHOTOS.map(p => new Promise<void>(resolve => {
    const im = new Image()
    im.onload = () => {
      const iw = im.naturalWidth || im.width
      const ih = im.naturalHeight || im.height
      if (iw > 0 && ih > 0) aspectCache.set(p.url, iw / ih)
      resolve()
    }
    im.onerror = () => resolve()
    im.src = photoUrl(p.url)
  })))
}

function build(animate: boolean) {
  const wantAnim = animate && cards.length > 0
  const prevPos = cards.map(c => ({ x: c.x, y: c.y, h: c.h }))
  const prevView = { ...view }

  const aspects = PHOTOS.map(p => aspectOf(p.url))
  const solved = solveLayout(PHOTOS.length, aspects)
  const { cardW, placements } = worldUnits(solved)
  CARD_W = cardW

  if (!placements.length) {
    cards = [{
      x: 0, y: 0, h: CARD_W,
      data: PHOTOS[0],
      date: dateFromUrl(PHOTOS[0].url)
    }]
    worldBounds = { w: CARD_W, h: CARD_W }
    return
  }

  const next: Card[] = placements.map((p, i) => ({
    x: p.x, y: p.y, h: p.h,
    data: PHOTOS[i % PHOTOS.length],
    date: dateFromUrl(PHOTOS[i % PHOTOS.length].url)
  }))

  const hw = CARD_W / 2
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const c of next) {
    const hh = c.h / 2
    if (c.x - hw < minX) minX = c.x - hw
    if (c.x + hw > maxX) maxX = c.x + hw
    if (c.y - hh < minY) minY = c.y - hh
    if (c.y + hh > maxY) maxY = c.y + hh
  }
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  for (const c of next) { c.x -= cx; c.y -= cy }
  worldBounds = { w: Math.max(1, maxX - minX), h: Math.max(1, maxY - minY) }

  MAX_CARD_H = Math.max(...next.map(c => c.h), ...prevPos.map(p => p.h), CARD_W)

  const targetView = userInteracted
    ? { scale: view.scale, x: view.x, y: view.y }
    : computeFitView()

  if (wantAnim) {
    const froms = next.map((c, i) => prevPos[i] ?? { x: c.x, y: c.y, h: c.h })
    tween = {
      t0: performance.now(),
      dur: TWEEN_MS,
      cards: next.map((c, i) => ({
        fx: froms[i].x, fy: froms[i].y, fh: froms[i].h,
        tx: c.x, ty: c.y, th: c.h
      })),
      view: { fs: prevView.scale, fx: prevView.x, fy: prevView.y, ts: targetView.scale, tx: targetView.x, ty: targetView.y }
    }
    for (let i = 0; i < next.length; i++) {
      next[i].x = froms[i].x
      next[i].y = froms[i].y
      next[i].h = froms[i].h
    }
    cards = next
  } else {
    cards = next
    tween = null
    Object.assign(view, targetView)
  }

  for (const c of cards) getImage(c.data.url)
}

function computeFitView() {
  const W = canvas.clientWidth || 1
  const H = canvas.clientHeight || 1
  const pad = 0.06
  let s = Math.min(W * (1 - pad * 2) / worldBounds.w, H * (1 - pad * 2) / worldBounds.h)
  s = Math.max(MIN_SCALE, Math.min(s, MAX_SCALE))
  return { scale: s, x: 0, y: 0 }
}

function clampView() {
  const W = canvas.clientWidth || 1
  const H = canvas.clientHeight || 1
  const maxX = Math.max(0, (worldBounds.w * view.scale - W) / 2)
  const maxY = Math.max(0, (worldBounds.h * view.scale - H) / 2)
  view.x = Math.max(-maxX, Math.min(maxX, view.x))
  view.y = Math.max(-maxY, Math.min(maxY, view.y))
}

function scheduleRebuild() {
  if (rebuildTimer) clearTimeout(rebuildTimer)
  rebuildTimer = setTimeout(() => {
    rebuildTimer = null
    if (destroyed) return
    build(true)
    requestRender()
  }, 140)
}

function requestRender() {
  if (rafPending) return
  rafPending = true
  rafId = requestAnimationFrame(onFrame)
}

function onFrame(now: number) {
  rafPending = false
  rafId = 0
  if (tween) {
    const p = (now - tween.t0) / tween.dur
    if (p >= 1) {
      applyTween(1); tween = null
    } else {
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
      applyTween(e)
    }
  }
  render()
  if (tween) requestRender()
}

function applyTween(e: number) {
  for (let i = 0; i < tween.cards.length; i++) {
    const s = tween.cards[i]
    const c = cards[i]
    if (!c || !s) continue
    c.x = s.fx + (s.tx - s.fx) * e
    c.y = s.fy + (s.ty - s.fy) * e
    c.h = s.fh + (s.th - s.fh) * e
  }
  const v = tween.view
  view.scale = v.fs + (v.ts - v.fs) * e
  view.x = v.fx + (v.tx - v.fx) * e
  view.y = v.fy + (v.ty - v.fy) * e
}

function render() {
  const cssW = canvas.clientWidth
  const cssH = canvas.clientHeight
  if (!cssW || !cssH) return
  const nextDpr = window.devicePixelRatio || 1
  const bw = Math.round(cssW * nextDpr)
  const bh = Math.round(cssH * nextDpr)
  if (canvas.width !== bw || canvas.height !== bh) {
    canvas.width = bw; canvas.height = bh
  }
  dpr = nextDpr

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const g = ctx.createRadialGradient(cssW / 2, cssH * 0.44, 0, cssW / 2, cssH * 0.44, Math.max(cssW, cssH) * 0.86)
  g.addColorStop(0, '#FFFDF9')
  g.addColorStop(1, '#F6EDE1')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, cssW, cssH)

  ctx.save()
  ctx.translate(cssW / 2 + view.x, cssH / 2 + view.y)
  ctx.scale(view.scale, view.scale)

  const camX = -view.x / view.scale
  const camY = -view.y / view.scale
  const limitX = cssW / 2 / view.scale + CARD_W
  const limitY = cssH / 2 / view.scale + MAX_CARD_H

  for (const c of cards) {
    if (Math.abs(c.x - camX) > limitX) continue
    if (Math.abs(c.y - camY) > limitY) continue
    const rec = imgCache.get(c.data.url)
    drawCard(ctx, c, CARD_W, view, rec?.loaded ? rec.img : null)
  }
  ctx.restore()
}

function onResize() {
  if (!userInteracted) Object.assign(view, computeFitView())
  else clampView()
  requestRender()
}

onMounted(async () => {
  canvas = canvasRef.value!
  ctx = canvas.getContext('2d')!
  dpr = window.devicePixelRatio || 1

  unbind = bindGestures(canvas, view, {
    onUpdate: requestRender,
    onStart: () => { userInteracted = true; tween = null },
    clampView
  })

  window.addEventListener('resize', onResize)

  build(false)
  requestRender()

  await preloadAll()
  if (destroyed) return
  build(true)
  requestRender()
})

onBeforeUnmount(() => {
  destroyed = true
  unbind?.()
  if (rebuildTimer) clearTimeout(rebuildTimer)
  if (rafPending && rafId) cancelAnimationFrame(rafId)
  window.removeEventListener('resize', onResize)
  imgCache.clear()
  cards = []
  tween = null
})
</script>

<style>
canvas#cv {
  position: fixed;
  top: var(--vp-nav-height);
  left: 0;
  width: 100%;
  height: calc(100dvh - var(--vp-nav-height));
  display: block;
  cursor: grab;
  background: #FDF7F0;
  touch-action: none;
}
canvas#cv.dragging { cursor: grabbing; }
</style>