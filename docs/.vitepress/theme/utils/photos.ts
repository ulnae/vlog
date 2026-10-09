import { withBase } from 'vitepress'

export interface Photo {
  url: string
  text: string
}

export const PHOTOS: Photo[] = [
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
    
]

const PHOTO_BASE = ''

export function photoUrl(u: string) {
  return withBase(PHOTO_BASE + u)
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