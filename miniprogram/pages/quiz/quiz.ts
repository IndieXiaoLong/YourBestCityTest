import { pickQuestions, Question, QuizVersion } from '../../data/questions'
import { QUESTIONS_EN } from '../../data/questionsEn'
import { getLang, strings, Lang, Strings } from '../../utils/i18n'

interface OptionView {
  t: string
  letter: string
}

interface QuestionView {
  id: number
  t: string
  opts: OptionView[]
}

const LETTERS = ['A', 'B', 'C', 'D']

Page({
  data: {
    lang: 'zh' as Lang,
    s: strings('zh') as Strings,
    questions: [] as Question[],
    view: null as QuestionView | null,
    index: 0,
    total: 0,
    percent: 0,
    stepText: '',
    picked: -1,
  },

  answers: [] as number[],
  picking: false,

  onLoad(query: Record<string, string | undefined>) {
    const lang = getLang()
    const version = (query.version || 'basic') as QuizVersion
    const questions = pickQuestions(version)
    this.answers = new Array(questions.length).fill(-1)
    wx.setNavigationBarTitle({ title: lang === 'en' ? 'Quiz' : '答题中' })
    this.setData({
      lang,
      s: strings(lang),
      questions,
      total: questions.length,
    })
    this.showQuestion(0)
  },

  buildView(q: Question): QuestionView {
    if (this.data.lang === 'en') {
      const en = QUESTIONS_EN[q.id]
      if (en) {
        return { id: q.id, t: en.t, opts: en.opts.map((t, i) => ({ t, letter: LETTERS[i] })) }
      }
    }
    return { id: q.id, t: q.t, opts: q.opts.map((o, i) => ({ t: o.t, letter: LETTERS[i] })) }
  },

  showQuestion(index: number) {
    const { questions, total, lang } = this.data
    const q = questions[index]
    this.setData({
      index,
      view: this.buildView(q),
      picked: this.answers[index],
      percent: Math.round((index / total) * 100),
      stepText: lang === 'en'
        ? `Question ${index + 1} / ${total}`
        : `第 ${index + 1} / ${total} 题`,
    })
  },

  onPick(e: WechatMiniprogram.TouchEvent) {
    if (this.picking) return
    const optIndex = Number(e.currentTarget.dataset.index)
    const { index, total } = this.data
    this.answers[index] = optIndex
    this.setData({ picked: optIndex })

    // 短暂停顿展示选中态，再自动进入下一题
    this.picking = true
    setTimeout(() => {
      this.picking = false
      if (index + 1 >= total) {
        this.finish()
      } else {
        this.showQuestion(index + 1)
      }
    }, 260)
  },

  onPrev() {
    if (this.data.index > 0) this.showQuestion(this.data.index - 1)
  },

  onQuit() {
    const s = this.data.s
    wx.showModal({
      title: s.quitTitle,
      content: s.quitContent,
      confirmText: s.quitConfirm,
      cancelText: s.cancel,
      confirmColor: '#E07A5F',
      success: (res) => {
        if (res.confirm) wx.navigateBack()
      },
    })
  },

  finish() {
    // 序列化答题记录传给结果页（题目 id + 选项下标，避免传大对象）
    const payload = this.data.questions.map((q, i) => `${q.id}:${this.answers[i]}`).join(',')
    wx.setStorageSync('lastQuiz', {
      version: this.data.total,
      answers: payload,
      time: Date.now(),
    })
    wx.redirectTo({ url: '/pages/result/result' })
  },

  onShareAppMessage() {
    return {
      title: this.data.s.shareTitle,
      path: '/pages/lang/lang',
    }
  },
})
