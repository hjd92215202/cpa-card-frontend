import api from './index'

export interface Card {
  id?: number;
  category_id: number;
  title: string;
  essence: string;      // 正面：知识精华
  insights?: string;    // 背面：备考心得
  difficulty: number;   // 难度等级 (1-5)
  importance: string;   // 考试重要等级 (A/B/C)
  interval_days: number; // 复习间隔
  next_review_date?: string;
}

export const cardApi = {
  // 获取章节下的卡片
  listByCategory: (catId: number) => 
    api.get<Card[]>(`/cards?category_id=${catId}`),
    
  // 创建卡片
  create: (data: Partial<Card>) => api.post<Card>('/cards', data),
  
  // 全局搜索
  search: (keyword: string) => 
    api.get<Card[]>(`/cards/search?keyword=${keyword}`),
}