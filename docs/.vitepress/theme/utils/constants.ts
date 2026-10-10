export const FONT_FAMILY =
  '"ZCOOL KuaiLe","Comic Sans MS","Chalkboard SE","PingFang SC",' +
  '"Hiragino Sans GB","Microsoft YaHei",cursive,sans-serif'

export interface StyleTokens {
  cardBg: string
  imgBg: string
  textColor: string
  timeColor: string
  shadowColor: string
  bgInner: string
  bgOuter: string
  imgPlaceholderInk: string
}

/* 日间 */
export const LIGHT_STYLE: StyleTokens = {
  cardBg: '#FFFFFF',
  imgBg: '#F5EDE4',
  textColor: '#7A6151',
  timeColor: '#C4B5A5',
  shadowColor: 'rgba(172,136,100,0.30)',
  bgInner: '#FFFDF9',
  bgOuter: '#F6EDE1',
  imgPlaceholderInk: '#E3D3C1'
}

/* 夜间：保留原本的暖调，只是压暗、提亮文字 */
export const DARK_STYLE: StyleTokens = {
  cardBg: '#2A241F',
  imgBg: '#362E27',
  textColor: '#E8D9C5',
  timeColor: '#9C8874',
  shadowColor: 'rgba(0,0,0,0.55)',
  bgInner: '#1F1A16',
  bgOuter: '#141110',
  imgPlaceholderInk: '#433A31'
}

/* 当前生效的令牌，原地可变，渲染层继续 import { STYLE } 即可 */
export const STYLE: StyleTokens = { ...LIGHT_STYLE }

export function setStyleTheme(isDark: boolean) {
  Object.assign(STYLE, isDark ? DARK_STYLE : LIGHT_STYLE)
}


export const IN = {
  pad: 0,
  gap: 0,
  radius: 0.026,
  imgRadius: 0.026,
  fontSize: 0.078,
  lineH: 0.082,
  maxLines: 2,
  timeFontSize: 0.055,
  timeLineH: 0.095,
  timePadBottom: 0.035
} as const

export const IMG_ASPECT = 9 / 16
export const MIN_SCALE = 0.26
export const MAX_SCALE = 16
export const WORLD_SCALE = 500
export const CARD_W_MAX = 0.34
export const TWEEN_MS = 620