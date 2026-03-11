<template>
  <div class="min-h-screen bg-slate-50 flex flex-col items-center selection:bg-indigo-100 selection:text-indigo-700 font-sans">
    
    <!-- 1. 极简式顶部导航：Py-10 -> Py-4 (极致紧凑) -->
    <header class="w-full max-w-6xl px-8 py-4 flex justify-between items-center">
      <el-button :icon="ArrowLeft" circle size="default" class="shadow-sm hover:scale-110 transition-transform border-slate-200" @click="router.back()" />
      
      <div class="text-center">
        <h1 class="text-lg font-black text-slate-800 tracking-tight leading-none uppercase">
          {{ appStore.currentSubjectName }}
        </h1>
        <div class="flex items-center justify-center gap-2 mt-1.5">
          <span class="text-[8px] font-black text-slate-400 tracking-widest uppercase">Progress</span>
          <span class="text-[10px] font-bold text-indigo-600 font-mono">{{ currentIndex + 1 }} / {{ cards.length }}</span>
        </div>
      </div>

      <el-button :icon="Setting" circle size="default" class="shadow-sm opacity-20 hover:opacity-100 transition-opacity" />
    </header>

    <!-- 2. 精简型进度条：Mb-10 -> Mb-4 -->
    <div class="w-full max-w-5xl px-8 mb-4">
      <el-progress 
        :percentage="isNaN(progress) ? 0 : progress" 
        :stroke-width="8" 
        :show-text="false" 
        striped 
        striped-flow
        color="#4f46e5"
        class="shadow-sm rounded-full"
      />
    </div>

    <!-- 3. 卡片展示区：Pb-48 -> Pb-24 (让整体布局更聚合) -->
    <main class="w-full flex-1 flex flex-col items-center px-6 pb-24">
      <div v-if="currentCard" class="w-full flex justify-center animate-card-entry">
        <FlashCard 
          ref="cardRef"
          :key="currentIndex"
          v-bind="currentCard"
        />
      </div>

      <!-- 复习达成达成态 -->
      <div v-else-if="cards.length > 0 && currentIndex >= cards.length" class="py-12 text-center animate-fade-in">
        <el-result icon="success" title="Mission Accomplished" sub-title="天道酬勤，今日复习任务已全部达成！">
          <template #extra>
            <el-button type="primary" size="large" round class="bg-indigo-600 px-10 font-bold border-none" @click="router.back()">
              返回知识库
            </el-button>
          </template>
        </el-result>
      </div>
    </main>

    <!-- 4. 底部控制台：尺寸微调使其更精致 -->
    <div v-if="currentCard" class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div class="bg-white/70 backdrop-blur-2xl p-2.5 rounded-[2rem] shadow-xl border border-white/60 flex gap-4 items-center ring-1 ring-slate-900/5">

        <div class="flex gap-3">
          <el-button type="danger" round class="px-6 font-bold shadow-md hover:scale-105 active:scale-95 transition-all border-none" @click="handleReview(1)">
            太难了 (1D)
          </el-button>
          <el-button type="warning" round class="px-6 font-bold shadow-md hover:scale-105 active:scale-95 transition-all border-none" @click="handleReview(3)">
            模糊 (3D)
          </el-button>
          <el-button type="success" round class="px-6 font-bold shadow-md bg-green-600 hover:bg-green-500 border-none hover:scale-105 active:scale-95 transition-all" @click="handleReview(7)">
            简单 (7D)
          </el-button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Setting } from '@element-plus/icons-vue'
import FlashCard from '../../components/FlashCard.vue'
import { cardApi, type Card } from '../../api/card'
import { useAppStore } from '../../store/appStore'
import { ElMessage } from 'element-plus'

const router = useRouter()
const appStore = useAppStore()
const cards = ref<Card[]>([])
const currentIndex = ref(0)
const cardRef = ref()

const currentCard = computed(() => cards.value[currentIndex.value])

const progress = computed(() => {
  if (cards.value.length === 0) return 0
  return Math.round((currentIndex.value / cards.value.length) * 100)
})

onMounted(async () => {
  if (!appStore.currentSubjectId) {
    ElMessage.warning('请先选择一个知识空间')
    router.push('/')
    return
  }

  try {
    let res;
    if (appStore.currentCategoryId) {
      res = await cardApi.listByCategory(appStore.currentCategoryId)
    } else {
      res = await cardApi.listBySubject(appStore.currentSubjectId)
    }
    
    cards.value = res as unknown as Card[]
    
    if (cards.value.length === 0) {
      ElMessage.info('暂无需要复习的任务')
      router.back()
    }
  } catch (e) {
    console.error('Sync failed:', e)
  }
})

const handleReview = async (days: number) => {
  if (!currentCard.value?.id) return
  
  try {
    await cardApi.review(currentCard.value.id, days)
    if (currentIndex.value < cards.value.length) {
      cardRef.value?.reset() 
      currentIndex.value++
    }
  } catch (error) {
    ElMessage.error('网络连接异常')
  }
}
</script>

<style scoped>
.animate-card-entry {
  animation: cardSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes cardSlideUp {
  from { 
    opacity: 0; 
    transform: translateY(20px) scale(0.99); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

:global(body) {
  overflow-x: hidden;
}
</style>