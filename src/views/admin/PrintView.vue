<template>
  <div class="print-container bg-white min-h-screen font-sans antialiased">
    <!-- 1. 讲义页眉：极简专业感 -->
    <header class="text-center pt-10 pb-12 border-b-2 border-slate-900 mx-10 mb-12 relative overflow-hidden">
      <!-- 装饰背景图案 (打印时会被压缩或隐藏，增强屏幕观感) -->
      <div class="absolute -right-2 -top-4 text-slate-50 opacity-10 select-none no-print">
        <el-icon :size="150"><Collection /></el-icon>
      </div>

      <h1 class="text-5xl font-black text-slate-900 tracking-tighter mb-5 uppercase">
        {{ appStore.currentSubjectName }} · 考点精华讲义
      </h1>
      
      <div class="flex justify-center items-center gap-10 text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
        <div class="flex items-center gap-1.5"><el-icon><User /></el-icon> {{ userStore.userInfo?.username || 'Polymath' }}</div>
        <div class="flex items-center gap-1.5"><el-icon><Calendar /></el-icon> {{ new Date().toLocaleDateString() }}</div>
        <div class="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded text-slate-600">Total Nodes: {{ cards.length }}</div>
      </div>
    </header>

    <!-- 2. 讲义主体内容 -->
    <div class="px-10 pb-28">
      <div v-for="(group, catName, index) in groupedCards" :key="catName" class="chapter-section">
        <!-- 章节大标题：书籍排版风格 -->
        <div 
          class="chapter-header flex items-end gap-4 border-b-2 border-indigo-100 pb-3 mb-10"
          :class="index === 0 ? 'mt-4' : 'mt-20'"
        >
          <div class="bg-indigo-600 text-white w-14 h-14 flex items-center justify-center rounded-2xl text-2xl font-black font-mono shadow-lg shadow-indigo-200">
            {{ (index + 1).toString().padStart(2, '0') }}
          </div>
          <h2 class="text-3xl font-black text-slate-800 tracking-tight">{{ catName }}</h2>
        </div>

        <div class="space-y-12">
          <section 
            v-for="card in group" 
            :key="card.id" 
            :class="['card-item', card.importance]"
          >
            <!-- 卡片头部：精简布局 -->
            <div class="flex justify-between items-start mb-8">
              <div class="flex-1">
                <h3 class="text-2xl font-black text-slate-900 leading-tight">
                  <span class="text-indigo-500/30 mr-2 font-mono text-lg">#</span>{{ card.title }}
                </h3>
              </div>
              <div :class="['importance-badge px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase text-white shadow-sm', 
                            card.importance === 'A' ? 'bg-red-600' : 
                            card.importance === 'B' ? 'bg-blue-600' : 'bg-slate-500']">
                {{ card.importance }} Priority
              </div>
            </div>

            <!-- 正面内容：核心考点 (强制透明背景) -->
            <div class="content-block mb-10">
              <div class="prose prose-slate prose-base max-w-none print-typography">
                <MdPreview :modelValue="card.essence" theme="light" />
              </div>
            </div>

            <!-- 背面内容：笔记心得 (精致的引用块样式) -->
            <div v-if="card.insights" class="insights-container">
              <div class="flex items-center gap-2 mb-4">
                <div class="h-px flex-1 bg-slate-200/50"></div>
                <div class="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2 px-4">
                  <el-icon><InfoFilled /></el-icon> Mastery Insights
                </div>
                <div class="h-px flex-1 bg-slate-200/50"></div>
              </div>
              <div class="prose prose-indigo prose-sm italic text-slate-600 bg-white/50 p-6 rounded-2xl border border-dashed border-slate-200 shadow-inner">
                <MdPreview :modelValue="card.insights" theme="light" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- 3. 操作悬浮栏 -->
    <div class="fixed bottom-10 left-1/2 -translate-x-1/2 no-print flex items-center gap-6 bg-slate-900/95 backdrop-blur-xl p-4 px-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[100] border border-white/10">
      <el-button type="info" plain round class="border-slate-700 text-slate-300 hover:bg-slate-800" @click="router.back()">
        <el-icon class="mr-1"><ArrowLeft /></el-icon> 返回
      </el-button>
      <div class="w-px h-6 bg-slate-700 mx-1"></div>
      <el-button type="primary" size="large" round class="bg-indigo-600 border-none px-14 font-black shadow-xl shadow-indigo-500/20 hover:scale-105 transition-all" @click="handlePrint">
        <el-icon class="mr-2"><Printer /></el-icon> 确认导出 PDF
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Printer, InfoFilled, User, Calendar, Collection } from '@element-plus/icons-vue'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import { cardApi, type Card } from '../../api/card'
import { useAppStore } from '../../store/appStore'
import { useUserStore } from '../../store/userStore'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const cards = ref<Card[]>([])

onMounted(async () => {
  if (!appStore.currentSubjectId) {
    router.push('/')
    return
  }
  try {
    const res = await cardApi.listBySubject(appStore.currentSubjectId)
    cards.value = res as any
  } catch (err) {
    console.error('Failed to fetch data for printing')
  }
})

const groupedCards = computed(() => {
  const groups: Record<string, Card[]> = {}
  cards.value.forEach(card => {
    const chapterName = (card as any).category_name || "待分类核心考点"
    if (!groups[chapterName]) groups[chapterName] = []
    groups[chapterName].push(card)
  })
  return groups
})

const handlePrint = () => {
  window.print()
}
</script>

<style scoped>
/* 1. 强力穿透：彻底消除所有 Markdown 插件自带的白色背景 */
:deep(.md-editor-preview),
:deep(.md-editor-preview-wrapper),
:deep(.md-editor-content),
:deep(.default-theme),
:deep(.md-editor-preview-wrapper *) {
  background-color: transparent !important;
  background: none !important;
  border: none !important;
  box-shadow: none !important;
}

/* 2. 屏幕预览基础样式 */
.print-container {
  max-width: 900px;
  margin: 30px auto;
  background-color: white;
  box-shadow: 0 10px 80px rgba(0,0,0,0.06);
  border-radius: 20px;
}

.card-item {
  padding: 40px;
  border-radius: 20px;
  margin-bottom: 30px;
  background-color: #f8fafc;
  /* 屏幕显示时的边框 */
  border: 1px solid #f1f5f9;
  border-left: 12px solid #94a3b8; 
}

/* 屏幕显示时的具体颜色 */
.card-item.A { border-left-color: #ef4444; background-color: #fff9f9; }
.card-item.B { border-left-color: #3b82f6; background-color: #f5faff; }
.card-item.C { border-left-color: #94a3b8; background-color: #f8fafc; }

/* 3. 打印模式逻辑修复（解决边框消失的核心） */
@media print {
  .no-print { display: none !important; }
  
  .print-container {
    max-width: 100% !important;
    margin: 0 !important;
    box-shadow: none !important;
  }

  /* 核心修复 1：强制开启色彩 */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* 核心修复 2：针对打印机重新定义 Card 容器 */
  .card-item {
    page-break-inside: avoid;
    break-inside: avoid;
    display: block !important;
    margin-bottom: 2rem !important;
    padding: 30px !important;
    border-radius: 15px !important;
    /* 打印时先设一个基础实线边框，防止消失 */
    border: 1px solid #e2e8f0 !important;
  }

  /* 核心修复 3：针对 A/B/C 三个等级，使用简写属性强制覆盖 border-left */
  /* 使用 15px 实线并硬编码颜色，防止浏览器优化掉 */
  .card-item.A { 
    border-left: 15px solid #ef4444 !important; 
    background-color: #fff9f9 !important; 
  }
  .card-item.B { 
    border-left: 15px solid #3b82f6 !important; 
    background-color: #f5faff !important; 
  }
  .card-item.C { 
    border-left: 15px solid #94a3b8 !important; 
    background-color: #f8fafc !important; 
  }

  .print-typography {
    font-size: 11.5pt !important;
    line-height: 1.7;
    color: #1e293b !important;
  }
}
</style>