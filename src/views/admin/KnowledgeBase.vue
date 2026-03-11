<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden text-gray-700 font-sans">
    
    <!-- 1. 最左侧：知识空间导航 (支持折叠) -->
    <div 
      :class="[
        'bg-slate-900 text-white flex flex-col shadow-xl transition-all duration-300 ease-in-out relative',
        isCollapsed ? 'w-20' : 'w-64'
      ]"
    >
      <!-- 顶部控制区 -->
      <div class="p-4 flex items-center border-b border-slate-800 overflow-hidden" :class="isCollapsed ? 'justify-center' : 'justify-between'">
        <div 
          v-show="!isCollapsed"
          class="flex items-center gap-2 cursor-pointer hover:text-indigo-400 transition-all group whitespace-nowrap"
          @click="router.push('/')"
        >
          <el-icon class="group-hover:scale-110 transition-transform" :size="20"><HomeFilled /></el-icon>
          <h1 class="font-black text-sm tracking-widest uppercase">返回首页</h1>
        </div>
        
        <el-button 
          link 
          :icon="isCollapsed ? Expand : Fold" 
          class="text-slate-400 hover:text-white"
          @click="isCollapsed = !isCollapsed"
        />
      </div>

      <!-- 新增按钮 -->
      <div class="p-3">
        <el-button 
          type="primary" 
          :class="['w-full transition-all overflow-hidden border-none bg-indigo-600 hover:bg-indigo-500', isCollapsed ? 'px-0' : '']"
          @click="openSubjectCreator"
        >
          <el-icon><Plus /></el-icon>
          <span v-show="!isCollapsed" class="ml-2 whitespace-nowrap">新建空间</span>
        </el-button>
      </div>

      <!-- 中间：科目列表 -->
      <div class="flex-1 overflow-y-auto py-2 custom-scrollbar overflow-x-hidden">
        <div 
          v-for="sub in subjects" :key="sub.id"
          @click="selectSubject(sub)"
          :class="[
            'px-5 py-4 cursor-pointer transition-all flex items-center border-l-4 group relative', 
            appStore.currentSubjectId === sub.id ? 'bg-slate-800 border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800',
            isCollapsed ? 'justify-center px-0' : 'justify-between'
          ]"
        >
          <div class="flex items-center gap-3 truncate">
             <el-tooltip :content="sub.name" placement="right" :disabled="!isCollapsed">
               <el-icon :size="20" :style="{ color: sub.theme_color }">
                 <component :is="iconMap[sub.icon_type || 'Collection']" />
               </el-icon>
             </el-tooltip>
             <span v-show="!isCollapsed" class="text-sm font-medium truncate whitespace-nowrap">{{ sub.name }}</span>
          </div>
          
          <el-icon 
            v-show="!isCollapsed"
            class="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all ml-2" 
            :size="14" 
            @click.stop="handleDeleteSubject(sub.id)"
          ><Delete /></el-icon>
        </div>
      </div>

      <!-- 底部：用户信息 -->
      <div class="p-4 border-t border-slate-800 bg-slate-950/20 flex flex-col items-center gap-4">
        <div :class="['flex items-center w-full overflow-hidden transition-all', isCollapsed ? 'justify-center' : 'gap-3 justify-between']">
          <div class="flex items-center gap-2 min-w-0">
            <el-avatar :size="28" class="bg-indigo-600 text-[10px] font-bold flex-shrink-0">
              {{ (userStore.userInfo?.username || 'U').substring(0, 2).toUpperCase() }}
            </el-avatar>
            <span v-show="!isCollapsed" class="text-xs text-slate-300 truncate font-medium whitespace-nowrap">
              {{ userStore.userInfo?.username || '未登录' }}
            </span>
          </div>
          <el-tooltip content="退出系统" placement="right">
            <el-button link type="danger" :icon="SwitchButton" @click="handleLogout" />
          </el-tooltip>
        </div>
      </div>
    </div>

    <!-- 2. 中间：目录结构 (章节) -->
    <div class="w-80 bg-white border-r flex flex-col shadow-sm">
      <div class="p-5 border-b flex justify-between items-center bg-gray-50/50">
        <span class="font-bold text-gray-600 flex items-center gap-2">
          <el-icon><Fold /></el-icon> 目录大纲
        </span>
        <el-button v-if="appStore.currentSubjectId" link :icon="Plus" @click="prepareAddCategory(null)">主目录</el-button>
      </div>
      <div class="flex-1 overflow-y-auto p-2 custom-scrollbar">
        <el-tree
          v-if="appStore.currentSubjectId"
          :data="categoryTree"
          node-key="id"
          @node-click="handleNodeClick"
          highlight-current
          :expand-on-click-node="false"
          default-expand-all
        >
          <template #default="{ data }">
            <div class="flex-1 flex items-center justify-between text-sm group pr-2 truncate">
              <span class="truncate">{{ data.name }}</span>
              <div class="flex gap-1">
                <el-icon 
                  class="hidden group-hover:block text-indigo-500 hover:scale-125 transition-transform" 
                  @click.stop="prepareAddCategory(data.id)"
                ><Plus /></el-icon>
                <el-icon 
                  class="hidden group-hover:block text-red-300 hover:text-red-500 hover:scale-125 transition-transform" 
                  @click.stop="handleDeleteCategory(data.id)"
                ><Delete /></el-icon>
              </div>
            </div>
          </template>
        </el-tree>
        <div v-else class="h-full flex flex-col items-center justify-center text-gray-400 text-xs px-10 text-center space-y-3 opacity-60">
          <el-icon :size="32"><Files /></el-icon>
          <p>请选择左侧科目</p>
        </div>
      </div>
    </div>

    <!-- 3. 右侧：卡片列表区 -->
    <div class="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      <header v-if="currentCategoryId" class="bg-white p-6 border-b flex justify-between items-center shadow-sm relative z-10">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-bold text-gray-800">{{ currentCategoryName }}</h2>
            <el-tag size="small" effect="plain" round class="bg-indigo-50 border-indigo-100 text-indigo-600">{{ cards.length }} 卡片</el-tag>
          </div>
          <p class="text-xs text-gray-400 mt-1">管理并组织该节点的知识碎片</p>
        </div>
        <div class="flex gap-3">
          <el-button type="info" plain :icon="Printer" @click="router.push('/print')">导出讲义</el-button>
          <el-button type="success" :icon="Postcard" class="bg-green-600 border-none hover:bg-green-500" @click="goToStudy">复习模式</el-button>
          <el-button type="primary" :icon="Plus" class="bg-indigo-600 border-none hover:bg-indigo-500" @click="openCardEditor">新建卡片</el-button>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div v-if="currentCategoryId">
          <div v-if="cards.length > 0" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <el-card 
              v-for="card in cards" :key="card.id" 
              shadow="hover" 
              class="border-none rounded-xl relative group hover:ring-2 hover:ring-indigo-500/20 transition-all cursor-pointer"
              @click="handleEditCard(card)"
            >
              <template #header>
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-2 truncate">
                    <el-icon v-if="card.card_type === 'code'" class="text-orange-500"><Monitor /></el-icon>
                    <el-icon v-else class="text-blue-500"><Memo /></el-icon>
                    <span class="font-bold truncate text-gray-700">{{ card.title }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <el-button 
                      class="hidden group-hover:block" 
                      link type="danger" 
                      :icon="Delete" 
                      @click.stop="handleDeleteCard(card.id!)" 
                    />
                    <el-tag :type="card.importance === 'A' ? 'danger' : 'info'" effect="dark" size="small">
                      {{ card.importance }}级
                    </el-tag>
                  </div>
                </div>
              </template>
              <div class="text-sm text-gray-500 line-clamp-3 min-h-[60px] leading-relaxed italic">
                {{ card.essence }}
              </div>
              <div class="mt-4 pt-4 border-t flex justify-between items-center">
                <el-rate :model-value="card.difficulty" disabled size="small" />
                <span class="text-[10px] text-gray-400 font-mono tracking-tighter">NEXT: {{ card.next_review_date || 'New' }}</span>
              </div>
            </el-card>
          </div>
          <div v-else class="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-white">
            <el-icon class="text-gray-200" :size="48"><Postcard /></el-icon>
            <p class="text-gray-400 mt-4 font-medium">还没有任何知识记录</p>
            <el-button type="primary" link class="mt-2 text-indigo-600" @click="openCardEditor">立即创建第一张卡片</el-button>
          </div>
        </div>
        <div v-else class="h-full flex flex-col items-center justify-center text-gray-400 animate-pulse space-y-4">
          <el-icon :size="64" class="opacity-10"><Memo /></el-icon>
          <p class="tracking-widest text-sm uppercase font-bold text-gray-300 font-mono">Select a category to manage</p>
        </div>
      </main>
    </div>

    <!-- 弹窗：新建知识空间 -->
    <el-dialog v-model="showAddSubject" title="知识空间管理" width="450px" destroy-on-close>
      <el-form :model="subjectForm" label-position="top">
        <el-form-item label="空间名称" required>
          <el-input v-model="subjectForm.name" placeholder="如：CPA 经济法" />
        </el-form-item>
        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="视觉图标">
            <el-select v-model="subjectForm.icon_type">
              <el-option v-for="(_, key) in iconMap" :key="key" :label="key" :value="key" />
            </el-select>
          </el-form-item>
          <el-form-item label="可见权限">
            <el-select v-model="subjectForm.visibility">
              <el-option label="仅自己可见" value="private" />
              <el-option label="公开分享" value="public" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="品牌色">
          <el-color-picker v-model="subjectForm.theme_color" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddSubject = false">取消</el-button>
        <el-button type="primary" class="bg-indigo-600 border-none" @click="handleSaveSubject">确认创建</el-button>
      </template>
    </el-dialog>

    <!-- 弹窗：新增目录 -->
    <el-dialog v-model="showAddCategory" title="目录结构管理" width="400px">
      <el-form :model="categoryForm" label-position="top">
        <el-form-item label="节点名称" required>
          <el-input v-model="categoryForm.name" placeholder="输入目录名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddCategory = false">取消</el-button>
        <el-button type="primary" class="bg-indigo-600 border-none" @click="handleSaveCategory">确认添加</el-button>
      </template>
    </el-dialog>

    <!-- 弹窗：知识卡片编辑器 (核心修复点) -->
    <el-dialog v-model="showCardEditor" :title="editingCardId ? '更新知识节点' : '录入新知识点'" width="85%" top="5vh" destroy-on-close>
      <el-form :model="cardForm" label-position="top">
        <div class="grid grid-cols-12 gap-8">
          <div class="col-span-8 space-y-6">
            <el-form-item label="节点标题" required>
              <el-input v-model="cardForm.title" placeholder="输入知识点名称" size="large" />
            </el-form-item>
            <el-form-item label="正面：核心内容 / 问题">
              <MdEditor v-model="cardForm.essence" height="300px" />
            </el-form-item>
            <el-form-item label="背面：详细解析 / 深度笔记">
              <MdEditor v-model="cardForm.insights" height="200px" />
            </el-form-item>
          </div>
          <div class="col-span-4 bg-gray-50 p-6 rounded-xl space-y-8 border border-gray-100">
            <el-form-item label="内容类型">
               <el-radio-group v-model="cardForm.card_type" fill="#4f46e5">
                <el-radio-button value="qa">问答</el-radio-button>
                <el-radio-button value="note">笔记</el-radio-button>
                <el-radio-button value="code">代码</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="熟悉程度 (难度)">
              <el-rate v-model="cardForm.difficulty" :texts="['完全陌生', '初窥门径', '掌握一般', '基本精通', '完美掌握']" show-text />
            </el-form-item>
            <el-form-item label="考试重要程度">
              <el-radio-group v-model="cardForm.importance">
                <el-radio-button value="A">核心</el-radio-button>
                <el-radio-button value="B">常用</el-radio-button>
                <el-radio-button value="C">边缘</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="初次复习间隔 (天)">
              <el-input-number v-model="cardForm.interval_days" :min="1" />
            </el-form-item>
            <div class="pt-10">
               <el-button type="primary" size="large" class="w-full shadow-lg bg-indigo-600 border-none" @click="handleSaveCard">
                 {{ editingCardId ? '更新并同步' : '确认保存' }}
               </el-button>
               <el-button size="large" class="w-full mt-4" @click="showCardEditor = false">取消</el-button>
            </div>
          </div>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  Plus, Postcard, Fold, Expand, Files, Memo, Printer, Delete, HomeFilled, SwitchButton,
  Reading, Monitor, Coffee, Key, Opportunity, Collection 
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

import { subjectApi, type Subject } from '../../api/subject'
import { categoryApi, type Category } from '../../api/category'
import { cardApi, type Card } from '../../api/card'
import { useAppStore } from '../../store/appStore'
import { useUserStore } from '../../store/userStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

// --- 状态控制 ---
const isCollapsed = ref(false)
const iconMap: any = { Book: Reading, Code: Monitor, Life: Coffee, Core: Key, Growth: Opportunity, Collection: Collection }

// 基础数据
const subjects = ref<Subject[]>([])
const categories = ref<Category[]>([])
const cards = ref<Card[]>([])

// 业务状态
const currentCategoryId = ref<number | null>(null)
const currentCategoryName = ref('')
const editingCardId = ref<number | null>(null)

const showAddSubject = ref(false)
const showAddCategory = ref(false)
const showCardEditor = ref(false)

// 表单数据
const subjectForm = ref({ name: '', description: '', theme_color: '#6366f1', icon_type: 'Book', visibility: 'private' })
const categoryForm = ref({ name: '', parent_id: null as number | null })
const cardForm = ref({ title: '', essence: '', insights: '', difficulty: 3, importance: 'B', interval_days: 1, card_type: 'qa' })

// --- 数据加载 ---
const loadSubjects = async () => {
  try {
    const res = await subjectApi.list()
    subjects.value = res as any
  } catch (err) {
    console.error('Failed to load subjects')
  }
}

onMounted(() => loadSubjects())

// --- 科目操作 ---
const selectSubject = async (sub: Subject) => {
  appStore.setSubject(sub.id, sub.name, sub.theme_color)
  currentCategoryId.value = null
  cards.value = []
  const res = await categoryApi.listBySubject(sub.id)
  categories.value = res as any
}

const openSubjectCreator = () => {
  subjectForm.value = { name: '', description: '', theme_color: '#6366f1', icon_type: 'Book', visibility: 'private' }
  showAddSubject.value = true
}

const handleSaveSubject = async () => {
  if (!subjectForm.value.name.trim()) return
  await subjectApi.create(subjectForm.value)
  ElMessage.success('科目已创建')
  showAddSubject.value = false
  loadSubjects()
}

const handleDeleteSubject = async (id: number) => {
  try {
    await ElMessageBox.confirm('删除该科目将清空旗下所有章节与卡片！确定吗？', '严峻警告', { type: 'error' })
    await subjectApi.delete(id)
    ElMessage.success('科目已移除')
    if (appStore.currentSubjectId === id) appStore.currentSubjectId = null
    loadSubjects()
  } catch {}
}

// --- 目录操作 ---
const categoryTree = computed(() => {
  const map: any = {}
  const tree: any[] = []
  categories.value.forEach(cat => map[cat.id] = { ...cat, children: [] })
  categories.value.forEach(cat => {
    if (cat.parent_id) {
      map[cat.parent_id]?.children.push(map[cat.id])
    } else {
      tree.push(map[cat.id])
    }
  })
  return tree
})

const handleNodeClick = (data: any) => {
  currentCategoryId.value = data.id
  currentCategoryName.value = data.name
  appStore.setCategory(data.id, data.name) 
  loadCards()
}

const loadCards = async () => {
  if (!currentCategoryId.value) return
  const res = await cardApi.listByCategory(currentCategoryId.value)
  cards.value = res as any
}

const prepareAddCategory = (parentId: number | null) => {
  categoryForm.value = { name: '', parent_id: parentId }
  showAddCategory.value = true
}

const handleSaveCategory = async () => {
  if (!appStore.currentSubjectId || !categoryForm.value.name.trim()) return
  await categoryApi.create({ ...categoryForm.value, subject_id: appStore.currentSubjectId })
  ElMessage.success('目录已更新')
  showAddCategory.value = false
  const res = await categoryApi.listBySubject(appStore.currentSubjectId)
  categories.value = res as any
}

const handleDeleteCategory = async (id: number) => {
  try {
    await ElMessageBox.confirm('删除此节点及其下所有卡片？', '确认', { type: 'warning' })
    await categoryApi.delete(id)
    ElMessage.success('章节已移除')
    if (appStore.currentSubjectId) {
       const res = await categoryApi.listBySubject(appStore.currentSubjectId)
       categories.value = res as any
    }
  } catch {}
}

// --- 卡片核心操作 ---
const openCardEditor = () => {
  editingCardId.value = null
  cardForm.value = { title: '', essence: '', insights: '', difficulty: 3, importance: 'B', interval_days: 1, card_type: 'qa' }
  showCardEditor.value = true
}

const handleEditCard = (card: Card) => {
  editingCardId.value = card.id!
  cardForm.value = { 
    title: card.title, 
    essence: card.essence || '', 
    insights: card.insights || '', 
    difficulty: card.difficulty || 3, 
    importance: card.importance || 'B', 
    interval_days: card.interval_days || 1, 
    card_type: card.card_type || 'qa'
  }
  showCardEditor.value = true
}

const handleSaveCard = async () => {
  // 基础校验
  if (!cardForm.value.title.trim() || !currentCategoryId.value) {
    ElMessage.warning('标题和所属章节不能为空');
    return;
  }

  // 关键：构造符合后端 DTO 要求的提交对象，解决 422 校验错误
  const submitData = {
    ...cardForm.value,
    category_id: currentCategoryId.value
  };

  try {
    if (editingCardId.value) {
      await cardApi.update(editingCardId.value, submitData)
      ElMessage.success('知识节点已同步更新')
    } else {
      await cardApi.create(submitData)
      ElMessage.success('新知识点已录入')
    }
    showCardEditor.value = false
    loadCards()
  } catch (err) {
    console.error('Submission failed', err)
  }
}

const handleDeleteCard = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除此知识卡片吗？', '确认', { type: 'warning' })
    await cardApi.delete(id)
    ElMessage.success('卡片已清理')
    loadCards()
  } catch {}
}

// --- 系统逻辑 ---
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出 Polymath 系统吗？', '注销', { type: 'warning' }).then(() => {
    userStore.logout()
    router.push('/login')
    ElMessage.info('已安全登出')
  }).catch(() => {})
}

const goToStudy = () => {
  if (cards.value.length === 0) { ElMessage.warning('该分类暂无卡片'); return }
  router.push('/study')
}
</script>

<style scoped>
:deep(.el-tree-node__content) {
  height: 44px;
  border-radius: 8px;
  margin: 4px 0;
  transition: all 0.2s;
}
:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #eef2ff !important;
  color: #4f46e5;
  font-weight: 600;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 10px;
}
</style>