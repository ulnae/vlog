import { FONT_FAMILY, STYLE, IN } from './constants'
import type { Photo } from './photos'

export interface Card {
  x: number
  y: number
  h: number
  data: Photo
  date: string
}

export interface View {
  scale: number
  x: number
  y: number
}

const measureCanvas = document.createElement('canvas')
const measureCtx = measureCanvas.getContext('2d')!
const textCache = new Map<string, string[]>()

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2)
  if (typeof g.roundRect === 'function') {
    g.beginPath()
    g.roundRect(x, y, w, h, r)
  } else {
    g.beginPath()
    g.moveTo(x + r, y)
    g.arcTo(x + w, y, x + w, y + h, r)
    g.arcTo(x + w, y + h, x, y + h, r)
    g.arcTo(x, y + h, x, y, r)
    g.arcTo(x, y, x + w, y, r)
    g.closePath()
  }
}

function wrapText(text: string, maxWidth: number, fs: number): string[] {
  const key = `${fs.toFixed(3)}|${Math.round(maxWidth)}|${text}`
  const hit = textCache.get(key)
  if (hit) return hit

  measureCtx.font = `${fs}px ${FONT_FAMILY}`
  const chars = Array.from(text)
  const lines: string[] = []
  let cur = ''

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]
    if (cur === '') { cur = ch; continue }
    if (measureCtx.measureText(cur + ch).width <= maxWidth) {
      cur += ch
    } else {
      lines.push(cur)
      cur = ch
      if (lines.length === IN.maxLines - 1) {
        let rest = chars.slice(i).join('')
        while (rest.length > 1 && measureCtx.measureText(rest + '…').width > maxWidth) {
          rest = rest.slice(0, -1)
        }
        lines.push(rest + '…')
        textCache.set(key, lines)
        return lines
      }
    }
  }
  if (cur) lines.push(cur)
  textCache.set(key, lines)
  return lines
}

export function drawCard(
  ctx: CanvasRenderingContext2D,
  c: Card,
  cardW: number,
  view: View,
  img: HTMLImageElement | null
) {
  const cw = cardW
  const ch = c.h
  const px = cw * view.scale
  const left = c.x - cw / 2
  const top = c.y - ch / 2
  const pad = cw * IN.pad
  const imgW = cw - pad * 2
  const gap = cw * IN.gap
  const rad = cw * IN.radius
  const imgRad = cw * IN.imgRadius
  const textH = cw * IN.lineH * IN.maxLines
  const timeH = cw * IN.timeLineH
  const imgH = Math.max(1, ch - pad * 2 - gap - textH - timeH)

  ctx.save()
  if (px > 9) {
    ctx.shadowColor = STYLE.shadowColor
    ctx.shadowBlur = cw * 0.13 * view.scale
    ctx.shadowOffsetY = cw * 0.055 * view.scale
  }
  ctx.fillStyle = STYLE.cardBg
  roundRect(ctx, left, top, cw, ch, rad)
  ctx.fill()
  ctx.restore()

  const ix = left + pad
  const iy = top + pad
  ctx.save()
  roundRect(ctx, ix, iy, imgW, imgH, imgRad)
  ctx.clip()
  ctx.fillStyle = STYLE.imgBg
  ctx.fillRect(ix, iy, imgW, imgH)

  if (img) {
    const iw = img.naturalWidth || img.width
    const ih = img.naturalHeight || img.height
    if (iw && ih) {
      const s = Math.min(imgW / iw, imgH / ih)
      ctx.drawImage(img, ix + (imgW - iw * s) / 2, iy + (imgH - ih * s) / 2, iw * s, ih * s)
    }
  } else {
    ctx.fillStyle = STYLE.imgPlaceholderInk
    const cx0 = ix + imgW / 2
    const cy0 = iy + imgH / 2
    ctx.beginPath()
    ctx.arc(cx0, cy0 - imgH * 0.12, imgW * 0.22, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(cx0 - imgW * 0.32, cy0 + imgH * 0.22)
    ctx.quadraticCurveTo(cx0, cy0 - imgH * 0.1, cx0 + imgW * 0.32, cy0 + imgH * 0.22)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()

  if (px < 18) return

  const fs = cw * IN.fontSize
  const lineH = cw * IN.lineH
  const textTop = iy + imgH + gap
  const textAreaH = lineH * IN.maxLines

  ctx.save()
  ctx.font = `${fs}px ${FONT_FAMILY}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = STYLE.textColor

  const lines = wrapText(`\u201C${c.data.text}\u201D`, imgW * 0.96, fs)
  const totalH = lines.length * lineH
  const startY = textTop + (textAreaH - totalH) / 2 + lineH / 2
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], c.x, startY + i * lineH)
  }
  ctx.restore()

  if (c.date) {
    const tfs = cw * IN.timeFontSize
    if (tfs > 0.5) {
      ctx.save()
      ctx.font = `${tfs}px ${FONT_FAMILY}`
      ctx.textAlign = 'right'
      ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = STYLE.timeColor
      ctx.fillText(c.date, left + cw - cw * IN.timePadBottom, top + ch - cw * IN.timePadBottom)
      ctx.restore()
    }
  }
}