import { QUESTION_COUNTS, QuizVersion } from '../../data/questions'
import { getLang, setLang, strings, Lang, Strings } from '../../utils/i18n'

interface VersionItem {
  key: QuizVersion
  name: string
  icon: string
  desc: string
  count: number
}

Page({
  data: {
    lang: 'zh' as Lang,
    s: strings('zh') as Strings,
    versions: [] as VersionItem[],
    version: 'basic' as QuizVersion,
    lastCity: '',
  },

  onShow() {
    const lang = getLang()
    const s = strings(lang)
    wx.setNavigationBarTitle({ title: 'Your Best City Test' })
    const last = wx.getStorageSync('lastResult') as { city?: string } | ''
    this.setData({
      lang,
      s,
      versions: [
        { key: 'basic', name: s.vBasicName, icon: '🌱', desc: s.vBasicDesc, count: QUESTION_COUNTS.basic },
        { key: 'pro', name: s.vProName, icon: '🌿', desc: s.vProDesc, count: QUESTION_COUNTS.pro },
        { key: 'full', name: s.vFullName, icon: '🌳', desc: s.vFullDesc, count: QUESTION_COUNTS.full },
      ],
      lastCity: last && last.city ? last.city : '',
    })
  },

  onSwitchLang() {
    setLang(this.data.lang === 'en' ? 'zh' : 'en')
    this.onShow()
  },

  onSelectVersion(e: WechatMiniprogram.TouchEvent) {
    this.setData({ version: e.currentTarget.dataset.key as QuizVersion })
  },

  onStart() {
    wx.navigateTo({ url: `/pages/quiz/quiz?version=${this.data.version}` })
  },

  onCities() {
    wx.navigateTo({ url: '/pages/cities/cities' })
  },

  onLastResult() {
    wx.navigateTo({ url: '/pages/result/result?from=storage' })
  },

  onShareAppMessage() {
    return {
      title: this.data.s.shareTitle,
      path: '/pages/lang/lang',
    }
  },

  onShareTimeline() {
    return { title: this.data.s.shareTitle }
  },
})
