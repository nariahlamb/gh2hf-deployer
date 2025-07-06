# GitHub to Hugging Face Spaces Deployer

一键将GitHub上的Docker项目部署到Hugging Face Spaces的Web应用程序。

[![Build Check](https://github.com/nariahlamb/gh2hf-deployer/actions/workflows/build-check.yml/badge.svg)](https://github.com/nariahlamb/gh2hf-deployer/actions/workflows/build-check.yml)
[![Deploy to Vercel](https://github.com/nariahlamb/gh2hf-deployer/actions/workflows/deploy.yml/badge.svg)](https://github.com/nariahlamb/gh2hf-deployer/actions/workflows/deploy.yml)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnariahlamb%2Fgh2hf-deployer&env=GITHUB_TOKEN,HUGGINGFACE_TOKEN,HUGGINGFACE_USERNAME&envDescription=Required%20API%20tokens%20for%20GitHub%20and%20Hugging%20Face&envLink=https%3A%2F%2Fgithub.com%2Fnariahlamb%2Fgh2hf-deployer%23environment-variables)

## 🚀 功能特性

- **🔍 自动检测**: 自动检测GitHub仓库中的Docker配置文件
- **⚡ 一键部署**: 简单几步即可部署到Hugging Face Spaces
- **📊 实时监控**: 实时查看部署进度和日志
- **🎨 现代界面**: 响应式设计，支持移动端
- **🔒 安全可靠**: 使用官方API，安全可靠

## 🛠️ 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **状态管理**: Zustand
- **UI组件**: Radix UI, Shadcn/ui
- **API集成**: GitHub REST API, Hugging Face Hub API
- **部署**: Vercel

## 📋 环境要求

- Node.js 18+
- GitHub Personal Access Token
- Hugging Face Access Token

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/nariahlamb/gh2hf-deployer.git
cd gh2hf-deployer
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.local.example` 到 `.env.local` 并填入您的API密钥：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件：

```env
# GitHub API Configuration
GITHUB_TOKEN=your_github_personal_access_token_here

# Hugging Face API Configuration
HUGGINGFACE_TOKEN=your_huggingface_access_token_here
HUGGINGFACE_USERNAME=your_huggingface_username

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🔑 环境变量

| 变量名 | 必需 | 描述 |
|--------|------|------|
| `GITHUB_TOKEN` | ✅ | GitHub Personal Access Token，用于访问GitHub API |
| `HUGGINGFACE_TOKEN` | ✅ | Hugging Face Access Token，用于创建和管理Spaces |
| `HUGGINGFACE_USERNAME` | ✅ | 您的Hugging Face用户名 |
| `NEXT_PUBLIC_APP_URL` | ❌ | 应用程序URL（生产环境自动设置） |

### 获取API密钥

#### GitHub Token
1. 访问 [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token (classic)"
3. 选择以下权限：
   - `repo` (访问仓库)
   - `read:user` (读取用户信息)
4. 复制生成的token

#### Hugging Face Token
1. 访问 [Hugging Face Settings > Access Tokens](https://huggingface.co/settings/tokens)
2. 点击 "New token"
3. 选择 "Write" 权限
4. 复制生成的token

## 📦 一键部署到Vercel

点击下面的按钮一键部署到Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnariahlamb%2Fgh2hf-deployer&env=GITHUB_TOKEN,HUGGINGFACE_TOKEN,HUGGINGFACE_USERNAME&envDescription=Required%20API%20tokens%20for%20GitHub%20and%20Hugging%20Face&envLink=https%3A%2F%2Fgithub.com%2Fnariahlamb%2Fgh2hf-deployer%23environment-variables)

部署时需要设置以下环境变量：
- `GITHUB_TOKEN` - GitHub Personal Access Token
- `HUGGINGFACE_TOKEN` - Hugging Face Access Token
- `HUGGINGFACE_USERNAME` - 您的Hugging Face用户名

📖 **详细部署指南：** [DEPLOYMENT.md](DEPLOYMENT.md)
📚 **使用说明：** [USAGE.md](USAGE.md)

## 📖 使用指南

### 快速开始
1. **输入仓库URL** → 自动检测Docker配置
2. **配置Space参数** → 设置名称、可见性、硬件
3. **一键部署** → 实时监控进度
4. **获取链接** → 立即访问您的应用

### 示例项目
可以用来测试的公开项目：
- `https://github.com/gradio-app/gradio` - Gradio机器学习界面
- `https://github.com/streamlit/streamlit-hello` - Streamlit数据应用
- `https://github.com/tiangolo/fastapi` - FastAPI Web框架

### 详细步骤
1. **输入GitHub仓库**
   - 支持多种URL格式
   - 自动验证仓库访问权限
   - 检测Docker配置文件

2. **验证配置**
   - 显示仓库信息和统计
   - 分析Docker配置详情
   - 确认部署兼容性

3. **配置部署**
   - 设置Space名称和描述
   - 选择可见性（公开/私有）
   - 选择硬件配置（CPU/GPU）

4. **执行部署**
   - 实时进度监控
   - 详细部署日志
   - 错误诊断和处理

## 🔧 支持的项目类型

- 包含 `Dockerfile` 的项目
- 包含 `docker-compose.yml` 的项目
- 任何可以在Docker中运行的Web应用

## 🤝 贡献

欢迎提交Issue和Pull Request！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Radix UI](https://www.radix-ui.com/) - UI组件库
- [GitHub API](https://docs.github.com/en/rest) - GitHub集成
- [Hugging Face Hub](https://huggingface.co/docs/hub/index) - Hugging Face集成
- [Vercel](https://vercel.com/) - 部署平台

## 📞 支持

如果您遇到问题或有任何疑问，请：

1. 查看 [常见问题](docs/FAQ.md)
2. 搜索现有的 [Issues](https://github.com/nariahlamb/gh2hf-deployer/issues)
3. 创建新的 [Issue](https://github.com/nariahlamb/gh2hf-deployer/issues/new)

---

Made with ❤️ by [nariahlamb](https://github.com/nariahlamb)
