import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue'; // 新建首页
import KnowledgeBase from '../views/admin/KnowledgeBase.vue';
import StudyMode from '../views/study/StudyMode.vue';

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
        }
    ]
});

export default router;