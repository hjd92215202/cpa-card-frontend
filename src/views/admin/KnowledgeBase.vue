<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden text-gray-700">
    <!-- 1. 最左侧：CPA 科目导航 -->
    <div class="w-60 bg-slate-900 text-white flex flex-col shadow-xl">
      <div class="p-5 flex justify-between items-center border-b border-slate-700">
        <h1 class="font-bold text-lg tracking-wider">CPA 知识库</h1>
        <el-button :icon="Plus" circle size="small" @click="showAddSubject = true" />
      </div>
      <div class="flex-1 overflow-y-auto py-2">
        <div 
          v-for="sub in subjects" :key="sub.id"
          @click="selectSubject(sub)"
          :class="['px-5 py-4 cursor-pointer transition-all flex items-center gap-3 border-l-4', 
                    appStore.currentSubjectId === sub.id ? 'bg-slate-800 border-blue-500 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800']"
        >
          <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: sub.theme_color }"></div>
          {{ sub.name }}
        </div>
      </div>
    </div>

    <!-- 2. 中间：章节树 -->
    <div class="w-80 bg-white border-r flex flex-col shadow-sm">
      <div class="p-5 border-b flex justify-between items-center">
        <span class="font-bold text-gray-600">章节大纲</span>
        <el-button v-if="appStore.currentSubjectId" link :icon="Plus" @click="prepareAddCategory(null)">根章节</el-button>
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
              <span>{{ data.name }}</span>
              <el-icon 
                class="hidden group-hover:block text-blue-500" 
                @click.stop="prepareAddCategory(data.id)"
              ><Plus /></el-icon>
            </div>
          </template>
        </el-tree>
        <div v-else class="h-full flex items-center justify-center text-gray-400 text-xs">
          选择科目以查看章节
        </div>
      </div>
    </div>

    <!-- 3. 右侧：卡片列表展示区 -->
    <div class="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      <header v-if="currentCategoryId" class="bg-white p-6 border-b flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-gray-800">{{ currentCategoryName }}</h2>
          <p class="text-xs text-gray-400 mt-1">当前章节共 {{ cards.length }} 张知识卡片</p>
        </div>
        <el-button type="success" :icon="Postcard" @click="goToStudy">开始复习</el-button>
        <el-button type="primary" :icon="Plus" @click="openCardEditor">录入卡片</el-button>
      </header>

      <main class="flex-1 overflow-y-auto p-6">
        <div v-if="currentCategoryId">
          <div v-if="cards.length > 0" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <el-card 
              v-for="card in cards" :key="card.id" 
              shadow="hover" 
              class="border-none rounded-xl relative group"
            >
              <template #header>
                <div class="flex justify-between items-center">
                  <span class="font-bold truncate pr-4 text-gray-700">{{ card.title }}</span>
                  <el-tag :type="card.importance === 'A' ? 'danger' : 'info'" effect="dark" size="small">
                    {{ card.importance }}级考点
                  </el-tag>
                </div>
              </template>
              <div class="text-sm text-gray-500 line-clamp-3 min-h-[60px] leading-relaxed">
                {{ card.essence }}
              </div>
              <div class="mt-4 pt-4 border-t flex justify-between items-center">
                <el-rate v-model="card.difficulty" disabled size="small" />
                <span class="text-[10px] text-gray-400 font-mono">NEXT: {{ card.next_review_date || '未复习' }}</span>
              </div>
            </el-card>
          </div>
          <div v-else class="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl">
            <el-icon class="text-gray-300" :size="48"><Postcard /></el-icon>
            <p class="text-gray-400 mt-4">该章节暂无卡片，点击右上角开始添加</p>
          </div>
        </div>
        <div v-else class="h-full flex flex-col items-center justify-center text-gray-400">
          <img src="https://cdn-icons-png.flaticon.com/512/4072/4072307.png" class="w-32 opacity-20 mb-4" />
          <p>请选中一个章节查看或管理卡片</p>
        </div>
      </main>
    </div>

    <!-- 弹窗：新增科目 -->
    <el-dialog v-model="showAddSubject" title="新增 CPA 科目" width="400px" destroy-on-close>
      <el-form :model="subjectForm" label-position="top">
        <el-form-item label="科目名称">
          <el-input v-model="subjectForm.name" placeholder="如：会计" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="subjectForm.description" type="textarea" placeholder="科目简要说明" />
        </el-form-item>
        <el-form-item label="主题颜色">
          <el-color-picker v-model="subjectForm.theme_color" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddSubject = false">取消</el-button>
        <el-button type="primary" @click="handleAddSubject">创建</el-button>
      </template>
    </el-dialog>

    <!-- 弹窗：新增章节 -->
    <el-dialog v-model="showAddCategory" :title="categoryForm.parent_id ? '新增子章节' : '新增根章节'" width="400px">
      <el-form :model="categoryForm" label-position="top">
        <el-form-item label="章节名称">
          <el-input v-model="categoryForm.name" placeholder="输入章节名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddCategory = false">取消</el-button>
        <el-button type="primary" @click="handleAddCategory">创建</el-button>
      </template>
    </el-dialog>

    <!-- 弹窗：知识卡片编辑器 (大弹窗) -->
    <el-dialog v-model="showCardEditor" title="知识卡片编辑器" width="85%" top="5vh">
      <el-form :model="cardForm" label-position="top">
        <div class="grid grid-cols-12 gap-8">
          <!-- 左侧：内容输入 -->
          <div class="col-span-8 space-y-6">
            <el-form-item label="卡片标题 (必填)">
              <el-input v-model="cardForm.title" placeholder="如：金融资产的初始计量" size="large" />
            </el-form-item>
            <el-form-item label="正面：知识精华 (支持 Markdown)">
              <MdEditor v-model="cardForm.essence" height="300px" />
            </el-form-item>
            <el-form-item label="背面：备考心得 (支持 Markdown)">
              <MdEditor v-model="cardForm.insights" height="200px" />
            </el-form-item>
          </div>
          <!-- 右侧：属性设置 -->
          <div class="col-span-4 bg-gray-50 p-6 rounded-xl space-y-8">
            <el-form-item label="掌握程度 (难度)">
              <el-rate v-model="cardForm.difficulty" :texts="['极易', '简单', '中等', '困难', '极难']" show-text />
            </el-form-item>
            <el-form-item label="考试重要程度">
              <el-radio-group v-model="cardForm.importance">
                <el-radio-button label="A">高频考点</el-radio-button>
                <el-radio-button label="B">常考考点</el-radio-button>
                <el-radio-button label="C">一般了解</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="默认复习间隔 (天)">
              <el-input-number v-model="cardForm.interval_days" :min="1" :max="365" />
            </el-form-item>
            <div class="pt-10">
               <el-button type="primary" size="large" class="w-full" @click="handleSaveCard">保存卡片</el-button>
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
import { Plus, Postcard } from '@element-plus/icons-vue'
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

// 1. 基础数据
const subjects = ref<Subject[]>([])
const categories = ref<Category[]>([])
const cards = ref<Card[]>([])

// 2. 当前选中状态
const currentCategoryId = ref<number | null>(null)
const currentCategoryName = ref('')

// 3. 弹窗控制
const showAddSubject = ref(false)
const showAddCategory = ref(false)
const showCardEditor = ref(false)

// 4. 表单数据
const subjectForm = ref({ name: '', description: '', theme_color: '#1890ff' })
const categoryForm = ref({ name: '', parent_id: null as number | null })
const cardForm = ref({
  title: '',
  essence: '',
  insights: '',
  difficulty: 3,
  importance: 'B',
  interval_days: 1
})

// --- 逻辑方法 ---

// 加载学科列表
const loadSubjects = async () => {
  const res = await subjectApi.list()
  subjects.value = res as any
}

// 选择学科：加载章节并重置状态
const selectSubject = async (sub: Subject) => {
  appStore.setSubject(sub.id, sub.name, sub.theme_color)
  currentCategoryId.value = null
  cards.value = []
  const res = await categoryApi.listBySubject(sub.id)
  categories.value = res as any
}

// 转换章节树
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

// 点击章节：加载所属卡片
const handleNodeClick = async (data: any) => {
  currentCategoryId.value = data.id
  currentCategoryName.value = data.name
  // 同步到 store
  appStore.setCategory(data.id, data.name) 
  loadCards()
}

const loadCards = async () => {
  if (!currentCategoryId.value) return
  const res = await cardApi.listByCategory(currentCategoryId.value)
  cards.value = res as any
}

// 新增跳转方法
const goToStudy = () => {
  if (cards.value.length === 0) {
    ElMessage.warning('该章节还没有卡片，先录入一些吧')
    return
  }
  router.push('/study')
}

// 学科与章节的新增逻辑
const handleAddSubject = async () => {
  if (!subjectForm.value.name) return
  await subjectApi.create(subjectForm.value)
  ElMessage.success('科目创建成功')
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
  ElMessage.success('章节已加入大纲')
  showAddCategory.value = false
  const res = await categoryApi.listBySubject(appStore.currentSubjectId)
  categories.value = res as any
}

// 卡片录入逻辑
const openCardEditor = () => {
  cardForm.value = { title: '', essence: '', insights: '', difficulty: 3, importance: 'B', interval_days: 1 }
  showCardEditor.value = true
}

const handleSaveCard = async () => {
  if (!cardForm.value.title || !currentCategoryId.value) {
    ElMessage.warning('请填写卡片标题')
    return
  }
  await cardApi.create({
    ...cardForm.value,
    category_id: currentCategoryId.value
  })
  ElMessage.success('知识卡片录入成功')
  showCardEditor.value = false
  loadCards()
}

onMounted(loadSubjects)
</script>

<style scoped>
/* 深度修改 Element Tree 样式 */
:deep(.el-tree-node__content) {
  height: 36px;
  border-radius: 6px;
  margin: 2px 0;
}
:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #f0f7ff !important;
  color: #1890ff;
  font-weight: bold;
}
</style>