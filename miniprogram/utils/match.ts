// 匹配算法：汇总答题维度向量 → 与 49 城逐一计算契合度
import { DIM_ORDER, DimKey, DIMS } from '../data/dimensions'
import { CITIES, City } from '../data/cities'
import { Question, QuestionOption } from '../data/questions'

export type DimVector = Record<DimKey, number>

export interface CityMatch {
  city: City
  score: number // 0~100 契合度
}

export interface QuizResult {
  vector: DimVector          // 用户维度画像（0~100）
  matches: CityMatch[]       // 按契合度降序的完整排名
  top: CityMatch             // 本命城市
  strongDims: DimKey[]       // 用户最突出的 3 个维度
}

const clamp = (v: number) => Math.max(0, Math.min(100, v))

/** 初始画像：全部维度从 50 起步 */
export function initVector(): DimVector {
  const v = {} as DimVector
  DIM_ORDER.forEach(k => { v[k] = 50 })
  return v
}

/** 应用一个选项的维度影响 */
export function applyOption(v: DimVector, opt: QuestionOption): DimVector {
  const next = { ...v }
  opt.e.forEach(([dim, delta]) => {
    const cur = typeof next[dim] === 'number' ? next[dim] : 50
    next[dim] = clamp(cur + delta)
  })
  return next
}

/**
 * 由答题记录计算最终画像。
 * 将题目总影响量归一化，使不同题量的版本可比：
 * 用户向量 = 50 + Σeffect * scale，scale 让满配影响大约覆盖 ±40 区间
 */
export function computeVector(questions: Question[], answers: number[]): DimVector {
  const raw = {} as Record<DimKey, number>
  DIM_ORDER.forEach(k => { raw[k] = 0 })
  let answered = 0
  questions.forEach((q, i) => {
    const ai = answers[i]
    if (ai === undefined || ai < 0 || !q.opts[ai]) return
    answered++
    q.opts[ai].e.forEach(([dim, delta]) => { raw[dim] += delta })
  })
  if (answered === 0) return initVector()
  // 每道题平均影响约 2.5 个维度、单维度 ±3 封顶；
  // 让「全程选极端同一方向」大约落在 90+/10-，普通混合答案在 50 附近展开
  const perDimExpect = answered * 0.42 // 单个维度期望被影响的次数
  const scale = perDimExpect > 0 ? 40 / (perDimExpect * 2) : 1
  const v = initVector()
  DIM_ORDER.forEach(k => { v[k] = clamp(Math.round(50 + raw[k] * scale)) })
  return v
}

/** 计算用户画像与所有城市的契合度排名 */
export function matchCities(vector: DimVector): QuizResult {
  const matches: CityMatch[] = CITIES.map(city => {
    let sum = 0
    DIM_ORDER.forEach(k => { sum += Math.abs(vector[k] - city.scores[k]) })
    // 平均距离 0~100 → 契合度 100~0，做轻微拉伸让区分度更直观
    const avg = sum / DIM_ORDER.length
    const score = Math.max(0, Math.round(100 - avg * 1.35))
    return { city, score }
  }).sort((a, b) => b.score - a.score)

  const strongDims = DIM_ORDER.slice().sort((a, b) => vector[b] - vector[a]).slice(0, 3)

  return { vector, matches, top: matches[0], strongDims }
}

/** 契合度文案 */
export function scoreLabel(score: number): string {
  if (score >= 92) return '天选之城'
  if (score >= 85) return '灵魂契合'
  if (score >= 78) return '高度匹配'
  if (score >= 70) return '相当合拍'
  return '潜力之城'
}

/** 维度列表展示辅助 */
export function dimList(vector: DimVector) {
  return DIM_ORDER.map(k => ({
    key: k,
    name: DIMS[k].name,
    icon: DIMS[k].icon,
    color: DIMS[k].color,
    value: vector[k],
  }))
}
