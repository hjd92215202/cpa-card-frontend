import axios from 'axios';
import { ElMessage } from 'element-plus';

const api = axios.create({
  // Rust 后端地址
  baseURL: 'http://localhost:3000/api',
  timeout: 5000,
});

// 响应拦截器：统一处理错误提示
api.interceptors.response.use(
  (response) => {
    // 直接返回数据部分
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.error || '请求失败';
    ElMessage.error(message);
    return Promise.reject(error);
  }
);

export default api;