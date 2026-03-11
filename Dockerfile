# 阶段 1: 构建阶段 - 使用 Node 22 (LTS) 以匹配 Vite 7 的要求
FROM node:22-alpine AS build-stage

WORKDIR /app

# 拷贝依赖定义
COPY package*.json ./

# 安装依赖
RUN npm install

# 拷贝源代码并打包
COPY . .
RUN npm run build

# 阶段 2: 运行阶段 (Nginx)
FROM nginx:stable-alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
