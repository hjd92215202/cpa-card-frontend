import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    currentSubjectId: null as number | null,
    currentSubjectName: '' as string,
    currentCategoryId: null as number | null,   // 新增：当前章节ID
    currentCategoryName: '' as string,         // 新增：当前章节名称
    themeColor: '#1890ff',
  }),
  actions: {
    setSubject(id: number, name: string, color?: string) {
      this.currentSubjectId = id
      this.currentSubjectName = name
      this.currentCategoryId = null // 切换科目时清空章节
      if (color) this.themeColor = color
      document.documentElement.style.setProperty('--primary-color', color || '#1890ff')
    },
    // 新增：设置当前章节
    setCategory(id: number, name: string) {
      this.currentCategoryId = id
      this.currentCategoryName = name
    }
  }
})