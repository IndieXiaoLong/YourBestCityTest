import { CITIES, City } from '../../data/cities'
import { DIMS } from '../../data/dimensions'
import { dimList } from '../../utils/match'
import { getLang, strings, tierText, Lang, Strings } from '../../utils/i18n'

const TIER_KEYS = ['全部', '一线', '新一线', '二线']

Page({
  data: {
    lang: 'zh' as Lang,
    s: strings('zh') as Strings,
    tiers: [] as string[],
    tierIndex: 0,
    list: CITIES,
    detail: null as City | null,
    detailTier: '',
    detailDims: [] as ReturnType<typeof dimList>,
  },

  onShow() {
    const lang = getLang()
    const s = strings(lang)
    wx.setNavigationBarTitle({ title: lang === 'en' ? 'City Gallery' : '城市图鉴' })
    this.setData({
      lang,
      s,
      tiers: [s.tierAll, s.tier1, s.tierNew1, s.tier2],
    })
  },

  noop() { /* 阻止冒泡 */ },

  onTier(e: WechatMiniprogram.TouchEvent) {
    const tierIndex = Number(e.currentTarget.dataset.index)
    const key = TIER_KEYS[tierIndex]
    this.setData({
      tierIndex,
      list: tierIndex === 0 ? CITIES : CITIES.filter(c => c.tier === key),
    })
  },

  onCity(e: WechatMiniprogram.TouchEvent) {
    const city = e.currentTarget.dataset.city as City
    const isEn = this.data.lang === 'en'
    this.setData({
      detail: city,
      detailTier: tierText(city.tier, this.data.lang),
      detailDims: dimList(city.scores).map(d => ({
        ...d,
        name: isEn ? DIMS[d.key].nameEn : d.name,
      })),
    })
  },

  onCloseDetail() {
    this.setData({ detail: null })
  },

  onShareAppMessage() {
    return {
      title: this.data.s.galleryShare,
      path: '/pages/cities/cities',
    }
  },

  onShareTimeline() {
    return { title: this.data.s.galleryShare }
  },
})
