import api from './index'

export interface Subject {
  id: number;
  name: string;
  description?: string;
  theme_color?: string;
}

export const subjectApi = {
  list: () => api.get<Subject[]>('/subjects'),
  create: (data: Partial<Subject>) => api.post<Subject>('/subjects', data),
}