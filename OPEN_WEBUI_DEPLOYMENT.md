# Open WebUI 部署配置指南

基于对 [open-webui/open-webui](https://github.com/open-webui/open-webui) 项目的分析，以下是部署到Hugging Face Spaces时需要配置的环境变量和要求。

## 🚀 项目概述

**Open WebUI** 是一个功能丰富的自托管AI平台，支持多种LLM运行器（如Ollama和OpenAI兼容API），具有内置的RAG推理引擎。

## 📋 必需的环境变量

### 🔑 核心配置

#### 1. **WEBUI_SECRET_KEY** (强烈推荐)
```env
WEBUI_SECRET_KEY=your-secret-key-here
```
- **用途**: 用于会话加密和安全认证
- **要求**: 建议使用强随机字符串
- **生成方式**: `openssl rand -hex 32`

#### 2. **OLLAMA_BASE_URL** (如果使用Ollama)
```env
OLLAMA_BASE_URL=http://your-ollama-server:11434
```
- **默认值**: `/ollama` (容器内部)
- **用途**: 连接到Ollama服务器
- **注意**: 在Hugging Face Spaces中可能需要外部Ollama服务

#### 3. **OPENAI_API_KEY** (如果使用OpenAI API)
```env
OPENAI_API_KEY=sk-your-openai-api-key
```
- **用途**: 连接OpenAI或兼容的API服务
- **支持**: OpenAI, LMStudio, GroqCloud, Mistral, OpenRouter等

### 🎛️ 可选配置变量

#### API配置
```env
# OpenAI API基础URL (用于兼容服务)
OPENAI_API_BASE_URL=https://api.openai.com/v1

# 禁用遥测
SCARF_NO_ANALYTICS=true
DO_NOT_TRACK=true
ANONYMIZED_TELEMETRY=false
```

#### 模型配置
```env
# Whisper语音识别模型
WHISPER_MODEL=base
WHISPER_MODEL_DIR=/app/backend/data/cache/whisper/models

# RAG嵌入模型
RAG_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
RAG_RERANKING_MODEL=""

# Tiktoken编码
TIKTOKEN_ENCODING_NAME=cl100k_base
TIKTOKEN_CACHE_DIR=/app/backend/data/cache/tiktoken

# Hugging Face缓存
HF_HOME=/app/backend/data/cache/embedding/models
HF_HUB_OFFLINE=0
```

#### 高级配置
```env
# 端口配置
PORT=8080

# 环境模式
ENV=prod

# 用户权限 (非root用户)
UID=1000
GID=1000
```

## 🔧 Hugging Face Spaces特殊配置

### 推荐的Space配置

#### 硬件要求
- **最低**: CPU Basic (2 vCPU, 16GB RAM) - 免费
- **推荐**: CPU Upgrade (8 vCPU, 32GB RAM) - $0.05/小时
- **AI模型**: GPU T4 (4 vCPU, 15GB RAM, 1x T4) - $0.60/小时

#### Space设置
```yaml
# README.md front matter
---
title: Open WebUI
emoji: 🤖
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
app_port: 8080
---
```

### 环境变量优先级配置

#### 基础配置 (必需)
```env
WEBUI_SECRET_KEY=your-generated-secret-key
PORT=8080
ENV=prod
```

#### 如果使用外部Ollama
```env
OLLAMA_BASE_URL=https://your-ollama-server.com
```

#### 如果使用OpenAI API
```env
OPENAI_API_KEY=sk-your-api-key
OPENAI_API_BASE_URL=https://api.openai.com/v1
```

#### 性能优化
```env
# 禁用遥测以提高性能
SCARF_NO_ANALYTICS=true
DO_NOT_TRACK=true
ANONYMIZED_TELEMETRY=false

# 离线模式 (如果不需要下载模型)
HF_HUB_OFFLINE=1
```

## 🚨 重要注意事项

### 1. **Ollama集成限制**
- Hugging Face Spaces不支持运行Ollama服务器
- 需要外部Ollama服务器或使用OpenAI兼容API
- 建议使用云端Ollama服务或其他LLM API

### 2. **存储限制**
- Hugging Face Spaces有存储限制
- 大型模型缓存可能导致空间不足
- 建议使用轻量级嵌入模型

### 3. **网络访问**
- 确保外部API服务可访问
- 配置正确的CORS设置

### 4. **安全考虑**
- 始终设置强密码的`WEBUI_SECRET_KEY`
- 不要在公开仓库中暴露API密钥
- 考虑设置为私有Space以保护敏感配置

## 🔍 部署验证

### 健康检查
Open WebUI提供健康检查端点：
```
GET /health
```

### 功能测试
1. **基础功能**: 访问Web界面
2. **API连接**: 测试配置的LLM服务
3. **文件上传**: 测试RAG文档功能
4. **语音功能**: 测试Whisper集成

## 📊 性能优化建议

### 1. **模型选择**
```env
# 轻量级嵌入模型 (推荐用于Spaces)
RAG_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# 基础Whisper模型
WHISPER_MODEL=base
```

### 2. **缓存配置**
```env
# 优化缓存路径
SENTENCE_TRANSFORMERS_HOME=/app/backend/data/cache/embedding/models
HF_HOME=/app/backend/data/cache/embedding/models
```

### 3. **资源限制**
- 监控内存使用情况
- 定期清理缓存文件
- 使用适当的硬件配置

## 🐛 常见问题解决

### 1. **连接问题**
- 检查`OLLAMA_BASE_URL`或`OPENAI_API_BASE_URL`
- 验证API密钥有效性
- 确认网络连接

### 2. **模型加载失败**
- 检查`HF_HUB_OFFLINE`设置
- 验证模型名称正确性
- 确认存储空间充足

### 3. **权限错误**
- 检查文件权限设置
- 验证`UID`和`GID`配置

## 📞 技术支持

如果遇到部署问题：
1. 查看Open WebUI官方文档: https://docs.openwebui.com/
2. 检查GitHub Issues: https://github.com/open-webui/open-webui/issues
3. 加入Discord社区: https://discord.gg/5rJgQTnV4s

---

**🎯 总结**: Open WebUI是一个功能强大的AI平台，但在Hugging Face Spaces上部署需要仔细配置环境变量，特别是API连接和安全设置。建议使用外部LLM服务以获得最佳性能。
