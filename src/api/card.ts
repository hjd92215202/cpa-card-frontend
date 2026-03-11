import api from './index'

/**
 * 知识卡片核心数据结构
 */
export interface Card {
  id?: number;
  user_id?: number;
  category_id: number;
  /** 
   * 章节名称：由后端通过 JOIN 查询返回。
   * 用于全科目复习和 PDF 导出时的自动分组。
   */
  category_name?: string; 
  title: string;
  essence: string;      // 正面精华
  insights?: string;    // 背面心得
  difficulty: number;   // 1-5 难度
  importance: string;   // A/B/C 级别
  interval_days: number;
  card_type?: string;   // qa, note, code
  next_review_date?: string;
  created_at?: string;
}

export const cardApi = {
  // --- 列表查询 ---
  
  /** 获取指定章节下的所有卡片 */
  listByCategory: (catId: number) =>
    api.get<Card[]>(`/cards?category_id=${catId}`),

  /** 
   * 获取指定科目下的所有卡片 (带章节名)
   * 主要用于：科目全局复习、PDF 讲义导出
   */
  listBySubject: (subjectId: number) =>
    api.get<Card[]>(`/cards/by_subject?subject_id=${subjectId}`),

  /** 全文搜索卡片 (标题 + 内容 + 心得) */
  search: (keyword: string) =>
    api.get<Card[]>(`/cards/search?keyword=${keyword}`),

  // --- 核心 CRUD ---

  /** 新建知识卡片 */
  create: (data: Partial<Card>) =>
    api.post<Card>('/cards', data),

  /** 更新知识卡片内容 */
  update: (id: number, data: Partial<Card>) =>
    api.put<Card>(`/cards/${id}`, data),

  /** 删除知识卡片 */
  delete: (id: number) => 
    api.delete(`/cards/${id}`),

  // --- 复习反馈 ---

  /** 
   * 提交复习进度
   * @param intervalDays 用户选择的下一次复习间隔（1, 3, 7天等）
   */
  review: (id: number, intervalDays: number) =>
    api.patch(`/cards/${id}/review`, { interval_days: intervalDays }),
}