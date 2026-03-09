<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- 顶部导航 -->
    <nav class="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
      <div class="flex items-center gap-2">
        <div class="bg-blue-600 p-2 rounded-lg">
          <el-icon class="text-white" :size="20"><Reading /></el-icon>
        </div>
        <span class="font-bold text-xl tracking-tight text-gray-800">CPA Polymath</span>
      </div>
      <el-button link :icon="Setting" @click="router.push('/admin/kb')">管理知识库代入口</el-button>
    </nav>

    <!-- 主体内容 -->
    <main class="flex-1 max-w-6xl mx-auto w-full p-8">
      <header class="mb-10">
        <h2 class="text-3xl font-extrabold text-gray-900">你好, 备考人 📚</h2>
        <p class="text-gray-500 mt-2">今天也要为了通过 CPA 而努力，请选择一个科目开始复习。</p>
      </header>

      <!-- 科目卡片网格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="sub in subjects" :key="sub.id"
          class="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100 flex flex-col group"
          @click="startStudy(sub)"
        >
          <div class="flex justify-between items-start mb-6">
            <div 
              class="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
              :style="{ backgroundColor: sub.theme_color }"
            >
              <el-icon :size="24"><Collection /></el-icon>
            </div>
            <el-tag type="info" round effect="plain">学习中</el-tag>
          </div>
          
          <h3 class="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
            {{ sub.name }}
          </h3>
          <p class="text-gray-400 text-sm mt-2 flex-1">{{ sub.description || '暂无描述' }}</p>
          
          <div class="mt-8 flex items-center justify-between">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">进入复习</span>
            <div class="bg-gray-100 p-2 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>

        <!-- 快速添加卡片 -->
        <div 
          class="border-2 border-dashed border-gray-200 rounded-3xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-all cursor-pointer"
          @click="router.push('/admin/kb')"
        >
          <el-icon :size="32"><Plus /></el-icon>
          <span class="mt-2 font-medium">添加新科目</span>
        </div>
      </div>
    </main>

    <footer class="p-8 text-center text-gray-400 text-sm">
      距离 2025 CPA 考试还有 180 天 | 越努力 越幸运
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Reading, Setting, Collection, ArrowRight, Plus } from '@element-plus/icons-vue'
import { subjectApi, type Subject } from '../api/subject'
import { useAppStore } from '../store/appStore'

const router = useRouter()
const appStore = useAppStore()
const subjects = ref<Subject[]>([])

onMounted(async () => {
  const res = await subjectApi.list()
  subjects.value = res as any
})

const startStudy = (sub: Subject) => {
  // 设置 Store
  appStore.setSubject(sub.id, sub.name, sub.theme_color)
  // 跳转到复习模式
  // 注意：这里默认进入该科目的第一个章节或全局复习
  router.push('/study')
}
</script>