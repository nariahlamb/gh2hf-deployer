# 部署指南

本文档详细说明如何将GitHub到Hugging Face Spaces部署器部署到Vercel。

## 🚀 一键部署

点击下面的按钮一键部署到Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnariahlamb%2Fgh2hf-deployer&env=GITHUB_TOKEN,HUGGINGFACE_TOKEN,HUGGINGFACE_USERNAME&envDescription=Required%20API%20tokens%20for%20GitHub%20and%20Hugging%20Face&envLink=https%3A%2F%2Fgithub.com%2Fnariahlamb%2Fgh2hf-deployer%23environment-variables)

## 📋 部署前准备

### 1. 获取GitHub Personal Access Token

1. 访问 [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token (classic)"
3. 设置Token名称，如 "GH2HF Deployer"
4. 选择过期时间（建议选择较长时间或无过期）
5. 选择以下权限：
   - ✅ `repo` - 完整的仓库访问权限
   - ✅ `read:user` - 读取用户信息
6. 点击 "Generate token"
7. **重要：立即复制生成的token，页面刷新后将无法再次查看**

### 2. 获取Hugging Face Access Token

1. 访问 [Hugging Face Settings > Access Tokens](https://huggingface.co/settings/tokens)
2. 点击 "New token"
3. 设置Token名称，如 "GH2HF Deployer"
4. 选择 "Write" 权限（需要创建和管理Spaces）
5. 点击 "Generate a token"
6. 复制生成的token

### 3. 获取Hugging Face用户名

- 您的Hugging Face用户名就是您登录时使用的用户名
- 可以在 [Hugging Face个人资料页面](https://huggingface.co/settings/profile) 查看

## 🔧 部署步骤

### 方法一：一键部署（推荐）

1. 点击上方的 "Deploy with Vercel" 按钮
2. 如果未登录Vercel，请先登录或注册
3. 确认仓库信息，点击 "Clone"
4. 在环境变量配置页面，填入以下信息：
   - `GITHUB_TOKEN`: 您的GitHub Personal Access Token
   - `HUGGINGFACE_TOKEN`: 您的Hugging Face Access Token
   - `HUGGINGFACE_USERNAME`: 您的Hugging Face用户名
5. 点击 "Deploy" 开始部署
6. 等待部署完成（通常需要2-5分钟）

### 方法二：手动部署

1. Fork或克隆本仓库到您的GitHub账户
2. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
3. 点击 "New Project"
4. 选择您的GitHub仓库
5. 配置环境变量（同上）
6. 点击 "Deploy"

## 🔍 验证部署

部署完成后，您可以通过以下步骤验证：

1. 访问Vercel提供的部署URL
2. 在首页输入一个包含Docker配置的GitHub仓库URL，例如：
   - `https://github.com/gradio-app/gradio`
   - `https://github.com/streamlit/streamlit-hello`
3. 点击 "验证仓库" 按钮
4. 如果配置正确，应该能看到仓库信息和Docker配置检测结果

## ❌ 常见问题排查

### 问题1：GitHub API访问失败

**错误信息：** "GitHub API 访问受限，请检查访问令牌"

**解决方案：**
1. 检查GITHUB_TOKEN是否正确设置
2. 确认Token权限包含 `repo` 和 `read:user`
3. 检查Token是否已过期

### 问题2：Hugging Face API访问失败

**错误信息：** "Hugging Face API访问失败"

**解决方案：**
1. 检查HUGGINGFACE_TOKEN是否正确设置
2. 确认Token权限为 "Write"
3. 检查HUGGINGFACE_USERNAME是否正确

### 问题3：环境变量未生效

**解决方案：**
1. 在Vercel Dashboard中检查环境变量设置
2. 确保环境变量名称完全匹配（区分大小写）
3. 重新部署项目以应用新的环境变量

### 问题4：构建失败

**解决方案：**
1. 检查Node.js版本是否为18+
2. 查看Vercel构建日志中的具体错误信息
3. 确认所有依赖都已正确安装

## 🔄 更新部署

当您需要更新应用时：

1. 推送代码更改到GitHub仓库
2. Vercel会自动检测更改并重新部署
3. 如果需要更新环境变量，请在Vercel Dashboard中修改

## 📊 监控和日志

- 在Vercel Dashboard中可以查看：
  - 部署历史
  - 函数日志
  - 性能指标
  - 错误报告

## 🔒 安全注意事项

1. **不要在代码中硬编码API密钥**
2. **定期轮换API Token**
3. **使用最小权限原则**
4. **监控API使用情况**

## 📞 获取帮助

如果遇到问题：

1. 查看 [GitHub Issues](https://github.com/nariahlamb/gh2hf-deployer/issues)
2. 查看Vercel部署日志
3. 检查浏览器开发者工具的控制台错误
4. 创建新的Issue报告问题
