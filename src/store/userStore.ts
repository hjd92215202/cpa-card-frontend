import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
    state: () => ({
        token: localStorage.getItem('token') || '',
        userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
    }),
    getters: {
        isLoggedIn: (state) => !!state.token,
    },
    actions: {
        setAuth(token: string, user: any) {
            this.token = token;
            this.userInfo = user;
            localStorage.setItem('token', token);
            localStorage.setItem('userInfo', JSON.stringify(user));
        },
        logout() {
            this.token = '';
            this.userInfo = {};
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
        }
    }
});