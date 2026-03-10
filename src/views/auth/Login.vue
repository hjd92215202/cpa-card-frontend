<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div class="bg-white w-full max-w-md rounded-3xl shadow-xl p-10">
      <div class="text-center mb-10">
        <h1 class="text-3xl font-black text-indigo-600">CPA Polymath</h1>
        <p class="text-slate-400 mt-2">{{ isLogin ? '欢迎回来' : '开启学习之旅' }}</p>
      </div>

      <el-form label-position="top">
        <el-form-item label="用户名">
          <el-input v-model="form.username" size="large" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" size="large" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-form-item v-if="!isLogin" label="电子邮箱 (可选)">
          <el-input v-model="form.email" size="large" placeholder="xxx@example.com" />
        </el-form-item>

        <el-button type="primary" size="large" class="w-full mt-6" :loading="loading" @click="handleSubmit">
          {{ isLogin ? '登录' : '注册并登录' }}
        </el-button>
      </el-form>

      <div class="mt-8 text-center text-sm">
        <span class="text-slate-400">{{ isLogin ? '没有账号?' : '已有账号?' }}</span>
        <el-button link type="primary" @click="isLogin = !isLogin">
          {{ isLogin ? '立即注册' : '返回登录' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import api from '../../api';
import { useUserStore } from '../../store/userStore';

const router = useRouter();
const userStore = useUserStore();
const isLogin = ref(true);
const loading = ref(false);

const form = ref({ username: '', password: '', email: '' });

const handleSubmit = async () => {
  if (!form.value.username || !form.value.password) return;
  loading.value = true;
  try {
    if (isLogin.value) {
      const res: any = await api.post('/auth/login', form.value);
      userStore.setAuth(res.token, { id: res.user_id, username: res.username });
      ElMessage.success('登录成功');
    } else {
      await api.post('/auth/register', form.value);
      isLogin.value = true;
      ElMessage.success('注册成功，请登录');
      return;
    }
    router.push('/');
  } finally {
    loading.value = false;
  }
};
</script>