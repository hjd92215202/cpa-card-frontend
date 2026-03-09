import api from './index'

export interface Category {
  id: number;
  subject_id: number;
  parent_id?: number | null;
  name: string;
  sort_order: number;
}

export const categoryApi = {
  listBySubject: (subjectId: number) => 
    api.get<Category[]>(`/categories?subject_id=${subjectId}`),
  create: (data: Partial<Category>) => api.post<Category>('/categories', data),
}