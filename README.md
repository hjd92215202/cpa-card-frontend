# Polymath Hub - 考试学习卡片管理系统

一个现代化的闪卡学习平台，设计用于专业考试（特别是CPA）的高效复习。采用间隔重复算法，将学习内容转化为永久记忆。

## 🎯 项目概述

**Polymath Hub** 是一个基于Vue 3的前端应用，提供：
- 📚 **知识库管理**：创建、组织和管理学习内容
- 🎴 **闪卡系统**：交互式学习卡片（支持正反面翻转）
- 🧠 **间隔复习**：根据难度级别智能安排复习周期
- 📊 **进度追踪**：实时显示学习进度和完成状态
- 🎨 **现代UI**：响应式设计，视觉友好的用户界面

## 🏗️ 项目结构

```
src/
├── views/                      # 页面/路由视图
│   ├── Home.vue               # 首页 - 知识库展示
│   ├── admin/
│   │   └── KnowledgeBase.vue   # 知识库管理工作台
│   └── study/
│       └── StudyMode.vue       # 复习模式
├── components/
│   └── FlashCard.vue           # 闪卡组件（可翻转）
├── api/                        # API接口层
│   ├── index.ts               # Axios实例配置
│   ├── card.ts                # 卡片API
│   ├── category.ts            # 分类API
│   └── subject.ts             # 科目API
├── router/
│   └── index.ts               # 路由配置
├── store/
│   └── appStore.ts            # Pinia全局状态管理
├── assets/                    # 静态资源
├── App.vue                    # 根组件
├── main.ts                    # 应用入口
└── style.css                  # 全局样式
```

## 🚀 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
应用将运行在 `http://localhost:5173`

### 生产构建
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

## 📋 主要功能

### 1. 首页 (Home)
- 展示所有知识库/科目卡片
- 每个科目卡片显示：名称、描述、可见性（公开/私有）
- 点击卡片进入学习模式
- 快速创建新知识库

### 2. 知识库管理 (Knowledge Base)
三栏式布局：
- **左栏**：知识空间导航 - 快速切换不同科目
- **中栏**：目录大纲树 - 组织章节和分类
- **右栏**：内容管理 - 创建、编辑、删除卡片

功能特性：
- 支持多级目录结构
- 卡片类型支持（代码/笔记）
- 重要性等级标记 (A/B/C)
- 难度评分系统

### 3. 复习模式 (Study Mode)
- 根据分类加载相关卡片
- 交互式闪卡翻转查看
- 进度条实时显示
- 三档难度反馈机制：
  - 「太难了」→ 1天后复习
  - 「模糊」→ 3天后复习
  - 「简单」→ 7天后复习
- 复习完成时显示成就提示

## 🛠️ 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue 3 | 3.5.25 |
| 语言 | TypeScript | ~5.9.3 |
| 构建工具 | Vite | 7.3.1 |
| UI组件库 | Element Plus | 2.13.5 |
| 样式 | Tailwind CSS | 4.2.1 |
| 状态管理 | Pinia | 3.0.4 |
| 路由 | Vue Router | 4.6.4 |
| HTTP客户端 | Axios | 1.13.6 |
| Markdown编辑 | md-editor-v3 | 6.4.0 |
| 图标库 | lucide-vue-next | 0.577.0 |

## 📦 核心模块

### API 模块 (`src/api/`)
- **axios配置**：自动添加错误处理和响应拦截
- **baseURL**：`http://localhost:3000/api`
- **超时**：5000ms
- **错误处理**：统一使用 Element Plus Toast通知

### 状态管理 (`src/store/`)
- **appStore.ts**：管理全局应用状态
  - currentSubjectId：当前选中的科目
  - currentCategoryId：当前选中的分类
  - 其他应用层状态

### 路由配置 (`src/router/`)
```
/ → Home (首页)
/admin/kb → KnowledgeBase (管理工作台)
/study → StudyMode (复习模式)
```

## 🎨 UI设计特色

- **现代风格**：使用Tailwind CSS实现响应式设计
- **渐变配色**：品牌色采用靛蓝→蓝色渐变
- **互动体验**：卡片悬停动画、平滑过渡效果
- **响应式**：完美支持移动设备和桌面端
- **易用性**：直观的三栏式管理界面

## 🔄 数据流向

```
Home (展示) → KnowledgeBase (管理) → StudyMode (学习)
                    ↓
                  API调用
                    ↓
            Rust后端 (localhost:3000)
```

## 📝 卡片数据结构

```typescript
interface Card {
  id: string
  title: string              // 卡片标题
  essence: string            // 核心要点/考点
  insights?: string          // 备考心得/坑点提醒
  difficulty: number         // 难度评分 (1-5)
  importance: 'A' | 'B' | 'C' // 重要性等级
  card_type: 'code' | 'note' // 卡片类型
}
```

## 🎯 间隔复习算法

基于用户反馈设定复习间隔：
- **1天** - 标记为「太难了」时触发
- **3天** - 标记为「模糊」时触发  
- **7天** - 标记为「简单」时触发

后端（Rust）负责计算下次复习时间。

## 💡 使用建议

1. **首次使用**：从首页创建新的知识库
2. **内容组织**：使用按章节/主题分类，方便管理
3. **高效复习**：
   - 每日坚持复习
   - 优先复习重要等级为A的卡片
   - 根据难度反馈调整学习策略
4. **内容维护**：定期更新备考心得和坑点提醒

## 🔧 开发指南

### 添加新页面
1. 在 `src/views/` 创建 `.vue` 文件
2. 在 `src/router/index.ts` 中注册路由
3. 使用 `useRouter()` 进行导航

### 调用API
```typescript
import { cardApi } from '@/api/card'

const response = await cardApi.getCards(categoryId)
```

### 使用全局状态
```typescript
import { useAppStore } from '@/store/appStore'

const appStore = useAppStore()
appStore.currentSubjectId = 'xxx'
```

## 📱 浏览器支持

- Chrome/Edge (最新版本)
- Firefox (最新版本)
- Safari (最新版本)

## 📄 许可证

待补充

## 👨‍💻 贡献指南

待补充

## 🤝 后端连接

本项目需要配套的Rust后端服务：
- **API地址**：`http://localhost:3000/api`
- **功能**：处理卡片CRUD、间隔复习计算、用户认证等

## 📞 支持

遇到问题？请检查：
1. Node.js 和 npm 版本
2. 后端服务是否在运行
3. 浏览器控制台的错误消息
4. 网络连接是否正常

---

**Polymath Hub** - 构建你的第二大脑 🧠💡
