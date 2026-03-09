import { createRouter, createWebHistory } from 'vue-router';
import KnowledgeBase from '../views/admin/KnowledgeBase.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/admin/kb'
    },
    {
      path: '/admin/kb',
      name: 'KnowledgeBase',
      component: KnowledgeBase
    },
    // 后续增加复习页面
    // { path: '/study', component: () => import('../views/study/StudyView.vue') }
  ]
});

export default router;