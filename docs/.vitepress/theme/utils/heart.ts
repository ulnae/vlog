const HEART = (() => {
  const pts: [number, number][] = []
  const N = 900
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2
    const s = Math.sin(t)
    const x = 16 * s * s * s
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    pts.push([x / 16, y / 16])
  }
  return pts
})()

export const HY_MAX = Math.max(...HEART.map(p => p[1]))
export const HY_MIN = Math.min(...HEART.map(p => p[1]))

function heartIntervals(y: number): [number, number][] {
  const P = HEART
  const L = P.length
  const xs: number[] = []
  for (let i = 0; i < L; i++) {
    const [x1, y1] = P[i]
    const [x2, y2] = P[(i + 1) % L]
    if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
      const k = (y - y1) / (y2 - y1)
      xs.push(x1 + k * (x2 - x1))
    }
  }
  xs.sort((a, b) => a - b)
  const out: [number, number][] = []
  for (let i = 0; i + 1 < xs.length; i += 2) out.push([xs[i], xs[i + 1]])
  return out
}

export const Y_TABLE = (() => {
  const N = 520
  const arr: { y: number; spans: [number, number][] }[] = []
  for (let i = 0; i < N; i++) {
    const y = HY_MIN + (HY_MAX - HY_MIN) * i / (N - 1)
    arr.push({ y, spans: heartIntervals(y) })
  }
  return arr
})()