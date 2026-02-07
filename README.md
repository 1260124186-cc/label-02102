# Vue 双视频对比播放器

## How to Run

### 使用 Docker Compose（推荐）

```bash
# 构建并启动服务（后台运行）
docker-compose up --build -d

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 本地开发

```bash
# 进入前端目录
cd frontend-admin

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 验证 ARM 镜像兼容性

```bash
# 验证 nginx 镜像支持 ARM
docker pull --platform linux/arm64 nginx:alpine

# 验证 node 镜像支持 ARM
docker pull --platform linux/arm64 node:20-alpine
```

## Services

| 服务名称 | 端口 | 描述 |
|---------|------|------|
| frontend-admin | 8081 | Vue 前端管理应用 |

## 测试账号

本项目为纯前端应用，无需登录账号。

## 题目内容

vue 实现一个可以设置 播放起止秒数的播放器，同时可以选择 两个视频，左右结构 web应用 ，主要用来对比两个视频，所以要能实现 两个视频同步播放

项目要求为:
1. 必须提供 README.md，除了要包含你的项目介绍，需要在最前面增加三个二级标题1 How to Run2 Services3 测试账号4 题目内容(上述的项目需求)
2. 编写一个Dodckerfile （需要包含编译过程、基础镜像要选用跨平台版本 同时支持 ARM 和 X86）
3. 前端项目的对外映射端口为 8081 ，如有两个就是 8081、8082。
4. 根目录增加 docker-compose.yml 和 .gitignore 和 README.md
5. 项目目录清晰禁止所有逻辑堆在单一文件中。
6. 视觉分层：必须通过背景色、卡片阴影、边框区分功能区。禁止页面元素平铺在纯白背景上。布局与对齐：严格遵守栅格或 Flex 布局，间距（Padding/Margin）需统一（如 8px/16px/24px）。渲染完整性：图片使用占位符，图标使用 Icon 组件，确保无破损显示。交互反馈：按钮需有 Hover 效果和 Loading 状态；操作成功/失败需有 Toast/Message 提示。风格统一：字体颜色、字号、圆角风格必须保持全站一致。

---

## 功能特性

- 🎬 双视频同步播放/暂停
- ⏱️ 可设置播放起止时间（秒）
- 📁 支持本地视频文件选择
- 🔗 支持视频 URL 输入
- 🎛️ 统一播放控制（播放/暂停/重置）
- 📊 实时显示播放进度
- 🎨 现代化 UI 设计

## 技术栈

- Vue 3 + Composition API
- Vite 构建工具
- CSS3 Flexbox 布局
- Docker 容器化部署
- Nginx 静态服务

## 项目结构

```
├── frontend-admin/             # 前端项目目录
│   ├── src/
│   │   ├── components/         # 组件目录
│   │   │   ├── VideoPlayer.vue       # 单个视频播放器组件
│   │   │   ├── VideoCompare.vue      # 视频对比容器组件
│   │   │   ├── ControlPanel.vue      # 控制面板组件
│   │   │   ├── TimeRangeInput.vue    # 时间范围输入组件
│   │   │   └── ToastMessage.vue      # 提示消息组件
│   │   ├── composables/        # 组合式函数
│   │   │   └── useVideoSync.js       # 视频同步逻辑
│   │   ├── styles/             # 样式文件
│   │   │   └── variables.css         # CSS 变量
│   │   ├── App.vue             # 根组件
│   │   └── main.js             # 入口文件
│   ├── Dockerfile              # Docker 构建文件（支持 ARM/X86）
│   ├── nginx.conf              # Nginx 配置
│   ├── index.html              # HTML 入口
│   ├── vite.config.js          # Vite 配置
│   └── package.json            # 项目依赖
├── docker-compose.yml          # Docker Compose 配置
├── .gitignore                  # Git 忽略文件
└── README.md                   # 项目说明
```

## 使用说明

1. 启动应用后访问 http://localhost:8081
2. 在左右两侧分别选择要对比的视频（支持本地文件或 URL）
3. 设置播放起止时间（可选）
4. 点击"播放"按钮同步播放两个视频
5. 使用"暂停"和"重置"按钮控制播放
