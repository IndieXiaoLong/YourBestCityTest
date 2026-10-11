// 12 个测试维度的元数据
export type DimKey =
  | 'pace'      // 生活节奏（高分 = 快节奏）
  | 'social'    // 社交活力
  | 'career'    // 事业发展
  | 'trend'     // 新潮创意
  | 'history'   // 历史人文
  | 'nature'    // 自然户外
  | 'waterfront'// 滨水偏好
  | 'climate'   // 气候温暖
  | 'food'      // 美食烟火
  | 'luxury'    // 精致消费
  | 'global'    // 国际开放
  | 'stable'    // 安稳宜居

export interface DimMeta {
  key: DimKey
  name: string
  nameEn: string
  icon: string
  color: string
}

export const DIM_ORDER: DimKey[] = [
  'pace', 'social', 'career', 'trend', 'history', 'nature',
  'waterfront', 'climate', 'food', 'luxury', 'global', 'stable',
]

export const DIMS: Record<DimKey, DimMeta> = {
  pace:       { key: 'pace',       name: '生活节奏', nameEn: 'Pace of Life',    icon: '⏰', color: '#F4A259' },
  social:     { key: 'social',     name: '社交活力', nameEn: 'Social Life',     icon: '🎉', color: '#EE6C4D' },
  career:     { key: 'career',     name: '事业发展', nameEn: 'Career Growth',   icon: '🚀', color: '#3D5A80' },
  trend:      { key: 'trend',      name: '新潮创意', nameEn: 'Trends & Ideas',  icon: '💡', color: '#9B5DE5' },
  history:    { key: 'history',    name: '历史人文', nameEn: 'History & Culture', icon: '🏛️', color: '#8C6D4F' },
  nature:     { key: 'nature',     name: '自然户外', nameEn: 'Nature & Outdoors', icon: '🌲', color: '#57A773' },
  waterfront: { key: 'waterfront', name: '滨水偏好', nameEn: 'Waterfront Living', icon: '🌊', color: '#4EA5D9' },
  climate:    { key: 'climate',    name: '气候温暖', nameEn: 'Warm Climate',    icon: '☀️', color: '#F9C74F' },
  food:       { key: 'food',       name: '美食烟火', nameEn: 'Food Scene',      icon: '🍜', color: '#E07A5F' },
  luxury:     { key: 'luxury',     name: '精致消费', nameEn: 'Refined Living',  icon: '💎', color: '#B08968' },
  global:     { key: 'global',     name: '国际开放', nameEn: 'Global Openness', icon: '🌍', color: '#5E8C61' },
  stable:     { key: 'stable',     name: '安稳宜居', nameEn: 'Stability',       icon: '🏡', color: '#6B8F71' },
}
