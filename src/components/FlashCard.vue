<template>
  <div 
    class="card-container h-[500px] w-full max-w-2xl cursor-pointer"
    @click="isFlipped = !isFlipped"
  >
    <div :class="['card-inner', isFlipped ? 'is-flipped' : '']">
      <!-- 正面 -->
      <div class="card-face card-front p-8 flex flex-col shadow-2xl border border-gray-100 rounded-3xl">
        <div class="flex justify-between items-center mb-6">
          <el-tag effect="plain">{{ importance }}级考点</el-tag>
          <el-rate :model-value="difficulty" disabled />
        </div>
        
        <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">{{ title }}</h2>
        
        <div class="flex-1 overflow-y-auto prose prose-blue max-w-none">
          <MdPreview :modelValue="essence" />
        </div>
        
        <div class="mt-4 text-center text-gray-400 text-sm animate-pulse">
          点击卡片翻看备考心得 👆
        </div>
      </div>

      <!-- 背面 -->
      <div class="card-face card-back p-8 flex flex-col shadow-2xl rounded-3xl bg-slate-800 text-white">
        <div class="text-blue-400 font-bold mb-4 flex items-center gap-2">
          <el-icon><Compass /></el-icon> 备考心得 / 坑点提醒
        </div>
        
        <div class="flex-1 overflow-y-auto prose prose-invert max-w-none">
          <MdPreview :modelValue="insights || '此条目暂无心得记录'" />
        </div>

        <div class="mt-4 text-center text-gray-500 text-sm">
          点击卡片返回正面
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MdPreview } from 'md-editor-v3'
import { Compass } from '@element-plus/icons-vue'

defineProps<{
  title: string
  essence: string
  insights?: string
  difficulty: number
  importance: string
}>()

const isFlipped = ref(false)

// 暴露重置方法给父组件
defineExpose({
  reset: () => isFlipped.value = false
})
</script>

<style scoped>
.card-container {
  perspective: 1500px;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
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
  -webkit-backface-visibility: hidden;
}

.card-front {
  background: white;
}

.card-back {
  transform: rotateY(180deg);
}
</style>