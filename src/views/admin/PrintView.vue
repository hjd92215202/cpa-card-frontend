<template>
  <div class="print-container bg-white p-10 min-h-screen">
    <!-- 头部信息 -->
    <header class="text-center mb-10 border-b-2 border-slate-900 pb-6">
      <h1 class="text-4xl font-black text-slate-900">{{ appStore.currentSubjectName }} - 精华讲义</h1>
      <p class="text-slate-500 mt-4 italic">生成时间：{{ new Date().toLocaleDateString() }} | 备考人：Polymath Hub 用户</p>
    </header>

    <!-- 卡片列表 -->
    <div class="space-y-12">
      <section 
        v-for="card in cards" 
        :key="card.id" 
        class="card-print-item break-inside-avoid border-l-4 border-slate-200 pl-6 py-2"
      >
        <div class="flex justify-between items-baseline mb-4">
          <h2 class="text-2xl font-bold text-slate-800">{{ card.title }}</h2>
          <span class="text-sm font-mono text-slate-400 uppercase">[重要度: {{ card.importance }}]</span>
        </div>

        <div class="grid grid-cols-1 gap-6">
          <!-- 正面：知识精华 -->
          <div class="essence-block">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">● 知识精华</h3>
            <div class="prose prose-slate max-w-none">
              <MdPreview :modelValue="card.essence" />
            </div>
          </div>

          <!-- 背面：备考心得 -->
          <div v-if="card.insights" class="insights-block bg-slate-50 p-4 rounded-lg">
            <h3 class="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">★ 备考心得 / 坑点</h3>
            <div class="prose prose-indigo max-w-none italic text-sm">
              <MdPreview :modelValue="card.insights" />
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 打印控制按钮（打印时会自动隐藏） -->
    <div class="fixed bottom-10 right-10 no-print flex gap-4">
      <el-button type="info" size="large" circle :icon="ArrowLeft" @click="router.back()" />
      <el-button type="primary" size="large" shadow @click="handlePrint">
        确认导出 PDF / 打印
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import { cardApi, type Card } from '../../api/card'
import { useAppStore } from '../../store/appStore'

const router = useRouter()
const appStore = useAppStore()
const cards = ref<Card[]>([])

onMounted(async () => {
  if (!appStore.currentSubjectId) {
    router.push('/')
    return
  }
  // 加载该科目下的全量卡片用于导出
  const res = await cardApi.listBySubject(appStore.currentSubjectId)
  cards.value = res as any
})

const handlePrint = () => {
  window.print()
}
</script>

<style scoped>
/* 核心：打印样式控制 */
@media print {
  .no-print {
    display: none !important;
  }
  
  body {
    background-color: white !important;
    padding: 0 !important;
  }

  .print-container {
    padding: 0 !important;
  }

  /* 防止卡片在页面底部被截断 */
  .card-print-item {
    page-break-inside: avoid;
    break-inside: avoid;
    border-color: #e2e8f0 !important; /* 强制显示边框颜色 */
    margin-bottom: 3rem !important;
  }

  /* 移除链接后面的 URL 显示 */
  a[href]:after {
    content: "" !important;
  }
}

/* 屏幕显示时的修饰 */
.card-print-item {
  transition: all 0.3s;
}

:deep(.md-editor-preview) {
  font-size: 14px;
}
</style>