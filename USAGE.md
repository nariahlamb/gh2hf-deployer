# 使用指南

本文档详细说明如何使用GitHub到Hugging Face Spaces部署器。

## 🎯 功能概述

这个Web应用程序可以帮助您：

1. **自动检测** GitHub仓库中的Docker配置
2. **一键部署** Docker项目到Hugging Face Spaces
3. **实时监控** 部署进度和状态
4. **管理配置** Space的可见性、硬件等设置

## 📋 使用前准备

### 支持的项目类型

✅ **支持的项目：**
- 包含 `Dockerfile` 的项目
- 包含 `docker-compose.yml` 的项目
- 任何可以在Docker中运行的Web应用

❌ **不支持的项目：**
- 没有Docker配置的项目
- 需要特殊硬件支持的项目（除非选择GPU硬件）
- 包含敏感信息的私有项目（除非设置为私有Space）

### 示例项目

以下是一些可以用来测试的公开项目：

1. **Gradio应用：** `https://github.com/gradio-app/gradio`
2. **Streamlit应用：** `https://github.com/streamlit/streamlit-hello`
3. **FastAPI应用：** `https://github.com/tiangolo/fastapi`

## 🚀 使用步骤

### 第1步：输入GitHub仓库

1. 在首页的输入框中输入GitHub仓库URL
2. 支持的URL格式：
   - `https://github.com/username/repository`
   - `git@github.com:username/repository.git`
   - `username/repository`（简写格式）
3. 点击 "验证仓库" 按钮

**注意事项：**
- 确保仓库是公开的，或者您有访问权限
- 仓库必须包含Docker配置文件

### 第2步：验证配置

系统会自动：
- 获取仓库基本信息（名称、描述、语言等）
- 检测Docker配置文件（Dockerfile、docker-compose.yml）
- 分析Docker配置（端口、环境变量等）

**检查结果：**
- ✅ 绿色勾号：检测成功，可以继续部署
- ❌ 红色叉号：检测失败，无法部署

### 第3步：配置部署

配置您的Hugging Face Space参数：

#### Space名称
- 只能包含小写字母、数字和连字符
- 长度：2-96个字符
- 将成为您Space URL的一部分：`https://huggingface.co/spaces/您的用户名/space名称`

#### 可见性
- **公开：** 任何人都可以查看和使用您的Space
- **私有：** 只有您可以访问（需要Hugging Face Pro订阅）

#### 硬件配置
- **CPU Basic（免费）：** 2 vCPU, 16GB RAM
- **CPU Upgrade：** 8 vCPU, 32GB RAM（$0.05/小时）
- **GPU T4：** 4 vCPU, 15GB RAM, 1x T4 GPU（$0.60/小时）

#### 可选配置
- **描述：** 简要说明您的应用功能
- **标签：** 帮助其他用户发现您的Space

### 第4步：执行部署

点击 "开始部署" 后，系统会：

1. **验证配置**（10%）- 检查所有参数
2. **创建Space**（25%）- 在Hugging Face上创建新Space
3. **上传代码**（50%）- 从GitHub获取代码并上传
4. **构建镜像**（75%）- 构建Docker镜像
5. **部署应用**（90%）- 启动应用服务
6. **完成部署**（100%）- 提供访问链接

**部署时间：** 通常需要3-10分钟，取决于项目大小和复杂度

### 第5步：访问应用

部署完成后：
- 获得Hugging Face Space的访问链接
- 可以分享给其他用户使用
- 在Hugging Face上管理您的Space

## 🔧 高级功能

### 健康检查

访问 `/health` 页面可以：
- 检查API配置是否正确
- 验证环境变量设置
- 诊断连接问题

### 错误处理

如果遇到错误：
1. 查看错误信息和建议解决方案
2. 检查GitHub仓库是否可访问
3. 确认Docker配置是否正确
4. 验证API密钥是否有效

### 重新部署

如果需要更新应用：
1. 在GitHub上更新代码
2. 重新运行部署流程
3. 系统会更新现有的Space

## 📊 监控和管理

### 部署日志

在部署过程中可以查看：
- 实时构建日志
- 错误信息和警告
- 部署进度详情

### Hugging Face管理

部署完成后，您可以在Hugging Face上：
- 查看Space状态和指标
- 管理访问权限
- 更新配置和设置
- 查看使用统计

## ❓ 常见问题

### Q: 为什么我的仓库检测失败？
A: 请确保：
- 仓库是公开的或您有访问权限
- 包含有效的Dockerfile或docker-compose.yml
- GitHub Token有正确的权限

### Q: 部署失败怎么办？
A: 检查：
- Docker配置是否正确
- 是否有语法错误
- 依赖是否可以正常安装
- 端口配置是否正确

### Q: 如何更新已部署的应用？
A: 重新运行部署流程，系统会自动更新现有的Space

### Q: 可以部署私有仓库吗？
A: 可以，但需要确保GitHub Token有访问私有仓库的权限

### Q: 部署费用如何计算？
A: 
- CPU Basic是免费的
- 其他硬件配置按小时计费
- 详细费用请查看Hugging Face定价页面

## 🔒 安全建议

1. **保护API密钥**
   - 不要在代码中硬编码密钥
   - 定期轮换访问令牌
   - 使用最小权限原则

2. **仓库安全**
   - 不要在公开仓库中包含敏感信息
   - 使用环境变量管理配置
   - 定期审查代码和依赖

3. **Space管理**
   - 合理设置可见性
   - 监控使用情况
   - 及时更新和维护

## 📞 获取帮助

如果需要帮助：

1. **查看文档**
   - [部署指南](DEPLOYMENT.md)
   - [GitHub Issues](https://github.com/nariahlamb/gh2hf-deployer/issues)

2. **检查配置**
   - 使用健康检查页面
   - 查看浏览器控制台
   - 检查Vercel部署日志

3. **联系支持**
   - 创建GitHub Issue
   - 提供详细的错误信息
   - 包含复现步骤
