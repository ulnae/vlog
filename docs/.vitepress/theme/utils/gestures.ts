import { MIN_SCALE, MAX_SCALE } from './constants'

export interface View {
  scale: number
  x: number
  y: number
}

export interface GestureCallbacks {
  onUpdate: () => void
  onStart: () => void
  clampView: () => void
}

export function bindGestures(
  canvas: HTMLCanvasElement,
  view: View,
  cb: GestureCallbacks
): () => void {
  const pointers = new Map<number, { x: number; y: number }>()
  let pinch: { dist: number; cx: number; cy: number } | null = null

  function pinchInfo() {
    const arr = [...pointers.values()]
    if (arr.length < 2) return null
    const dx = arr[0].x - arr[1].x
    const dy = arr[0].y - arr[1].y
    return {
      dist: Math.hypot(dx, dy),
      cx: (arr[0].x + arr[1].x) / 2,
      cy: (arr[0].y + arr[1].y) / 2
    }
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault()
    cb.onStart()
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left - rect.width / 2
    const my = e.clientY - rect.top - rect.height / 2
    let delta = e.deltaY
    if (e.deltaMode === 1) delta *= 16
    else if (e.deltaMode === 2) delta *= 100
    const ns = Math.min(MAX_SCALE, Math.max(MIN_SCALE, view.scale * Math.exp(-delta * 0.0016)))
    const k = ns / view.scale
    view.x = mx - (mx - view.x) * k
    view.y = my - (my - view.y) * k
    view.scale = ns
    cb.clampView()
    cb.onUpdate()
  }

  function onDown(e: PointerEvent) {
    cb.onStart()
    try { canvas.setPointerCapture(e.pointerId) } catch {}
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.size === 2) pinch = pinchInfo()
    canvas.classList.add('dragging')
  }

  function onMove(e: PointerEvent) {
    const p = pointers.get(e.pointerId)
    if (!p) return
    const nx = e.clientX
    const ny = e.clientY
    if (pointers.size === 1) {
      view.x += nx - p.x
      view.y += ny - p.y
      p.x = nx; p.y = ny
      cb.clampView()
      cb.onUpdate()
      return
    }
    if (pointers.size === 2) {
      p.x = nx; p.y = ny
      const cur = pinchInfo()
      if (pinch && cur && pinch.dist > 0) {
        const rect = canvas.getBoundingClientRect()
        const mx = cur.cx - rect.left - rect.width / 2
        const my = cur.cy - rect.top - rect.height / 2
        const ns = Math.min(MAX_SCALE, Math.max(MIN_SCALE, view.scale * (cur.dist / pinch.dist)))
        const k = ns / view.scale
        view.x = mx - (mx - view.x) * k
        view.y = my - (my - view.y) * k
        view.scale = ns
        cb.clampView()
      }
      pinch = cur
      cb.onUpdate()
    }
  }

  function onUp(e: PointerEvent) {
    pointers.delete(e.pointerId)
    if (pointers.size < 2) pinch = null
    if (pointers.size === 0) canvas.classList.remove('dragging')
    try { canvas.releasePointerCapture(e.pointerId) } catch {}
  }

  canvas.addEventListener('wheel', onWheel, { passive: false })
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointercancel', onUp)

  return () => {
    canvas.removeEventListener('wheel', onWheel)
    canvas.removeEventListener('pointerdown', onDown)
    canvas.removeEventListener('pointermove', onMove)
    canvas.removeEventListener('pointerup', onUp)
    canvas.removeEventListener('pointercancel', onUp)
  }
}