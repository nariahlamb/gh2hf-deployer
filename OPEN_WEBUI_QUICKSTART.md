# Open WebUI 快速配置指南

## 🚨 解决404错误的关键步骤

如果您的Open WebUI部署成功但出现404错误，请按照以下步骤操作：

### 第1步：设置必需的环境变量

在您的Hugging Face Space设置中添加以下环境变量：

```env
# 🔑 核心配置 (必需)
WEBUI_SECRET_KEY=your-secret-key-here
ADMIN_USER_EMAIL=admin@example.com
ADMIN_USER_PASSWORD=your-strong-password
SPACE_ID=your-username/your-space-name

# 🌐 服务器配置
PORT=8080
HOST=0.0.0.0
ENV=prod

# 🤖 LLM配置 (至少选择一个)
OPENAI_API_KEY=sk-your-openai-api-key
# 或者
OLLAMA_BASE_URL=https://your-ollama-server.com

# 📊 性能优化
SCARF_NO_ANALYTICS=true
DO_NOT_TRACK=true
ANONYMIZED_TELEMETRY=false
```

### 第2步：生成安全密钥

**WEBUI_SECRET_KEY** 生成方法：
```bash
# 方法1: 使用OpenSSL
openssl rand -hex 32

# 方法2: 使用Python
python -c "import secrets; print(secrets.token_hex(32))"

# 方法3: 在线生成器
# 访问 https://generate-secret.vercel.app/32
```

### 第3步：设置管理员账户

```env
ADMIN_USER_EMAIL=admin@yourdomain.com
ADMIN_USER_PASSWORD=YourStrongPassword123!
```

⚠️ **重要**: 使用强密码，这将是您的管理员账户！

### 第4步：配置Space ID

```env
SPACE_ID=your-username/your-space-name
```

例如：如果您的Space URL是 `https://huggingface.co/spaces/john/my-openwebui`
那么设置：`SPACE_ID=john/my-openwebui`

### 第5步：重启Space

1. 在Hugging Face Space页面点击 "Settings"
2. 滚动到底部点击 "Restart this Space"
3. 等待重新构建完成（可能需要5-10分钟）

## 🔍 验证部署

### 检查启动日志
在Space的 "Logs" 标签中查看：
- ✅ 应该看到 "Application startup complete"
- ✅ 应该看到 "Uvicorn running on http://0.0.0.0:8080"
- ❌ 如果看到错误，检查环境变量配置

### 访问应用
1. 等待Space状态变为 "Running"
2. 点击Space页面顶部的 "App" 按钮
3. 应该看到Open WebUI登录界面
4. 使用设置的管理员邮箱和密码登录

## 🤖 配置LLM服务

### 选项1：使用OpenAI API
```env
OPENAI_API_KEY=sk-your-api-key
OPENAI_API_BASE_URL=https://api.openai.com/v1
```

### 选项2：使用其他兼容API
```env
OPENAI_API_KEY=your-api-key
OPENAI_API_BASE_URL=https://api.groq.com/openai/v1
```

支持的服务：
- OpenAI
- Groq
- Mistral AI
- OpenRouter
- LMStudio
- 任何OpenAI兼容的API

### 选项3：使用外部Ollama
```env
OLLAMA_BASE_URL=https://your-ollama-server.com
```

## 🚨 常见错误解决

### 错误1：404 Not Found
**原因**: 缺少必需的环境变量
**解决**: 确保设置了所有必需的环境变量，特别是 `SPACE_ID`

### 错误2：500 Internal Server Error
**原因**: `WEBUI_SECRET_KEY` 未设置或格式错误
**解决**: 生成并设置32字符的十六进制密钥

### 错误3：无法登录
**原因**: 管理员账户未正确创建
**解决**: 检查 `ADMIN_USER_EMAIL` 和 `ADMIN_USER_PASSWORD` 设置

### 错误4：无法与AI对话
**原因**: 没有配置LLM服务
**解决**: 设置 `OPENAI_API_KEY` 或 `OLLAMA_BASE_URL`

## 📋 完整配置检查清单

- [ ] ✅ 设置 `WEBUI_SECRET_KEY`（32字符十六进制）
- [ ] ✅ 设置 `ADMIN_USER_EMAIL`
- [ ] ✅ 设置 `ADMIN_USER_PASSWORD`（强密码）
- [ ] ✅ 设置 `SPACE_ID`（格式：username/space-name）
- [ ] ✅ 设置 `PORT=8080` 和 `HOST=0.0.0.0`
- [ ] ✅ 配置LLM服务（OpenAI API或Ollama）
- [ ] ✅ 重启Space
- [ ] ✅ 等待构建完成
- [ ] ✅ 测试登录和AI对话

## 🔧 高级配置

### 自定义模型
```env
# Whisper语音识别
WHISPER_MODEL=base

# RAG嵌入模型
RAG_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# 缓存配置
HF_HOME=/app/backend/data/cache/embedding/models
```

### 性能优化
```env
# 禁用遥测
SCARF_NO_ANALYTICS=true
DO_NOT_TRACK=true
ANONYMIZED_TELEMETRY=false

# 离线模式（如果不需要下载新模型）
HF_HUB_OFFLINE=1
```

## 📞 获取帮助

如果仍然遇到问题：

1. **检查Space日志**: 在Logs标签查看详细错误信息
2. **验证环境变量**: 确保所有必需变量都已设置
3. **重启Space**: 修改环境变量后务必重启
4. **查看文档**: https://docs.openwebui.com/
5. **社区支持**: https://discord.gg/5rJgQTnV4s

---

**🎯 关键提醒**: Open WebUI在Hugging Face Spaces上需要特殊配置。最重要的是设置 `SPACE_ID`、管理员账户和LLM服务配置！
