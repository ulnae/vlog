import { IN, IMG_ASPECT, CARD_W_MAX, WORLD_SCALE } from './constants'
import { Y_TABLE } from './heart'

export function cardH(w: number, aspect: number): number {
  const imgW = w * (1 - IN.pad * 2)
  const textH = w * IN.lineH * IN.maxLines
  const timeH = w * IN.timeLineH
  return w * IN.pad * 2 + imgW / aspect + w * IN.gap + textH + timeH
}

function gapFor(w: number) {
  return 0.06 * w
}

function columnRange(cx: number, halfW: number) {
  const left = cx - halfW
  const right = cx + halfW
  let yt = -Infinity
  let yb = Infinity
  for (const row of Y_TABLE) {
    for (const span of row.spans) {
      if (span[0] <= left && right <= span[1]) {
        if (row.y > yt) yt = row.y
        if (row.y < yb) yb = row.y
        break
      }
    }
  }
  return { yt, yb }
}

function buildColumns(w: number, gx: number) {
  const halfW = w / 2
  let n = Math.floor((2 + gx) / (w + gx))
  if (n < 1) n = 1
  const totalW = n * w + (n - 1) * gx
  const x0 = -totalW / 2 + halfW
  const cols: { cx: number; yt: number; yb: number }[] = []
  for (let i = 0; i < n; i++) {
    const cx = x0 + i * (w + gx)
    const r = columnRange(cx, halfW)
    if (!isFinite(r.yt) || !isFinite(r.yb)) continue
    if (r.yt - r.yb < w * 0.45) continue
    cols.push({ cx, ...r })
  }
  return cols
}

function packColumns(
  cols: { cx: number; yt: number; yb: number }[],
  heights: number[],
  gy: number
) {
  const cursors = cols.map(c => c.yt)
  const out: { col: number; cy: number; h: number }[] = []
  for (const h of heights) {
    let best = -1
    let bestCursor = -Infinity
    for (let i = 0; i < cols.length; i++) {
      const top = cursors[i] - h
      if (top < cols[i].yb) continue
      if (cursors[i] > bestCursor) {
        bestCursor = cursors[i]
        best = i
      }
    }
    if (best < 0) return null
    const cy = cursors[best] - h / 2
    out.push({ col: best, cy, h })
    cursors[best] = cy - h / 2 - gy
  }
  return out
}

export interface SolvedLayout {
  w: number
  cols: { cx: number; yt: number; yb: number }[]
  placements: { col: number; cy: number; h: number }[] | null
}

export function solveLayout(n: number, aspects: number[]): SolvedLayout {
  const fits = (w: number) => {
    const g = gapFor(w)
    const cols = buildColumns(w, g)
    if (!cols.length) return false
    const heights = aspects.map(a => cardH(w, a))
    const res = packColumns(cols, heights, g)
    return res !== null && res.length >= n
  }

  let lo = 0.02
  let guard = 0
  while (!fits(lo) && lo > 0.004 && guard++ < 40) lo *= 0.8
  if (!fits(lo)) return { w: 0.012, cols: [], placements: null }

  let hi = 1.0
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (fits(mid)) lo = mid
    else hi = mid
  }

  let w = Math.min(lo, CARD_W_MAX)
  guard = 0
  while (!fits(w) && w > 0.006 && guard++ < 40) w *= 0.9

  const g = gapFor(w)
  return {
    w,
    cols: buildColumns(w, g),
    placements: packColumns(buildColumns(w, g), aspects.map(a => cardH(w, a)), g)
  }
}

export function worldUnits(solved: SolvedLayout) {
  return {
    cardW: solved.w * WORLD_SCALE,
    placements: solved.placements?.map(p => ({
      x: (solved.cols[p.col]?.cx ?? 0) * WORLD_SCALE,
      y: -p.cy * WORLD_SCALE,
      h: p.h * WORLD_SCALE
    })) ?? []
  }
}