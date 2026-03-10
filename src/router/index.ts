import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue'; 
import KnowledgeBase from '../views/admin/KnowledgeBase.vue';
import Login from '../views/auth/Login.vue';
import StudyMode from '../views/study/StudyMode.vue';
import { useUserStore } from '../store/userStore';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: Home
        },
        {
            path: '/admin/kb',
            name: 'KnowledgeBase',
            component: KnowledgeBase
        },
        {
            path: '/study',
            name: 'Study',
            component: StudyMode
        },
        {
            path: '/print',
            name: 'Print',
            component: () => import('../views/admin/PrintView.vue')
        },
        {
            path: '/login',
            name: 'Login',
            component: Login
        }
    ]
});

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore();
  // 排除登录页，其他页面均需登录
  if (to.path !== '/login' && !userStore.isLoggedIn) {
    next('/login');
  } else {
    next();
  }
});

export default router;