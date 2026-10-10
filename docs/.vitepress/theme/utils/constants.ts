export const FONT_FAMILY =
  '"ZCOOL KuaiLe","Comic Sans MS","Chalkboard SE","PingFang SC",' +
  '"Hiragino Sans GB","Microsoft YaHei",cursive,sans-serif'

export const STYLE = {
  cardBg: '#FFFFFF',
  imgBg: '#F5EDE4',
  textColor: '#7A6151',
  timeColor: '#C4B5A5',
  shadowColor: 'rgba(172,136,100,0.30)',
  bgInner: '#FFFDF9',
  bgOuter: '#F6EDE1',
  imgPlaceholderInk: '#E3D3C1'
} as const

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