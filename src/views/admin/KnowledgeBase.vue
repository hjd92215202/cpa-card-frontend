<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden text-gray-700">
    <!-- 1. 最左侧：知识空间导航 -->
    <div class="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
      <div class="p-5 flex justify-between items-center border-b border-slate-800">
        <div class="flex items-center gap-2">
          <el-icon class="text-indigo-400" :size="20"><Cpu /></el-icon>
          <h1 class="font-black text-sm tracking-widest uppercase">My Hub</h1>
        </div>
        <el-button :icon="Plus" circle size="small" @click="showAddSubject = true" />
      </div>
      <div class="flex-1 overflow-y-auto py-2">
        <div 
          v-for="sub in subjects" :key="sub.id"
          @click="selectSubject(sub)"
          :class="['px-5 py-4 cursor-pointer transition-all flex items-center justify-between border-l-4 group', 
                    appStore.currentSubjectId === sub.id ? 'bg-slate-800 border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800']"
        >
          <div class="flex items-center gap-3">
             <el-icon :size="18" :style="{ color: sub.theme_color }">
               <component :is="iconMap[sub.icon_type || 'Collection']" />
             </el-icon>
             <span class="text-sm font-medium">{{ sub.name }}</span>
          </div>
          <el-icon v-if="sub.visibility === 'private'" class="opacity-0 group-hover:opacity-100 text-slate-500" :size="12"><Lock /></el-icon>
        </div>
      </div>
    </div>

    <!-- 2. 中间：目录结构 (主题/章节) -->
    <div class="w-80 bg-white border-r flex flex-col shadow-sm">
      <div class="p-5 border-b flex justify-between items-center bg-gray-50/50">
        <span class="font-bold text-gray-600 flex items-center gap-2">
          <el-icon><Fold /></el-icon> 目录大纲
        </span>
        <el-button v-if="appStore.currentSubjectId" link :icon="Plus" @click="prepareAddCategory(null)">主目录</el-button>
      </div>
      <div class="flex-1 overflow-y-auto p-2">
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
            <div class="flex-1 flex items-center justify-between text-sm group pr-2">
              <span class="truncate">{{ data.name }}</span>
              <el-icon 
                class="hidden group-hover:block text-indigo-500" 
                @click.stop="prepareAddCategory(data.id)"
              ><Plus /></el-icon>
            </div>
          </template>
        </el-tree>
        <div v-else class="h-full flex flex-col items-center justify-center text-gray-400 text-xs px-10 text-center">
          <el-icon :size="32" class="mb-2 opacity-20"><Files /></el-icon>
          <p>请在左侧选择一个知识空间以加载大纲</p>
        </div>
      </div>
    </div>

    <!-- 3. 右侧：内容管理区 -->
    <div class="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      <header v-if="currentCategoryId" class="bg-white p-6 border-b flex justify-between items-center shadow-sm relative z-10">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-bold text-gray-800">{{ currentCategoryName }}</h2>
            <el-tag size="small" effect="plain" round>{{ cards.length }} 卡片</el-tag>
          </div>
          <p class="text-xs text-gray-400 mt-1">管理并组织该分类下的知识节点</p>
        </div>
        <div class="flex gap-3">
          <el-button type="success" :icon="Postcard" @click="goToStudy">复习模式</el-button>
          <el-button type="primary" :icon="Plus" @click="openCardEditor">新建卡片</el-button>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-6">
        <div v-if="currentCategoryId">
          <div v-if="cards.length > 0" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <el-card 
              v-for="card in cards" :key="card.id" 
              shadow="hover" 
              class="border-none rounded-xl relative group hover:ring-2 hover:ring-indigo-500/20 transition-all"
            >
              <template #header>
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-2 truncate">
                    <el-icon v-if="card.card_type === 'code'" class="text-orange-500"><Monitor /></el-icon>
                    <el-icon v-else-if="card.card_type === 'note'" class="text-blue-500"><Memo /></el-icon>
                    <span class="font-bold truncate text-gray-700">{{ card.title }}</span>
                  </div>
                  <el-tag :type="card.importance === 'A' ? 'danger' : 'info'" effect="dark" size="small">
                    {{ card.importance }}级
                  </el-tag>
                </div>
              </template>
              <div class="text-sm text-gray-500 line-clamp-3 min-h-[60px] leading-relaxed italic">
                {{ card.essence }}
              </div>
              <div class="mt-4 pt-4 border-t flex justify-between items-center">
                <el-rate v-model="card.difficulty" disabled size="small" />
                <span class="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">Next: {{ card.next_review_date || 'New' }}</span>
              </div>
            </el-card>
          </div>
          <div v-else class="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-white">
            <el-icon class="text-gray-200" :size="48"><Postcard /></el-icon>
            <p class="text-gray-400 mt-4 font-medium">还没有任何知识记录</p>
            <el-button type="primary" link class="mt-2" @click="openCardEditor">立即创建第一张卡片</el-button>
          </div>
        </div>
        <div v-else class="h-full flex flex-col items-center justify-center text-gray-400 animate-pulse">
          <el-icon :size="64" class="opacity-10"><Memo /></el-icon>
          <p class="mt-4 tracking-widest text-sm uppercase font-bold">Focus on your knowledge</p>
        </div>
      </main>
    </div>

    <!-- 弹窗：新建知识空间 -->
    <el-dialog v-model="showAddSubject" title="新建知识空间" width="450px" destroy-on-close>
      <el-form :model="subjectForm" label-position="top">
        <el-form-item label="名称" required for="lib_name_input">
          <el-input id="lib_name_input" v-model="subjectForm.name" placeholder="如：Rust 编程基础" />
        </el-form-item>
        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="图标类型" for="lib_icon_select">
            <el-select id="lib_icon_select" v-model="subjectForm.icon_type" placeholder="选择图标">
              <el-option label="书籍" value="Book" />
              <el-option label="代码" value="Code" />
              <el-option label="生活" value="Life" />
              <el-option label="核心" value="Core" />
              <el-option label="灵感" value="Growth" />
            </el-select>
          </el-form-item>
          <el-form-item label="可见性" for="lib_visibility_select">
            <el-select id="lib_visibility_select" v-model="subjectForm.visibility" placeholder="选择可见性">
              <el-option label="私有" value="private" />
              <el-option label="公开" value="public" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="描述 (可选)" for="lib_desc_input">
          <el-input id="lib_desc_input" v-model="subjectForm.description" type="textarea" placeholder="对此空间的简要说明..." />
        </el-form-item>
        <el-form-item label="主题色">
          <el-color-picker v-model="subjectForm.theme_color" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddSubject = false">取消</el-button>
        <el-button type="primary" @click="handleAddSubject">创建空间</el-button>
      </template>
    </el-dialog>

    <!-- 弹窗：新增目录 -->
    <el-dialog v-model="showAddCategory" :title="categoryForm.parent_id ? '新增子主题' : '创建主分类'" width="400px">
      <el-form :model="categoryForm" label-position="top">
        <el-form-item label="标题" for="cat_name_input">
          <el-input id="cat_name_input" v-model="categoryForm.name" placeholder="输入目录名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddCategory = false">取消</el-button>
        <el-button type="primary" @click="handleAddCategory">确认</el-button>
      </template>
    </el-dialog>

    <!-- 弹窗：知识卡片编辑器 (无障碍优化 + 修复 API) -->
    <el-dialog v-model="showCardEditor" title="知识卡片编辑器" width="85%" top="5vh" destroy-on-close>
      <el-form :model="cardForm" label-position="top">
        <div class="grid grid-cols-12 gap-8">
          <div class="col-span-8 space-y-6">
            <el-form-item label="节点标题" for="card_title_input">
              <el-input id="card_title_input" v-model="cardForm.title" placeholder="输入知识点名称" size="large" />
            </el-form-item>
            <el-form-item label="正面：核心内容 / 问题">
              <MdEditor v-model="cardForm.essence" height="300px" :toolbars-exclude="['github']" />
            </el-form-item>
            <el-form-item label="背面：详细解析 / 深度笔记">
              <MdEditor v-model="cardForm.insights" height="200px" :toolbars-exclude="['github']" />
            </el-form-item>
          </div>
          <div class="col-span-4 bg-gray-50 p-6 rounded-xl space-y-8 border border-gray-100">
            <el-form-item label="卡片展示逻辑">
               <el-radio-group v-model="cardForm.card_type" fill="#4f46e5">
                <el-radio-button value="qa">问答</el-radio-button>
                <el-radio-button value="note">笔记</el-radio-button>
                <el-radio-button value="code">代码</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="熟悉程度 (难度)">
              <el-rate v-model="cardForm.difficulty" :texts="['完全不懂', '略知一二', '掌握一般', '基本精通', '完美掌握']" show-text />
            </el-form-item>
            <el-form-item label="重要程度">
              <el-radio-group v-model="cardForm.importance">
                <el-radio-button value="A">核心</el-radio-button>
                <el-radio-button value="B">常用</el-radio-button>
                <el-radio-button value="C">边缘</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="初次复习间隔 (天)" for="card_interval_input">
              <el-input-number id="card_interval_input" v-model="cardForm.interval_days" :min="1" />
            </el-form-item>
            <div class="pt-10">
               <el-button type="primary" size="large" class="w-full shadow-lg shadow-indigo-200" @click="handleSaveCard">保存节点</el-button>
               <el-button size="large" class="w-full mt-4" @click="showCardEditor = false">暂不保存</el-button>
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
  Plus, Postcard, Cpu, Fold, Files, Lock, Memo, 
  Reading, Monitor, Coffee, Key, Opportunity, Collection 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css';

// API 与 Store
import { subjectApi, type Subject } from '../../api/subject'
import { categoryApi, type Category } from '../../api/category'
import { cardApi, type Card } from '../../api/card'
import { useAppStore } from '../../store/appStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const appStore = useAppStore()

// 图标映射
const iconMap: any = { 
  Book: Reading, 
  Code: Monitor, 
  Life: Coffee, 
  Core: Key, 
  Growth: Opportunity,
  Collection: Collection 
}

const subjects = ref<Subject[]>([])
const categories = ref<Category[]>([])
const cards = ref<Card[]>([])

const currentCategoryId = ref<number | null>(null)
const currentCategoryName = ref('')

const showAddSubject = ref(false)
const showAddCategory = ref(false)
const showCardEditor = ref(false)

const subjectForm = ref({ name: '', description: '', theme_color: '#6366f1', icon_type: 'Book', visibility: 'private' })
const categoryForm = ref({ name: '', parent_id: null as number | null })
const cardForm = ref({
  title: '',
  essence: '',
  insights: '',
  difficulty: 3,
  importance: 'B',
  interval_days: 1,
  card_type: 'qa'
})

const loadSubjects = async () => {
  const res = await subjectApi.list()
  subjects.value = res as any
}

const selectSubject = async (sub: Subject) => {
  appStore.setSubject(sub.id, sub.name, sub.theme_color)
  currentCategoryId.value = null
  cards.value = []
  const res = await categoryApi.listBySubject(sub.id)
  categories.value = res as any
}

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

const handleNodeClick = async (data: any) => {
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

const goToStudy = () => {
  if (cards.value.length === 0) {
    ElMessage.warning('当前分类下没有卡片')
    return
  }
  router.push('/study')
}

const handleAddSubject = async () => {
  if (!subjectForm.value.name) return
  await subjectApi.create(subjectForm.value)
  ElMessage.success('知识空间已建立')
  showAddSubject.value = false
  loadSubjects()
}

const prepareAddCategory = (parentId: number | null) => {
  categoryForm.value.name = ''
  categoryForm.value.parent_id = parentId
  showAddCategory.value = true
}

const handleAddCategory = async () => {
  if (!categoryForm.value.name || !appStore.currentSubjectId) return
  await categoryApi.create({
    name: categoryForm.value.name,
    parent_id: categoryForm.value.parent_id,
    subject_id: appStore.currentSubjectId,
    sort_order: 0
  })
  ElMessage.success('目录已更新')
  showAddCategory.value = false
  const res = await categoryApi.listBySubject(appStore.currentSubjectId)
  categories.value = res as any
}

const openCardEditor = () => {
  cardForm.value = { title: '', essence: '', insights: '', difficulty: 3, importance: 'B', interval_days: 1, card_type: 'qa' }
  showCardEditor.value = true
}

const handleSaveCard = async () => {
  if (!cardForm.value.title || !currentCategoryId.value) {
    ElMessage.warning('请填写必要标题')
    return
  }
  await cardApi.create({
    ...cardForm.value,
    category_id: currentCategoryId.value
  })
  ElMessage.success('记录已保存')
  showCardEditor.value = false
  loadCards()
}

onMounted(loadSubjects)
</script>

<style scoped>
:deep(.el-tree-node__content) {
  height: 40px;
  border-radius: 8px;
  margin: 4px 0;
  transition: all 0.2s;
}
:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #eef2ff !important;
  color: #4f46e5;
  font-weight: 600;
}
:deep(.el-tree-node__content:hover) {
  background-color: #f8fafc;
}
</style>