import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    currentSubjectId: null as number | null,
    currentSubjectName: '' as string,
    themeColor: '#1890ff', // 动态主题色
  }),
  actions: {
    setSubject(id: number, name: string, color?: string) {
      this.currentSubjectId = id
      this.currentSubjectName = name
      if (color) this.themeColor = color
      // 切换主题色到 CSS 变量，供 Tailwind 使用
      document.documentElement.style.setProperty('--primary-color', color || '#1890ff')
    }
  }
})