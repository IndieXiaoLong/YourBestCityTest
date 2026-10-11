import { computeVector, matchCities, dimList, QuizResult } from '../../utils/match'
import { buildDimReports, DimReport } from '../../utils/report'
import { QUESTIONS } from '../../data/questions'
import { DIMS } from '../../data/dimensions'
import { CITY_GUIDES, CityGuide } from '../../data/cityGuide'
import { getLang, strings, tierText, scoreLabelI18n, Lang, Strings } from '../../utils/i18n'

interface StoredQuiz {
  version: number
  answers: string // "qid:optIndex,..."
  time: number
}

interface ReportView extends DimReport {
  levelText: string
}

function rebuildResult(stored: StoredQuiz): QuizResult | null {
  if (!stored || !stored.answers) return null
  const map = new Map<number, number>()
  stored.answers.split(',').forEach(pair => {
    const [qid, ai] = pair.split(':').map(Number)
    if (!isNaN(qid) && !isNaN(ai)) map.set(qid, ai)
  })
  const qs = QUESTIONS.filter(q => map.has(q.id))
  const answers = qs.map(q => map.get(q.id)!)
  if (!qs.length) return null
  const vector = computeVector(qs, answers)
  return matchCities(vector)
}

Page({
  data: {
    lang: 'zh' as Lang,
    s: strings('zh') as Strings,
    ready: false,
    top: null as QuizResult['top'] | null,
    label: '',
    tierLabel: '',
    alts: [] as QuizResult['matches'],
    dimRows: [] as ReturnType<typeof dimList>,
    guide: null as CityGuide | null,
    reports: [] as ReportView[],
    expandedReports: {} as Record<string, boolean>,
    strongDims: [] as { key: string; name: string; icon: string }[],
    mustVisitTitle: '',
    whatToEatTitle: '',
    reportTip: '',
    cardW: 600,
    cardH: 900,
  },

  result: null as QuizResult | null,

  onLoad(_query: Record<string, string | undefined>) {
    const lang = getLang()
    const s = strings(lang)
    this.setData({ lang, s })
    wx.setNavigationBarTitle({ title: lang === 'en' ? 'My Best City' : '我的本命城市' })
    const stored = wx.getStorageSync('lastQuiz') as StoredQuiz | ''
    const result = stored ? rebuildResult(stored) : null
    if (!result) {
      wx.showToast({ title: s.noRecord, icon: 'none' })
      setTimeout(() => wx.reLaunch({ url: '/pages/index/index' }), 1200)
      return
    }
    this.result = result
    this.renderResult(result)
  },

  renderResult(result: QuizResult) {
    const { top, vector, matches, strongDims } = result
    const { lang, s } = this.data
    const isEn = lang === 'en'
    wx.setStorageSync('lastResult', { city: top.city.name, score: top.score })

    const levelText = (lv: DimReport['matchLevel']) =>
      lv === '高度契合' ? s.matchHigh : lv === '基本合拍' ? s.matchMid : s.matchLow

    this.setData({
      ready: true,
      top,
      label: scoreLabelI18n(top.score, lang),
      tierLabel: tierText(top.city.tier, lang),
      alts: matches.slice(1, 4),
      dimRows: dimList(vector).map(d => ({ ...d, name: isEn ? DIMS[d.key].nameEn : d.name })),
      guide: CITY_GUIDES[top.city.name] || null,
      reports: buildDimReports(vector, top.city).map(r => ({
        ...r,
        name: isEn ? DIMS[r.key].nameEn : r.name,
        levelText: levelText(r.matchLevel),
      })),
      strongDims: strongDims.map(k => ({
        key: k,
        name: isEn ? DIMS[k].nameEn : DIMS[k].name,
        icon: DIMS[k].icon,
      })),
      mustVisitTitle: isEn ? `📍 Must-visit in ${top.city.name}` : `📍 ${top.city.name}必打卡`,
      whatToEatTitle: isEn ? `🍜 What to eat in ${top.city.name}` : `🍜 ${top.city.name}吃什么`,
      reportTip: isEn
        ? `Tap a dimension to read how you match ${top.city.name}`
        : `点击每个维度，查看你与${top.city.name}的详细解读`,
    })
  },

  /** 展开/收起某个维度的匹配报告 */
  onToggleReport(e: WechatMiniprogram.TouchEvent) {
    const key = e.currentTarget.dataset.key as string
    this.setData({ [`expandedReports.${key}`]: !this.data.expandedReports[key] })
  },

  onShareAppMessage() {
    const top = this.data.top
    const isEn = this.data.lang === 'en'
    return {
      title: top
        ? (isEn
          ? `My best city is ${top.city.name} — ${top.score}% match! What's yours?`
          : `我的本命城市是${top.city.name}！契合度 ${top.score}%，你呢？`)
        : this.data.s.shareTitle,
      path: '/pages/lang/lang',
    }
  },

  onShareTimeline() {
    const top = this.data.top
    const isEn = this.data.lang === 'en'
    return {
      title: top
        ? (isEn
          ? `My best city is ${top.city.name} — ${top.score}% match`
          : `我的本命城市是${top.city.name}，契合度 ${top.score}%`)
        : this.data.s.shareTitle,
    }
  },

  onAgain() {
    wx.reLaunch({ url: '/pages/index/index' })
  },

  /** 绘制并保存结果卡片到相册 */
  async onSaveCard() {
    if (!this.result) return
    const s = this.data.s
    wx.showLoading({ title: s.drawing, mask: true })
    try {
      const path = await this.drawCard()
      await new Promise<void>((resolve, reject) => {
        wx.saveImageToPhotosAlbum({
          filePath: path,
          success: () => resolve(),
          fail: (err) => reject(err),
        })
      })
      wx.hideLoading()
      wx.showToast({ title: s.saved, icon: 'success' })
    } catch (err: any) {
      wx.hideLoading()
      const msg = err && err.errMsg ? err.errMsg : ''
      if (msg.indexOf('auth') >= 0 || msg.indexOf('deny') >= 0) {
        wx.showModal({
          title: s.authTitle,
          content: s.authContent,
          confirmText: s.authConfirm,
          cancelText: s.cancel,
          success: (res) => { if (res.confirm) wx.openSetting() },
        })
      } else {
        wx.showToast({ title: s.saveFail, icon: 'none' })
      }
    }
  },

  /** 在 2d canvas 上绘制动森风结果卡片，返回临时图片路径 */
  drawCard(): Promise<string> {
    const result = this.result!
    const isEn = this.data.lang === 'en'
    const W = this.data.cardW
    const H = this.data.cardH
    return new Promise((resolve, reject) => {
      wx.createSelectorQuery()
        .select('#shareCard')
        .fields({ node: true, size: true })
        .exec((res) => {
          const canvas = res[0] && (res[0].node as unknown as WechatMiniprogram.Canvas)
          if (!canvas) { reject(new Error('canvas not found')); return }
          const ctx = canvas.getContext('2d')
          const dpr = (wx.getSystemInfoSync().pixelRatio) || 2
          canvas.width = W * dpr
          canvas.height = H * dpr
          ctx.scale(dpr, dpr)

          const ink = '#5B4A3A'
          const round = (x: number, y: number, w: number, h: number, r: number) => {
            ctx.beginPath()
            ctx.moveTo(x + r, y)
            ctx.arcTo(x + w, y, x + w, y + h, r)
            ctx.arcTo(x + w, y + h, x, y + h, r)
            ctx.arcTo(x, y + h, x, y, r)
            ctx.arcTo(x, y, x + w, y, r)
            ctx.closePath()
          }

          // 背景
          ctx.fillStyle = '#FFF6E5'
          ctx.fillRect(0, 0, W, H)

          // 外框
          ctx.lineWidth = 5
          ctx.strokeStyle = ink
          ctx.fillStyle = '#FFFDF6'
          round(24, 24, W - 48, H - 48, 36)
          ctx.fill()
          ctx.stroke()

          // 品牌
          ctx.fillStyle = '#3E7C4F'
          ctx.font = 'bold 26px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('🍃 Your Best City Test', W / 2, 84)

          ctx.fillStyle = '#9A7B5F'
          ctx.font = '20px sans-serif'
          ctx.fillText(isEn ? 'My best city is' : '我的本命城市是', W / 2, 124)

          // 城市名
          ctx.fillStyle = ink
          ctx.font = 'bold 84px sans-serif'
          ctx.fillText(result.top.city.name, W / 2, 226)

          // 契合度徽章
          ctx.fillStyle = '#7CC47F'
          round(W / 2 - 150, 258, 300, 72, 36)
          ctx.fill()
          ctx.lineWidth = 4
          ctx.stroke()
          ctx.fillStyle = '#FFFFFF'
          ctx.font = 'bold 34px sans-serif'
          ctx.fillText(isEn ? `${result.top.score}% Match` : `契合度 ${result.top.score}%`, W / 2, 306)

          // 标签
          ctx.fillStyle = '#9A7B5F'
          ctx.font = '24px sans-serif'
          ctx.fillText(result.top.city.tags.map((t: string) => `#${t}`).join('  '), W / 2, 366)

          // 分割线
          ctx.strokeStyle = '#E8D9C0'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(70, 400)
          ctx.lineTo(W - 70, 400)
          ctx.stroke()

          // 维度条（取用户画像前 6 个高维）
          const dims = dimList(result.vector).slice().sort((a, b) => b.value - a.value).slice(0, 6)
          ctx.textAlign = 'left'
          dims.forEach((d, i) => {
            const y = 440 + i * 66
            const dimName = isEn ? DIMS[d.key].nameEn : d.name
            ctx.fillStyle = ink
            ctx.font = '22px sans-serif'
            ctx.fillText(`${d.icon} ${dimName}`, 70, y + 20)
            // 条底
            ctx.fillStyle = '#F3E8D2'
            round(220, y, 280, 28, 14)
            ctx.fill()
            // 条值
            ctx.fillStyle = d.color
            const bw = Math.max(14, 280 * d.value / 100)
            round(220, y, bw, 28, 14)
            ctx.fill()
            ctx.fillStyle = ink
            ctx.font = 'bold 22px sans-serif'
            ctx.fillText(String(d.value), 512, y + 21)
          })

          // 底部
          ctx.fillStyle = '#B99B7A'
          ctx.font = '20px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(
            isEn ? '12 dimensions · 49 cities · Scan to find your best city' : '12 个维度 · 49 座城市 · 扫码测测你的本命城市',
            W / 2, H - 56
          )

          wx.canvasToTempFilePath({
            canvas,
            success: (r) => resolve(r.tempFilePath),
            fail: (e) => reject(e),
          } as WechatMiniprogram.CanvasToTempFilePathOption)
        })
    })
  },
})
