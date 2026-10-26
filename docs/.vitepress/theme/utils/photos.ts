import { withBase } from 'vitepress'
// Derived at build time by `pnpm photos:gen` (scripts/gen-photos.mjs).
// Carries only the thumbnail path + real dimensions for each url — the
// human-authored {url, text} list below stays the single source of truth.
import dims from './photos.generated.json'

export interface Photo {
  url: string
  thumb: string
  w: number
  h: number
  text: string
}

// ── Source of truth ───────────────────────────────────────────────────────
// Add new photos here (drop the image under docs/public/<...> first), then
// run `pnpm photos:gen` to (re)generate their thumbnails + dimensions.
const RAW: { url: string; text: string }[] = [
  { url: '/2025/05/11/01.jpeg', text: '护士节快乐🎉' },
  { url: '/2025/05/17/01.jpeg', text: '见面喽😁' },
  { url: '/2025/05/17/02.jpeg', text: '漂亮的花花' },
  { url: '/2025/05/17/03.jpeg', text: '香香' },
  { url: '/2025/05/20/01.jpeg', text: '520' },
  { url: '/2025/06/01/01.jpeg', text: '儿童节快乐🎉' },
  { url: '/2025/06/01/02.jpeg', text: '好辣好辣🥵' },
  { url: '/2025/06/03/01.jpeg', text: '超赞的面👍' },
  { url: '/2025/06/09/01.jpeg', text: '拽妹' },
  { url: '/2025/06/19/01.jpeg', text: '打卡油化厂美食' },
  { url: '/2025/06/24/01.jpeg', text: '打卡知青老食堂' },
  { url: '/2025/06/28/01.jpeg', text: '漂亮的花花' },
  { url: '/2025/06/28/02.jpeg', text: '再度打卡鱼香茄龙' },
  { url: '/2025/07/14/01.jpg', text: '生日蛋糕' },
  { url: '/2025/07/14/02.jpg', text: '生日礼物' },
  { url: '/2025/08/29/01.jpg', text: '七夕快乐' },
  { url: '/2025/08/29/02.jpg', text: '七夕快乐' },
  { url: '/2025/11/06/01.jpg', text: '生日快乐宝🎉' },
  { url: '/2025/11/23/01.jpg', text: '订婚订婚' },
  { url: '/2025/12/05/01.jpg', text: '手捧花' },
  { url: '/2025/12/05/02.jpg', text: '我老婆最美😍' },
  { url: '/2025/12/20/01.jpeg', text: '玉米排骨汤' },
  { url: '/2026/01/25/01.jpeg', text: '王繁星yyds' },
  { url: '/2026/01/28/01.jpg', text: '持证上岗' },
  { url: '/2026/03/05/01.jpg', text: '小小叶，你好呀' },
  { url: '/2026/03/05/02.jpg', text: '么么么😙' },
  { url: '/2026/03/05/03.jpg', text: '最可爱了霖霖' },
  { url: '/2026/04/20/01.jpeg', text: '相识365天' },
  { url: '/2026/06/26/01.jpeg', text: '小小的一只' },
  { url: '/2026/06/26/02.jpeg', text: '皱起小小的眉头' },
  { url: '/2026/06/26/03.jpeg', text: '小小的鼻子' },
  { url: '/2026/06/26/04.jpeg', text: '哼~不理我' },
  { url: '/2026/08/01/01.jpeg', text: '睡的香香的' },
  { url: '/2026/08/02/01.jpeg', text: 'happy birthday!' },
  { url: '/2026/10/01/01.jpeg', text: '6.1kg啦！' },
  { url: '/2026/10/01/02.jpeg', text: '好舒服啊' },
  { url: '/2026/10/04/01.jpeg', text: '一百天喽' },
  { url: '/2026/10/04/02.jpeg', text: '一脸坏笑' },
  { url: '/2026/10/06/01.jpeg', text: '呼呼大睡' },
  { url: '/2026/10/13/01.jpeg', text: '嘿嘿' },
  { url: '/2026/10/13/02.jpeg', text: '哇偶！' },
  { url: '/2026/10/26/01.jpeg', text: '生日快乐宝宝🎉' },
  { url: '/2026/10/26/02.jpeg', text: '爱你' },
]

type Dim = { url: string; thumb: string; w: number; h: number }
const byUrl = new Map<string, Dim>((dims as Dim[]).map(d => [d.url, d]))

export const PHOTOS: Photo[] = RAW.map(p => {
  const d = byUrl.get(p.url)
  return {
    url: p.url,
    text: p.text,
    // Fall back to the original url if a thumbnail hasn't been generated yet —
    // the gallery still works (just loads full-res for that one photo).
    thumb: d?.thumb ?? p.url,
    w: d?.w ?? 0,
    h: d?.h ?? 0
  }
})

const PHOTO_BASE = ''

export function photoUrl(u: string) {
  return withBase(PHOTO_BASE + u)
}

/** Base-prefixed thumbnail URL for canvas display (small WebP, not the full original). */
export function thumbUrl(p: Photo) {
  return withBase(p.thumb)
}

/** Pre-computed aspect ratios keyed by original url. aspect = w / h. */
export const ASPECTS: Record<string, number> = {}
for (const p of PHOTOS) {
  if (p.w > 0 && p.h > 0) ASPECTS[p.url] = p.w / p.h
}

export function dateFromUrl(url: string): string {
  const s = String(url)
  const m = s.match(/(?:^|\D)(\d{4})\D(\d{1,2})\D(\d{1,2})(?:\D|$)/)
  if (m) {
    const [, y, mo, d] = m
    if (+mo >= 1 && +mo <= 12 && +d >= 1 && +d <= 31) {
      return `${y}.${mo.padStart(2, '0')}.${d.padStart(2, '0')}`
    }
  }
  const m2 = s.match(/(\d{8,})/)
  if (!m2) return ''
  const dstr = m2[1].slice(0, 8)
  return `${dstr.slice(0, 4)}.${dstr.slice(4, 6)}.${dstr.slice(6, 8)}`
}
