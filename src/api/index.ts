import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../store/userStore';

const api = axios.create({
  // Rust 后端地址
  baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:3000/api',
  timeout: 5000,
});

// 请求拦截：注入 Token
api.interceptors.request.use((config) => {
  const userStore = useUserStore();
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`;
  }
  return config;
});

// 响应拦截：处理 401 过期
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      const userStore = useUserStore();
      userStore.logout();
      ElMessage.error('登录已过期，请重新登录');
    } else {
      const message = error.response?.data?.error || '请求失败';
      ElMessage.error(message);
    }
    return Promise.reject(error);
  }
);

export default api;