<template>
  <div 
    class="card-container h-[550px] w-full max-w-2xl cursor-pointer"
    @click="isFlipped = !isFlipped"
  >
    <div :class="['card-inner', isFlipped ? 'is-flipped' : '']">
      <!-- 【正面】：保持简洁 -->
      <div class="card-face card-front p-10 flex flex-col shadow-2xl rounded-[2.5rem] border border-slate-100 bg-white relative overflow-hidden">
        <div class="absolute -right-10 -top-10 w-40 h-40 bg-blue-50 rounded-full opacity-60"></div>
        <div class="flex justify-between items-center mb-8 relative z-10">
          <el-tag effect="dark" class="border-none bg-blue-600 px-4 rounded-full font-bold">
            {{ importance }}级考点
          </el-tag>
          <el-rate :model-value="difficulty" disabled />
        </div>
        <h2 class="text-4xl font-black text-slate-800 mb-8 text-center">{{ title }}</h2>
        <div class="flex-1 overflow-y-auto custom-content prose prose-slate max-w-none">
          <MdPreview :modelValue="essence" theme="light" />
        </div>
        <div class="mt-6 text-center text-slate-300 text-xs font-bold tracking-widest animate-bounce">
          CLICK TO REVEAL INSIGHTS 👆
        </div>
      </div>

      <!-- 【背面】：光感/通透/易读 -->
      <div class="card-face card-back p-10 flex flex-col shadow-2xl rounded-[2.5rem] bg-[#0f172a] text-white relative overflow-hidden">
        <!-- 核心装饰：右上角的光晕 -->
        <div class="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/20 blur-[80px] rounded-full"></div>
        <div class="absolute -left-20 -bottom-20 w-60 h-60 bg-blue-500/10 blur-[60px] rounded-full"></div>
        
        <!-- 顶部标签 -->
        <div class="relative z-10 flex items-center gap-3 mb-8">
          <div class="bg-indigo-500 p-2 rounded-lg shadow-lg shadow-indigo-500/40">
            <el-icon :size="18" color="white"><Compass /></el-icon>
          </div>
          <span class="text-indigo-300 font-black text-xs uppercase tracking-widest">Mastery Insights</span>
        </div>
        
        <!-- 内容区域：毛玻璃容器 -->
        <div class="relative z-10 flex-1 overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 flex flex-col shadow-inner">
          <div class="flex-1 overflow-y-auto custom-content-dark prose prose-invert max-w-none">
            <!-- 强制文字更白、更大 -->
            <MdPreview 
              :modelValue="insights || '此考点暂无心得记录...'" 
              theme="dark" 
              class="!bg-transparent !text-slate-100 text-lg leading-relaxed" 
            />
          </div>
        </div>

        <!-- 底部装饰 -->
        <div class="relative z-10 mt-6 flex justify-between items-center px-2">
          <div class="flex flex-col">
            <span class="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Knowledge Node</span>
            <span class="text-[10px] text-indigo-400 font-mono italic">#CPA_Exam_Ready</span>
          </div>
          <div class="text-[10px] text-slate-500 bg-slate-900/80 px-3 py-1 rounded-full border border-white/5">
            点击返回正面
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import { Compass } from '@element-plus/icons-vue'

defineProps<{
  title: string
  essence: string
  insights?: string
  difficulty: number
  importance: string
}>()

const isFlipped = ref(false)

defineExpose({
  reset: () => isFlipped.value = false
})
</script>

<style scoped>
.card-container {
  perspective: 2000px;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.card-inner.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.card-back {
  transform: rotateY(180deg);
}

/* 彻底解决暗色模式下背景突兀的问题 */
:deep(.md-editor-preview) {
  padding: 0 !important;
  background-color: transparent !important;
  color: #f8fafc !important; /* 强制极浅灰色文字，提高对比度 */
}

:deep(.md-editor-preview-wrapper) {
  padding: 0 !important;
}

/* Markdown 内部排版优化 */
:deep(.prose-invert p) {
  color: #f1f5f9 !important;
  font-size: 1.125rem; /* 增大字号 */
  line-height: 1.75;
}

/* 自定义滚动条 */
.custom-content-dark::-webkit-scrollbar {
  width: 4px;
}
.custom-content-dark::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}
</style>