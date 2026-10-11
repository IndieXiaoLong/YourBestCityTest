import { setLang } from '../../utils/i18n'

Page({
  data: {
    showWelcome: false,
  },

  onZh() {
    setLang('zh')
    wx.reLaunch({ url: '/pages/index/index' })
  },

  onEn() {
    setLang('en')
    // 英文版：先展示「欢迎来到中国」过渡屏
    this.setData({ showWelcome: true })
  },

  onContinue() {
    wx.reLaunch({ url: '/pages/index/index' })
  },
})
