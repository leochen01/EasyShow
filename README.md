# EasyShow

个人营销展示页面（PRD v1.1）基础工程，技术栈：Next.js 14 + TypeScript + Tailwind + Prisma + NextAuth。

## 当前状态

- 已完成项目骨架初始化（公开页 + 作品详情 + 管理后台路由）
- 已完成 Prisma 数据模型（Profile / SocialLink / Work / Analytics / Comment / Subscriber / EmailLog）
- 已完成基础 API 路由（profile / links / works / comments / subscribers / analytics / track）
- 已完成中英文页面入口：`/`、`/en`、`/work/[slug]`、`/en/work/[slug]`
- 已接入后台 Markdown 编辑器（工具栏、实时预览、代码高亮、图片上传、粘贴上传）
- 已支持上传存储切换（本地 `public/uploads` 或 OSS/S3 兼容对象存储）
- 已加入 Admin/API 鉴权边界（管理员登录 + 管理接口权限校验）
- 已加入留言防刷：同 IP 5 分钟限流 + Turnstile 验证（可选启用）
- 已接入 Newsletter 双重确认链路（Resend 验证邮件 + 激活 + 欢迎邮件 + 一键退订）
- 已接入 Newsletter 打开/点击埋点（回写 `EmailLog.openedAt` / `clickedAt`）
- 已使用 Recharts 补齐 Analytics/Newsletter 图表可视化

## 快速开始

1. 安装依赖

```bash
npm install
```

2. 创建环境变量

```bash
cp .env.example .env
```

3. 生成 Prisma Client + 初始化数据库

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

4. 启动开发环境

```bash
npm run dev
```

## 主要目录

- `src/app`: 页面与 API 路由
- `src/components`: 首页/作品/后台组件
- `src/lib`: db/auth/utils 等核心模块
- `prisma/schema.prisma`: 数据模型
- `prisma/seed.ts`: 初始数据

## 上传存储配置

- 本地存储（默认）：
  - `STORAGE_PROVIDER=local`
- OSS/S3 存储：
  - `STORAGE_PROVIDER=s3`
  - `S3_BUCKET`、`S3_REGION`、`S3_ACCESS_KEY_ID`、`S3_SECRET_ACCESS_KEY`
  - 可选：`S3_ENDPOINT`（兼容 OSS/MinIO）、`S3_PUBLIC_BASE_URL`、`S3_FORCE_PATH_STYLE`

## 留言安全配置

- 留言频率限制：
  - 已内置 `同 IP 5 分钟 1 条`，命中返回 `429` + `Retry-After`
- 验证码（Cloudflare Turnstile）：
  - 配置 `TURNSTILE_SECRET_KEY` 后，`POST /api/comments` 会强制校验 `captchaToken`
  - 前端可使用 `NEXT_PUBLIC_TURNSTILE_SITE_KEY` 渲染组件并提交 token

## Newsletter 配置（Resend）

- 需要配置：
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL`
  - `NEXT_PUBLIC_SITE_URL`（用于拼接验证/退订链接）
- 链路：
  - 用户提交邮箱 -> `POST /api/subscribers`
  - 系统发送验证邮件（`/api/subscribers/verify?token=...`）
  - 用户点击验证后状态变为 `active`，并发送欢迎邮件
  - 任意邮件可点击 `.../api/subscribers/unsubscribe?token=...` 一键退订
  - 邮件追踪：
    - 打开埋点：`/api/newsletter/open/[emailLogId]`
    - 点击埋点：`/api/newsletter/click?log=...&url=...`

## 下一阶段建议（按优先级）

1. Admin 订阅后台增加打开率/点击率可视化（按 type 聚合）
2. 使用 Recharts 补齐统计图表可视化
3. 增加 e2e / API 测试
