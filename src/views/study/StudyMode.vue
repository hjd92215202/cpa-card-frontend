<template>
  <div class="min-h-screen bg-slate-50 flex flex-col items-center p-6">
    <!-- 顶部导航 -->
    <div class="w-full max-w-4xl flex justify-between items-center mb-8">
      <el-button :icon="ArrowLeft" circle @click="router.back()" />
      <div class="text-center">
        <h1 class="font-bold text-xl">{{ appStore.currentSubjectName || '复习模式' }}</h1>
        <p class="text-sm text-gray-500">
          剩余任务: {{ cards.length > 0 ? (cards.length - currentIndex) : 0 }} / {{ cards.length }}
        </p>
      </div>
      <el-button :icon="Setting" circle />
    </div>

    <!-- 进度条 - 修复 NaN 和类型 -->
    <div class="w-full max-w-2xl mb-8">
      <el-progress 
        :percentage="isNaN(progress) ? 0 : progress" 
        :show-text="false" 
        :stroke-width="8" 
      />
    </div>

    <!-- 卡片主体 -->
    <div v-if="currentCard" class="w-full flex justify-center">
      <FlashCard 
        ref="cardRef"
        :key="currentCard.id"
        v-bind="currentCard"
      />
    </div>

    <!-- 完成态 -->
    <div v-else-if="cards.length > 0 && currentIndex >= cards.length" class="text-center py-20">
      <el-result icon="success" title="复习达成" sub-title="每天的积累都是通往卓越的阶梯">
        <template #extra>
          <el-button type="primary" @click="router.back()">返回知识库</el-button>
        </template>
      </el-result>
    </div>

    <!-- 操作栏 -->
    <div v-if="currentCard" class="mt-12 flex gap-6">
      <el-button-group>
        <el-button type="danger" size="large" @click="handleReview(1)">太难了 (1天后)</el-button>
        <el-button type="warning" size="large" @click="handleReview(3)">模糊 (3天后)</el-button>
        <el-button type="success" size="large" @click="handleReview(7)">简单 (7天后)</el-button>
      </el-button-group>
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

// 修复点 1: 在 script 逻辑中使用 cards.value.length
const progress = computed(() => {
  if (cards.value.length === 0) return 0
  return Math.round((currentIndex.value / cards.value.length) * 100)
})

onMounted(async () => {
  if (!appStore.currentSubjectId) {
    ElMessage.warning('请先选择科目')
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
    
    // 修复点 2: 显式断言或确保 res 类型正确
    cards.value = res as unknown as Card[]
    
    if (cards.value.length === 0) {
      ElMessage.info('暂无需要复习的卡片')
      router.back()
    }
  } catch (e) {
    console.error('加载卡片失败', e)
  }
})

const handleReview = async (days: number) => {
  if (!currentCard.value?.id) return
  
  try {
    await cardApi.review(currentCard.value.id, days)
    
    // 修复点 3: 逻辑判断使用 .value
    if (currentIndex.value < cards.value.length) {
      cardRef.value?.reset()
      currentIndex.value++
    }
  } catch (error) {
    ElMessage.error('提交进度失败')
  }
}
</script>