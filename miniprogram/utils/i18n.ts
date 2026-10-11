// 轻量国际化：语言存取 + 界面文案表
export type Lang = 'zh' | 'en'

const LANG_KEY = 'lang'

export function getLang(): Lang {
  const l = wx.getStorageSync(LANG_KEY)
  return l === 'en' ? 'en' : 'zh'
}

export function setLang(l: Lang) {
  wx.setStorageSync(LANG_KEY, l)
}

export interface Strings {
  // 首页
  heroTitle: string
  heroSub1: string
  heroSub2: string
  pickVersion: string
  vBasicName: string
  vBasicDesc: string
  vProName: string
  vProDesc: string
  vFullName: string
  vFullDesc: string
  questionsUnit: string
  start: string
  gallery: string
  lastPrefix: string
  footer: string
  shareTitle: string
  // 答题页
  prev: string
  quit: string
  quitTitle: string
  quitContent: string
  quitConfirm: string
  cancel: string
  // 结果页
  alsoFit: string
  profile: string
  reportTitle: string
  expand: string
  collapse: string
  you: string
  cityAbbr: string
  scoreUnit: string
  strongTitle: string
  shareBtn: string
  saveBtn: string
  againBtn: string
  drawing: string
  saved: string
  saveFail: string
  authTitle: string
  authContent: string
  authConfirm: string
  noRecord: string
  matchHigh: string
  matchMid: string
  matchLow: string
  // 图鉴页
  tierAll: string
  tier1: string
  tierNew1: string
  tier2: string
  galleryShare: string
}

const ZH: Strings = {
  heroTitle: '你的本命城市',
  heroSub1: '12 个维度 · 49 座城市',
  heroSub2: '测一测你适合哪座城',
  pickVersion: '选择测试版本',
  vBasicName: '基础版',
  vBasicDesc: '快速测一测，约 3 分钟',
  vProName: '专业版',
  vProDesc: '维度更细致，约 7 分钟',
  vFullName: '完整版',
  vFullDesc: '全量题库，结果最准',
  questionsUnit: '题',
  start: '开始测试 🐾',
  gallery: '🏙️ 城市图鉴（49 城）',
  lastPrefix: '📮 上次测出的本命城市：',
  footer: '动森风 · 小岛城市测试',
  shareTitle: '测一测你的本命城市是哪座？',
  prev: '← 上一题',
  quit: '退出测试',
  quitTitle: '退出测试？',
  quitContent: '当前答题进度将不会保存',
  quitConfirm: '退出',
  cancel: '取消',
  alsoFit: '也很适合你',
  profile: '你的 12 维画像',
  reportTitle: '📋 12 维匹配报告',
  expand: '▼ 展开匹配解读',
  collapse: '▲ 收起解读',
  you: '你',
  cityAbbr: '城',
  scoreUnit: '% 契合',
  strongTitle: '你的突出气质',
  shareBtn: '📤 分享给朋友',
  saveBtn: '💾 保存卡片',
  againBtn: '🔄 再测一次',
  drawing: '绘制卡片中…',
  saved: '已保存到相册',
  saveFail: '保存失败，请重试',
  authTitle: '需要相册权限',
  authContent: '请在设置中允许保存图片到相册',
  authConfirm: '去设置',
  noRecord: '还没有测试记录',
  matchHigh: '高度契合',
  matchMid: '基本合拍',
  matchLow: '差异较大',
  tierAll: '全部',
  tier1: '一线',
  tierNew1: '新一线',
  tier2: '二线',
  galleryShare: '49 座城市图鉴，看看你的本命城市',
}

const EN: Strings = {
  heroTitle: 'Your Best City',
  heroSub1: '12 Dimensions · 49 Cities',
  heroSub2: 'Find the city that fits you best',
  pickVersion: 'Choose Your Quiz',
  vBasicName: 'Basic',
  vBasicDesc: 'A quick quiz, about 3 minutes',
  vProName: 'Pro',
  vProDesc: 'More nuance, about 7 minutes',
  vFullName: 'Full',
  vFullDesc: 'All 100 questions, most accurate',
  questionsUnit: 'Qs',
  start: 'Start Quiz 🐾',
  gallery: '🏙️ City Gallery (49 Cities)',
  lastPrefix: '📮 Your last best city: ',
  footer: 'Animal Crossing Style City Quiz',
  shareTitle: 'Which city is your best match?',
  prev: '← Previous',
  quit: 'Quit',
  quitTitle: 'Quit the quiz?',
  quitContent: 'Your progress will not be saved',
  quitConfirm: 'Quit',
  cancel: 'Cancel',
  alsoFit: 'Also a Great Fit',
  profile: 'Your 12-Dimension Profile',
  reportTitle: '📋 12-Dimension Match Report',
  expand: '▼ Read the analysis',
  collapse: '▲ Collapse',
  you: 'You',
  cityAbbr: 'City',
  scoreUnit: '% match',
  strongTitle: 'Your standout traits',
  shareBtn: '📤 Share with Friends',
  saveBtn: '💾 Save Card',
  againBtn: '🔄 Take It Again',
  drawing: 'Drawing card…',
  saved: 'Saved to album',
  saveFail: 'Save failed, please retry',
  authTitle: 'Album access needed',
  authContent: 'Please allow saving images to your album in Settings',
  authConfirm: 'Open Settings',
  noRecord: 'No quiz record yet',
  matchHigh: 'Perfect Match',
  matchMid: 'Good Match',
  matchLow: 'Big Gap',
  tierAll: 'All',
  tier1: 'Tier-1',
  tierNew1: 'New Tier-1',
  tier2: 'Tier-2',
  galleryShare: '49-city gallery — find your best city',
}

export function strings(lang: Lang): Strings {
  return lang === 'en' ? EN : ZH
}

/** 城市等级标签（中/英） */
export function tierText(tier: string, lang: Lang): string {
  if (lang === 'en') {
    if (tier === '一线') return 'Tier-1 City'
    if (tier === '新一线') return 'New Tier-1 City'
    return 'Tier-2 City'
  }
  return tier + '城市'
}

/** 契合度文案（中/英） */
export function scoreLabelI18n(score: number, lang: Lang): string {
  if (lang === 'en') {
    if (score >= 92) return 'Destined City'
    if (score >= 85) return 'Soul Match'
    if (score >= 78) return 'Great Match'
    if (score >= 70) return 'Good Match'
    return 'Promising City'
  }
  if (score >= 92) return '天选之城'
  if (score >= 85) return '灵魂契合'
  if (score >= 78) return '高度匹配'
  if (score >= 70) return '相当合拍'
  return '潜力之城'
}
