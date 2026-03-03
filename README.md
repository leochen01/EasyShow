# EasyShow

EasyShow 是一个个人品牌展示与内容运营系统，面向独立开发者、创作者、技术高管等需要线上展示个人影响力的人群。

- 前台：品牌落地页、作品分类展示、作品详情、留言与订阅
- 后台：个人资料、社交链接、作品管理、留言审核、订阅管理、统计分析
- 支持：中英文、Markdown 编辑、S3/OSS 上传、验证码与限流、邮件订阅链路、基础埋点

## 核心功能

### 1. 个人品牌展示
- 首页品牌区：头像、标题、简介、社交链接、主题色
- 落地页配置：`kicker / headline / subline / ctaSecondary(+url)`
- 中英文切换（`/` 与 `/en`）
- 作品分类标签页：热门 / 文章 / 视频 / 软件 / 工具
- 搜索、筛选、分页展示

### 2. 作品系统
- 类型：`article | video | software | tool`
- 支持二级分类、可见/推荐状态、发布时间
- 详情页 Markdown 渲染（GFM、代码高亮、图片）
- 视频支持 Bilibili / YouTube 嵌入
- 软件/工具支持“卡片直达链接”与“无链接时正文展示”
- 详情页增强：
  - 固定返回按钮
  - 右侧目录按钮（可展开/收起目录，平滑跳转）

### 3. 后台管理
- 登录鉴权（NextAuth + 管理员权限边界）
- 个人资料管理：主题色、背景色、SEO、默认语言、favicon、头像上传
- 社交链接管理：显示开关、排序、平台字段
- 作品管理：
  - 全屏新建/编辑面板
  - Markdown 工具栏（标题/加粗/代码块/链接/表格/文字前景色/背景色）
  - 粘贴图片自动上传
  - 编辑区与预览区滚动双向同步（全屏/非全屏）
  - 固定右下角操作按钮（创建/保存/删除/关闭）
- 留言管理：审核、筛选、分页
- 订阅管理：筛选、分页、状态管理
- 统计分析：图表 + 榜单（分页与每页条数选择）

### 4. 订阅与通知
- Newsletter 双重确认订阅
- 验证邮件、欢迎邮件、一键退订
- 打开率/点击率埋点回写 `EmailLog.openedAt/clickedAt`
- 后台聚合可视化

### 5. 安全与风控
- Admin/API 权限校验
- 留言 Turnstile 验证（可选启用）
- 留言频率限制（同 IP 5 分钟 1 条）

## 技术栈

- 框架：Next.js 14（App Router）+ React 18 + TypeScript
- 样式：Tailwind CSS
- 认证：NextAuth
- 数据库：Prisma（开发默认 SQLite，可迁移 PostgreSQL）
- 邮件：Resend
- 图表：Recharts
- 内容渲染：React Markdown + remark-gfm + rehype-highlight + rehype-raw
- 对象存储：本地 / S3 / OSS 兼容服务

## 目录结构

```text
EasyShow/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── en/
│   │   ├── work/[slug]/
│   │   ├── admin/
│   │   └── api/
│   ├── components/
│   │   ├── home/
│   │   ├── works/
│   │   ├── admin/
│   │   └── common/
│   ├── lib/
│   └── styles/
├── .env.example
└── package.json
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境变量

```bash
cp .env.example .env
```

### 3. 初始化数据库

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

### 4. 启动开发

```bash
npm run dev
```

访问：
- 前台：`http://localhost:3000`
- 后台登录：`http://localhost:3000/admin/login`

## 环境变量说明

| 变量 | 说明 |
| --- | --- |
| `DATABASE_URL` | 数据库连接（默认 sqlite: `file:./dev.db`） |
| `NEXTAUTH_URL` | NextAuth 回调地址 |
| `NEXTAUTH_SECRET` | NextAuth 密钥 |
| `ADMIN_EMAIL` | 初始化管理员邮箱 |
| `ADMIN_PASSWORD` | 初始化管理员密码 |
| `RESEND_API_KEY` | Resend API Key |
| `RESEND_FROM_EMAIL` | 发件人（如 `EasyShow <no-reply@yourdomain.com>`） |
| `NEXT_PUBLIC_SITE_URL` | 站点公网地址（用于邮件链接拼接） |
| `STORAGE_PROVIDER` | `local` 或 `s3` |
| `S3_BUCKET` | S3/OSS Bucket 名称 |
| `S3_REGION` | 区域 |
| `S3_ENDPOINT` | 可选，自建/兼容服务地址 |
| `S3_ACCESS_KEY_ID` | Access Key |
| `S3_SECRET_ACCESS_KEY` | Secret Key |
| `S3_PUBLIC_BASE_URL` | 可选，公开访问前缀 |
| `S3_FORCE_PATH_STYLE` | 可选，`true/false` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile 前端 site key（可选） |
| `TURNSTILE_SECRET_KEY` | Turnstile 服务端 secret（可选） |

## 常用脚本

```bash
npm run dev              # 本地开发
npm run build            # 生产构建
npm run start            # 生产启动
npm run lint             # 代码检查
npm run prisma:generate  # 生成 Prisma Client
npm run prisma:migrate   # 执行开发迁移
npm run prisma:seed      # 初始化种子数据
```

## 部署建议

### Vercel
适用：快速上线、自动 CI/CD、默认 HTTPS。

1. 安装并登录 Vercel CLI（可选，推荐）

```bash
npm i -g vercel
vercel login
```

2. 在项目根目录关联 Vercel 项目

```bash
cd /path/to/EasyShow
vercel link
```

3. 配置生产环境变量（建议在 Vercel Dashboard 配置；CLI 示例）

```bash
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add ADMIN_EMAIL production
vercel env add ADMIN_PASSWORD production
vercel env add RESEND_API_KEY production
vercel env add RESEND_FROM_EMAIL production
vercel env add NEXT_PUBLIC_SITE_URL production
```

如使用对象存储/验证码，再补充：

```bash
vercel env add STORAGE_PROVIDER production
vercel env add S3_BUCKET production
vercel env add S3_REGION production
vercel env add S3_ENDPOINT production
vercel env add S3_ACCESS_KEY_ID production
vercel env add S3_SECRET_ACCESS_KEY production
vercel env add S3_PUBLIC_BASE_URL production
vercel env add S3_FORCE_PATH_STYLE production
vercel env add NEXT_PUBLIC_TURNSTILE_SITE_KEY production
vercel env add TURNSTILE_SECRET_KEY production
```

4. 执行生产部署

```bash
vercel --prod
```

5. 数据库迁移（必须在生产库执行）

如果你使用可直连的生产数据库，在本地执行：

```bash
DATABASE_URL='你的生产数据库连接串' npx prisma migrate deploy
DATABASE_URL='你的生产数据库连接串' npm run prisma:seed
```

说明：
- `prisma migrate dev` 仅用于开发环境。
- 生产请使用 `prisma migrate deploy`。
- 若部署在 Vercel + Serverless，建议生产数据库使用 PostgreSQL。

### 自有服务器
适用：可控性高、可部署在内网或私有云。

以下示例以 Ubuntu + Node.js 20 + Nginx + PM2 为例。

1. 安装 Node.js 与 PM2

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm i -g pm2
node -v
npm -v
```

2. 拉取代码并安装依赖

```bash
git clone git@github.com:leochen01/EasyShow.git
cd EasyShow
npm ci
```

3. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`，至少填写：
- `DATABASE_URL`
- `NEXTAUTH_URL`（如 `https://your-domain.com`）
- `NEXTAUTH_SECRET`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SITE_URL`
- 邮件/对象存储/验证码相关（按需）

4. 生产迁移 + 构建

```bash
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm run build
```

5. 使用 PM2 启动并设置开机自启

```bash
pm2 start npm --name easyshow -- start
pm2 save
pm2 startup
```

6. Nginx 反向代理（示例）

```nginx
server {
  listen 80;
  server_name your-domain.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

应用配置：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

7. HTTPS（Let's Encrypt）

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

8. 后续更新发布

```bash
cd /path/to/EasyShow
git pull
npm ci
npx prisma migrate deploy
npm run build
pm2 restart easyshow
```

## 数据与埋点说明

- 页面访问埋点：`/api/track`
- 统计数据：`Analytics`、`WorkView`
- 留言数据：`Comment`
- 订阅数据：`Subscriber`、`EmailLog`

## 已知注意事项

- 生产环境建议使用 PostgreSQL，避免 SQLite 并发写入瓶颈。
- 若启用邮件订阅，请确保发信域名已在 Resend 验证。
- 若启用 Turnstile，请前后端 key 成对配置，否则留言会被拒绝。
- 若切换到 S3/OSS，请确认 Bucket 跨域与公网读策略配置正确。

## License

当前仓库未声明开源许可证。若需开源，请补充 `LICENSE` 文件。
