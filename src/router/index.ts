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
        {
            path: '/study',
            name: 'Study',
            component: () => import('../views/study/StudyMode.vue')
        }
    ]
});

export default router;