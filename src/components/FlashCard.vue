<template>
  <!-- 容器不再绑定全局 click，防止操作内容时误翻 -->
  <div class="card-container min-h-[620px] w-full max-w-5xl">
    <div :class="['card-inner', isFlipped ? 'is-flipped' : '']">
      
      <!-- 【正面】：内容操作区 + 独立触发条 -->
      <div class="card-face card-front p-10 md:p-12 flex flex-col shadow-2xl rounded-[3rem] border border-slate-100 bg-white relative overflow-hidden">
        <div class="absolute -right-16 -top-16 w-72 h-72 bg-blue-50 rounded-full opacity-60"></div>
        
        <!-- 头部 (非交互) -->
        <div class="flex justify-between items-center mb-8 relative z-10">
          <el-tag effect="dark" class="border-none bg-indigo-600 px-6 py-1 rounded-full font-bold shadow-lg shadow-indigo-100 text-xs">
            {{ importance }} 级考点
          </el-tag>
          <el-rate :model-value="difficulty" disabled size="large" />
        </div>
        
        <h2 class="text-4xl font-black text-slate-800 mb-6 text-center tracking-tight leading-tight uppercase">{{ title }}</h2>
        
        <!-- 内容滚动区： pointer-events 设置为 auto 确保内部操作(复制、滚动)正常 -->
        <div class="flex-1 overflow-y-auto custom-content prose prose-slate max-w-none px-4 mb-4 relative z-20 pointer-events-auto">
          <MdPreview 
            :modelValue="essence" 
            theme="light" 
            class="md-preview-light"
          />
        </div>
        
        <!-- 【唯一翻转入口】：底部交互条 -->
        <div 
          class="mt-auto pt-6 border-t border-slate-50 flex justify-center items-center group/btn cursor-pointer"
          @click="isFlipped = true"
        >
          <div class="px-10 py-3 rounded-2xl bg-indigo-50 text-indigo-600 font-black text-xs tracking-[0.4em] uppercase transition-all group-hover/btn:bg-indigo-600 group-hover/btn:text-white group-hover/btn:shadow-xl group-hover/btn:-translate-y-1 animate-pulse group-hover/btn:animate-none">
            Click to Reveal Insights 👆
          </div>
        </div>
      </div>

      <!-- 【背面】：深度笔记区 + 返回按钮 -->
      <div class="card-face card-back p-10 md:p-12 flex flex-col shadow-2xl rounded-[3rem] bg-[#020617] text-white relative overflow-hidden border border-slate-800">
        <div class="absolute -right-20 -top-20 w-[500px] h-[500px] bg-indigo-600/20 blur-[100px] rounded-full"></div>
        
        <!-- 顶部标识 -->
        <div class="relative z-10 flex items-center gap-5 mb-8">
          <div class="bg-gradient-to-br from-indigo-500 to-blue-600 p-3 rounded-2xl shadow-xl shadow-indigo-500/40">
            <el-icon :size="24" color="white"><Compass /></el-icon>
          </div>
          <div class="flex flex-col">
            <span class="text-indigo-100 font-black text-sm uppercase tracking-widest leading-none">Mastery Insights</span>
            <span class="text-[9px] text-slate-500 font-bold uppercase mt-1.5 tracking-tighter">Knowledge Reconstruction</span>
          </div>
        </div>
        
        <!-- 背面内容滚动区 -->
        <div class="relative z-10 flex-1 flex flex-col bg-white/[0.04] backdrop-blur-3xl rounded-[2rem] border border-white/[0.08] p-8 shadow-inner overflow-hidden pointer-events-auto">
          <div class="flex-1 overflow-y-auto custom-content-dark prose prose-invert max-w-none px-4">
            <MdPreview 
              :modelValue="insights || '此考点暂无心得记录...'" 
              theme="dark" 
              class="md-preview-dark !bg-transparent" 
            />
          </div>
        </div>

        <!-- 底部装饰及返回触发 -->
        <div class="relative z-10 mt-8 flex justify-between items-center px-4">
          <div class="flex flex-col gap-2">
            <div class="h-1 w-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></div>
            <span class="text-[9px] text-slate-500 font-mono tracking-widest uppercase opacity-60">Verified Node</span>
          </div>
          
          <!-- 【返回入口】 -->
          <div 
            class="px-10 py-3 rounded-full border border-white/10 bg-white/5 text-slate-300 text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all active:scale-95 shadow-lg"
            @click="isFlipped = false"
          >
            Back to Card
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

// 暴露给 StudyMode 使用
defineExpose({
  reset: () => isFlipped.value = false
})
</script>

<style scoped>
.card-container {
  perspective: 2500px;
  margin: 1.5rem 0;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: inherit;
  transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-style: preserve-3d;
}

.card-inner.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  cursor: default; /* 默认不可点击翻转 */
}

.card-back {
  transform: rotateY(180deg);
}

/* 滚动条美化 */
.custom-content::-webkit-scrollbar,
.custom-content-dark::-webkit-scrollbar {
  width: 6px;
}
.custom-content::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-content-dark::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

/* 文本选择支持 */
:deep(.md-editor-preview) {
  user-select: text !important;
  -webkit-user-select: text !important;
}

:deep(.md-preview-light .md-editor-preview) {
  color: #1e293b !important;
  font-size: 1.15rem !important;
  line-height: 1.8;
}

:deep(.md-preview-dark .md-editor-preview) {
  color: #ffffff !important; 
  font-size: 1.2rem !important;
  line-height: 1.8;
}

/* 代码块增强 */
:deep(pre) {
  padding: 1.5rem !important;
  border-radius: 1rem !important;
  background-color: rgba(15, 23, 42, 0.04) !important;
  margin: 1rem 0 !important;
  overflow-x: auto !important;
}

:deep(.prose-invert pre) {
  background-color: rgba(0, 0, 0, 0.4) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.md-editor-preview-wrapper) {
  padding: 0 !important;
}
</style>