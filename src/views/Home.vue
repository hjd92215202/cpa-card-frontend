<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- 顶部导航 -->
    <nav class="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-8 py-4 flex justify-between items-center border-b border-slate-100">
      <div class="flex items-center gap-2">
        <div class="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
          <el-icon class="text-white" :size="20"><Cpu /></el-icon>
        </div>
        <span class="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
          Polymath Hub
        </span>
      </div>
      <el-button link :icon="Setting" @click="router.push('/admin/kb')" class="font-bold text-indigo-600">
        进入工作台
      </el-button>
    </nav>

    <!-- 主体内容 -->
    <main class="flex-1 max-w-7xl mx-auto w-full p-8 md:p-12">
      <header class="mb-12">
        <h2 class="text-4xl font-extrabold text-slate-900 tracking-tight">
          你好, 探索者 🧠
        </h2>
        <p class="text-slate-500 mt-3 text-lg max-w-2xl">
          构建你的第二大脑。管理灵感、学习技能并利用间隔复习系统将其转化为永久记忆。
        </p>
      </header>

      <!-- 知识库卡片网格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="sub in subjects" :key="sub.id"
          class="bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer border border-slate-100 flex flex-col group relative overflow-hidden"
          @click="startStudy(sub)"
        >
          <!-- 背景装饰：渐变圆点 (可选) -->
          <div class="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>

          <div class="flex justify-between items-start mb-8 relative z-10">
            <div 
              class="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform group-hover:scale-110"
              :style="{ backgroundColor: sub.theme_color || '#6366f1' }"
            >
              <!-- 动态图标组件 -->
              <el-icon :size="28">
                <component :is="getIcon(sub.icon_type)" />
              </el-icon>
            </div>
            <div class="flex flex-col items-end gap-2">
              <el-tag :type="sub.visibility === 'public' ? 'success' : 'info'" round effect="light" size="small">
                {{ sub.visibility === 'public' ? '公开' : '私有' }}
              </el-tag>
            </div>
          </div>
          
          <h3 class="text-2xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors mb-2 relative z-10">
            {{ sub.name }}
          </h3>
          <p class="text-slate-400 text-sm line-clamp-2 flex-1 leading-relaxed relative z-10">
            {{ sub.description || '点击开始探索此领域的深层知识。' }}
          </p>
          
          <div class="mt-8 flex items-center justify-between pt-6 border-t border-slate-50 relative z-10">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">
              进入学习空间
            </span>
            <div class="bg-slate-100 p-2 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>

        <!-- 快速添加卡片 -->
        <div 
          class="border-3 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer group"
          @click="router.push('/admin/kb')"
        >
          <div class="bg-slate-100 p-4 rounded-full group-hover:bg-indigo-100 transition-colors">
            <el-icon :size="32"><Plus /></el-icon>
          </div>
          <span class="mt-4 font-bold tracking-wide">创建新知识库</span>
        </div>
      </div>
    </main>

    <footer class="p-12 text-center text-slate-400 text-sm border-t border-slate-100 bg-white mt-auto">
      <div class="flex justify-center gap-6 mb-4">
        <span class="hover:text-indigo-500 cursor-pointer transition-colors">使用指南</span>
        <span class="hover:text-indigo-500 cursor-pointer transition-colors">复习算法</span>
        <span class="hover:text-indigo-500 cursor-pointer transition-colors">关于 Polymath</span>
      </div>
      <p>越努力 越幸运 | 你的第 {{ subjects.length }} 个知识库已就绪</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Cpu, Setting, ArrowRight, Plus, 
  Reading, Monitor, Coffee, Key, Opportunity, Collection 
} from '@element-plus/icons-vue'
import { subjectApi, type Subject } from '../api/subject'
import { useAppStore } from '../store/appStore'

const router = useRouter()
const appStore = useAppStore()
const subjects = ref<Subject[]>([])

// 定义图标映射表，将数据库中的字符串 key 映射为组件
const iconMap: any = { 
  Book: Reading, 
  Code: Monitor, 
  Life: Coffee, 
  Core: Key, 
  Growth: Opportunity,
  Collection: Collection 
}

const getIcon = (type: string | undefined | null) => {
  if (!type) return Collection
  return iconMap[type] || Collection
}

onMounted(async () => {
  try {
    const res = await subjectApi.list()
    subjects.value = res as any
  } catch (error) {
    console.error('加载知识库失败', error)
  }
})

const startStudy = (sub: Subject) => {
  // 设置 Store：现在使用更通用的术语
  appStore.setSubject(sub.id, sub.name, sub.theme_color)
  // 跳转到复习模式
  router.push('/study')
}
</script>

<style scoped>
/* 自定义虚线边框宽度 */
.border-3 {
  border-width: 3px;
}

/* 简单的进入动画 */
main {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>