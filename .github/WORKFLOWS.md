# GitHub Actions 工作流说明

本项目包含多个GitHub Actions工作流，用于自动化构建、测试和部署。

## 🔄 工作流概览

### 1. Build Check (`build-check.yml`)
**触发条件：** 推送到main分支或创建Pull Request

**功能：**
- ✅ 安装依赖
- ✅ TypeScript类型检查
- ✅ ESLint代码检查
- ✅ Next.js构建验证
- ✅ 构建产物验证

**状态徽章：** ![Build Check](https://github.com/nariahlamb/gh2hf-deployer/actions/workflows/build-check.yml/badge.svg)

### 2. CI/CD Pipeline (`ci.yml`)
**触发条件：** 推送到main/develop分支或Pull Request

**功能：**
- 🧪 多Node.js版本测试 (18.x, 20.x)
- 🔍 完整的代码质量检查
- 📦 构建产物上传
- 🚀 自动部署到Vercel (需要配置secrets)

### 3. Deploy to Vercel (`deploy.yml`)
**触发条件：** 推送到main分支或手动触发

**功能：**
- 🏗️ 生产环境构建
- 🚀 自动部署到Vercel
- 📊 部署状态报告

**状态徽章：** ![Deploy to Vercel](https://github.com/nariahlamb/gh2hf-deployer/actions/workflows/deploy.yml/badge.svg)

## ⚙️ 配置要求

### 必需的Repository Secrets

如果要启用自动部署到Vercel，需要在GitHub仓库设置中添加以下secrets：

1. **VERCEL_TOKEN**
   - 获取方式：Vercel Dashboard → Settings → Tokens
   - 权限：Full Access

2. **VERCEL_ORG_ID**
   - 获取方式：Vercel项目设置 → General → Project ID下方
   - 或运行：`vercel link` 后查看 `.vercel/project.json`

3. **VERCEL_PROJECT_ID**
   - 获取方式：同上
   - 或在Vercel Dashboard项目设置中查看

4. **GITHUB_TOKEN** (自动提供)
   - GitHub自动提供，无需手动设置

5. **HUGGINGFACE_TOKEN** (可选)
   - 用于构建时的环境变量
   - 如不设置，构建时使用dummy值

6. **HUGGINGFACE_USERNAME** (可选)
   - 用于构建时的环境变量
   - 如不设置，构建时使用dummy值

### 设置Secrets步骤

1. 访问GitHub仓库页面
2. 点击 "Settings" 标签
3. 在左侧菜单选择 "Secrets and variables" → "Actions"
4. 点击 "New repository secret"
5. 添加上述secrets

## 🚀 工作流使用

### 自动触发
- **推送代码到main分支** → 触发构建检查和部署
- **创建Pull Request** → 触发构建检查和预览部署
- **推送到develop分支** → 触发完整CI/CD流程

### 手动触发
1. 访问GitHub仓库的 "Actions" 标签
2. 选择 "Deploy to Vercel" 工作流
3. 点击 "Run workflow"
4. 选择部署环境（production/preview）
5. 点击 "Run workflow"

## 📊 监控和调试

### 查看工作流状态
- 在仓库主页查看状态徽章
- 访问 "Actions" 标签查看详细日志
- 每个工作流都有详细的步骤输出

### 常见问题排查

#### 构建失败
1. 检查代码语法错误
2. 确认依赖版本兼容性
3. 查看构建日志中的具体错误

#### 部署失败
1. 检查Vercel secrets配置
2. 确认环境变量设置正确
3. 查看Vercel Dashboard中的部署日志

#### 类型检查失败
1. 运行 `npm run type-check` 本地检查
2. 修复TypeScript类型错误
3. 确认所有导入路径正确

## 🔧 本地开发

### 模拟CI环境
```bash
# 安装依赖
npm ci

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 构建应用
npm run build
```

### 环境变量设置
创建 `.env.local` 文件：
```env
GITHUB_TOKEN=your_github_token
HUGGINGFACE_TOKEN=your_hf_token
HUGGINGFACE_USERNAME=your_hf_username
```

## 📈 工作流优化

### 缓存策略
- Node.js依赖缓存：加速安装过程
- 构建缓存：减少重复构建时间

### 并行执行
- 多Node.js版本并行测试
- 独立的构建和部署任务

### 条件执行
- 仅在main分支部署生产环境
- Pull Request触发预览部署

## 🔄 更新工作流

修改工作流文件后：
1. 提交更改到仓库
2. 工作流自动更新
3. 下次触发时使用新配置

## 📞 获取帮助

如果工作流出现问题：
1. 查看Actions标签中的详细日志
2. 检查secrets配置
3. 参考GitHub Actions文档
4. 创建Issue报告问题
