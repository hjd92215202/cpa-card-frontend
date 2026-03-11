<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
    <!-- 1. 顶部艺术导航 -->
    <nav class="bg-white/70 backdrop-blur-md sticky top-0 z-50 px-6 md:px-12 py-4 flex justify-between items-center border-b border-slate-200/60">
      <div class="flex items-center gap-3 group cursor-pointer" @click="router.push('/')">
        <div class="bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200 transition-transform group-hover:rotate-12">
          <el-icon class="text-white" :size="22"><Cpu /></el-icon>
        </div>
        <div class="flex flex-col">
          <span class="font-black text-xl tracking-tighter text-slate-800 leading-none">POLYMATH <span class="text-indigo-600">HUB</span></span>
          <span class="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase mt-0.5">Second Brain System</span>
        </div>
      </div>

      <div class="flex items-center gap-4 md:gap-8">
        <el-button link class="hidden md:inline-flex text-slate-500 font-bold hover:text-indigo-600" @click="router.push('/admin/kb')">
          进入工作台
        </el-button>
        <div class="h-8 w-px bg-slate-200 hidden md:block"></div>
        <div class="flex items-center gap-3">
          <span class="hidden sm:block text-sm font-bold text-slate-600">{{ userStore.userInfo?.username }}</span>
          <el-dropdown trigger="click">
            <el-avatar :size="38" class="bg-indigo-600 text-white font-black cursor-pointer shadow-md hover:ring-4 hover:ring-indigo-50 transition-all">
              {{ (userStore.userInfo?.username || 'U').substring(0, 1).toUpperCase() }}
            </el-avatar>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :icon="Setting" @click="router.push('/admin/kb')">管理空间</el-dropdown-item>
                <el-dropdown-item :icon="SwitchButton" divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </nav>

    <!-- 2. 主体内容 -->
    <main class="flex-1 max-w-7xl mx-auto w-full p-6 md:p-12">
      
      <!-- 3. 知识空间网格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
        <div 
          v-for="sub in subjects" :key="sub.id"
          class="group relative"
          @click="startStudy(sub)"
        >
          <div class="absolute inset-0 bg-indigo-600 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
          
          <div class="relative bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col h-full overflow-hidden">
             <!-- 背景光晕装饰 -->
             <div class="absolute -right-8 -top-8 w-24 h-24 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>

             <div class="flex justify-between items-start mb-8 relative z-10">
               <div 
                 class="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 transition-transform group-hover:scale-110 duration-500"
                 :style="{ backgroundColor: sub.theme_color || '#6366f1' }"
               >
                 <el-icon :size="28">
                   <component :is="getIcon(sub.icon_type)" />
                 </el-icon>
               </div>
               <el-tag :type="sub.visibility === 'public' ? 'success' : 'info'" round effect="light" size="small" class="font-bold">
                 {{ sub.visibility === 'public' ? '公开' : '私有' }}
               </el-tag>
             </div>

             <h3 class="text-2xl font-black text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors">{{ sub.name }}</h3>
             <p class="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-8 flex-1">
               {{ sub.description || '点击开始探索此领域的深层知识体系。' }}
             </p>

             <div class="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">
                  Enter Space
                </span>
                <div class="bg-slate-100 p-2.5 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                  <el-icon><ArrowRight /></el-icon>
                </div>
             </div>
          </div>
        </div>

        <!-- 创建新空间按钮 -->
        <div 
          class="border-3 border-dashed border-slate-200 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-slate-300 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer group"
          @click="router.push('/admin/kb')"
        >
          <div class="bg-slate-100 p-5 rounded-full group-hover:bg-indigo-100 transition-colors mb-4">
            <el-icon :size="32"><Plus /></el-icon>
          </div>
          <span class="font-black tracking-widest uppercase text-[10px]">Create New Space</span>
        </div>
      </div>
    </main>

    <!-- 3. 页脚 -->
    <footer class="p-12 text-center border-t border-slate-100 bg-white">
      <p class="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
        Polymath Hub · Engineered for Permanent Memory · 2025
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Cpu, Setting, ArrowRight, Plus, SwitchButton,
  Reading, Monitor, Coffee, Key, Opportunity, Collection 
} from '@element-plus/icons-vue'
import { subjectApi, type Subject } from '../api/subject'
import { useAppStore } from '../store/appStore'
import { useUserStore } from '../store/userStore'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const subjects = ref<Subject[]>([])

// 图标映射表
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
    console.error('Failed to load knowledge spaces')
  }
})

const startStudy = (sub: Subject) => {
  appStore.setSubject(sub.id, sub.name, sub.theme_color)
  router.push('/study')
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出 Polymath 系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    userStore.logout()
    ElMessage.success('已安全退出')
    router.push('/login')
  }).catch(() => {})
}
</script>

<style scoped>
.border-3 {
  border-width: 3px;
}

/* 渐入动画 */
.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>