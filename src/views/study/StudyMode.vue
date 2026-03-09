<template>
  <div class="min-h-screen bg-slate-50 flex flex-col items-center p-6">
    <!-- 顶部导航 -->
    <div class="w-full max-w-4xl flex justify-between items-center mb-8">
      <el-button :icon="ArrowLeft" circle @click="router.back()" />
      <div class="text-center">
        <h1 class="font-bold text-xl">{{ appStore.currentSubjectName || '复习模式' }}</h1>
        <p class="text-sm text-gray-500">剩余任务: {{ cards.length - currentIndex }} / {{ cards.length }}</p>
      </div>
      <el-button :icon="Setting" circle />
    </div>

    <!-- 进度条 -->
    <div class="w-full max-w-2xl mb-8">
      <el-progress :percentage="progress" :show-text="false" stroke-width="8" />
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
    <div v-else-if="cards.length > 0" class="text-center py-20">
      <el-result icon="success" title="今日复习完成" sub-title="天道酬勤，CPA必过！">
        <template #extra>
          <el-button type="primary" @click="router.back()">返回知识库</el-button>
        </template>
      </el-result>
    </div>

    <!-- 操作栏 (只有翻转后或常驻，建议常驻方便操作) -->
    <div v-if="currentCard" class="mt-12 flex gap-6">
      <el-button-group>
        <el-button type="danger" size="large" @click="handleReview(1)">
          太难了 (1天后)
        </el-button>
        <el-button type="warning" size="large" @click="handleReview(3)">
          模糊 (3天后)
        </el-button>
        <el-button type="success" size="large" @click="handleReview(7)">
          简单 (7天后)
        </el-button>
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
const progress = computed(() => (currentIndex.value / cards.value.length) * 100)

onMounted(async () => {
  // 如果是从首页进来，会有 currentSubjectId 但没有 currentCategoryId
  if (!appStore.currentSubjectId) {
    ElMessage.warning('请先选择科目')
    router.push('/')
    return
  }

  try {
    let res;
    if (appStore.currentCategoryId) {
      // 模式 A：按指定章节复习
      res = await cardApi.listByCategory(appStore.currentCategoryId)
    } else {
      // 模式 B：整个科目复习（首页点击进入）
      res = await cardApi.listBySubject(appStore.currentSubjectId)
    }
    
    cards.value = res as any
    
    if (cards.value.length === 0) {
      ElMessage.info('暂无需要复习的卡片，快去录入吧！')
      router.back()
    }
  } catch (e) {
    console.error('加载卡片失败', e)
  }
})

const handleReview = async (days: number) => {
  if (!currentCard.value?.id) return
  
  // 1. 调用后端接口更新复习计划
  await cardApi.review(currentCard.value.id, days)
  
  // 2. 切到下一张
  if (currentIndex.value < cards.value.length) {
    cardRef.value?.reset() // 重置翻转状态
    currentIndex.value++
  }
}
</script>