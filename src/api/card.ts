import api from './index'

export interface Card {
  id?: number;
  category_id: number;
  title: string;
  essence: string;
  insights?: string;
  difficulty: number;
  importance: string;
  interval_days: number;
  card_type?: string;
  next_review_date?: string;
}

export const cardApi = {
  // 1. 获取章节下的卡片
  listByCategory: (catId: number) =>
    api.get<Card[]>(`/cards?category_id=${catId}`),

  // 新增：按科目获取卡片
  listBySubject: (subjectId: number) =>
    api.get<Card[]>(`/cards/by_subject?subject_id=${subjectId}`),

  // 2. 创建卡片
  create: (data: Partial<Card>) =>
    api.post<Card>('/cards', data),

  // 3. 全局搜索
  search: (keyword: string) =>
    api.get<Card[]>(`/cards/search?keyword=${keyword}`),

  /**
   * 4. 提交复习进度 (新增这个方法)
   * 对接后端: PATCH /api/cards/:id/review
   */
  review: (id: number, intervalDays: number) =>
    api.patch(`/cards/${id}/review`, { interval_days: intervalDays }),

  update: (id: number, data: Partial<Card>) =>
    api.put<Card>(`/cards/${id}`, data),

  delete: (id: number) => api.delete(`/cards/${id}`),
}