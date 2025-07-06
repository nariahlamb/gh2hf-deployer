# 部署测试指导

本文档提供完整的部署测试流程，确保应用程序正常工作。

## 🚀 部署测试流程

### 第1步：部署到Vercel

1. **点击一键部署按钮**
   ```
   https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnariahlamb%2Fgh2hf-deployer&env=GITHUB_TOKEN,HUGGINGFACE_TOKEN,HUGGINGFACE_USERNAME&envDescription=Required%20API%20tokens%20for%20GitHub%20and%20Hugging%20Face&envLink=https%3A%2F%2Fgithub.com%2Fnariahlamb%2Fgh2hf-deployer%23environment-variables
   ```

2. **配置环境变量**
   - `GITHUB_TOKEN`: 您的GitHub Personal Access Token
   - `HUGGINGFACE_TOKEN`: 您的Hugging Face Access Token
   - `HUGGINGFACE_USERNAME`: 您的Hugging Face用户名

3. **等待部署完成**
   - 通常需要2-5分钟
   - 查看构建日志确认无错误

### 第2步：验证基础功能

1. **访问应用首页**
   - 确认页面正常加载
   - 检查UI组件显示正常
   - 验证步骤指示器工作

2. **测试健康检查**
   - 访问 `/health` 页面
   - 确认所有检查项都显示绿色✅
   - 如有红色❌，按照提示修复

### 第3步：测试核心功能

#### 测试1：GitHub仓库验证

**使用示例仓库：** `https://github.com/gradio-app/gradio`

1. 在首页输入仓库URL
2. 点击"验证仓库"
3. **预期结果：**
   - 显示仓库信息（名称、描述、统计）
   - 检测到Docker配置
   - 显示"继续配置部署"按钮

#### 测试2：Docker配置检测

**使用示例仓库：** `https://github.com/streamlit/streamlit-hello`

1. 输入仓库URL并验证
2. 查看Docker配置检测结果
3. **预期结果：**
   - 显示Dockerfile检测状态
   - 显示暴露端口信息
   - 显示基础镜像信息

#### 测试3：部署配置

1. 在验证页面点击"继续配置部署"
2. 填写部署配置：
   - Space名称：`test-deployment-123`
   - 可见性：公开
   - 硬件：CPU Basic
   - 描述：测试部署
3. 点击"开始部署"

#### 测试4：部署流程（模拟）

**注意：** 这是模拟部署，不会实际创建Hugging Face Space

1. 观察部署进度条
2. 查看实时日志输出
3. **预期结果：**
   - 进度从10%到100%
   - 显示各个阶段的状态
   - 最终显示"部署完成"

### 第4步：错误处理测试

#### 测试1：无效仓库URL

1. 输入无效URL：`https://github.com/nonexistent/repo`
2. **预期结果：** 显示错误信息

#### 测试2：无Docker配置的仓库

1. 输入没有Docker配置的仓库
2. **预期结果：** 显示"无法部署"警告

#### 测试3：网络错误处理

1. 在开发者工具中模拟网络错误
2. **预期结果：** 显示友好的错误信息

## 🔍 详细验证清单

### ✅ 基础功能
- [ ] 首页正常加载
- [ ] 步骤指示器显示正确
- [ ] 响应式设计在移动端正常
- [ ] 导航链接工作正常

### ✅ GitHub集成
- [ ] 仓库URL验证正常
- [ ] 仓库信息获取正确
- [ ] Docker配置检测准确
- [ ] 错误处理友好

### ✅ 用户界面
- [ ] 表单验证工作正常
- [ ] 按钮状态正确切换
- [ ] 加载状态显示清晰
- [ ] 错误信息显示明确

### ✅ 部署流程
- [ ] 配置页面功能完整
- [ ] 进度监控实时更新
- [ ] 日志显示详细信息
- [ ] 完成状态正确显示

### ✅ 健康检查
- [ ] 环境变量检查正确
- [ ] GitHub API连接正常
- [ ] Hugging Face配置验证
- [ ] 错误诊断准确

## 🐛 常见问题排查

### 问题1：健康检查失败

**症状：** `/health` 页面显示红色错误

**排查步骤：**
1. 检查Vercel环境变量设置
2. 验证API Token格式和权限
3. 查看Vercel函数日志

**解决方案：**
- 重新生成API Token
- 确认环境变量名称正确
- 重新部署应用

### 问题2：仓库验证失败

**症状：** 输入仓库URL后显示错误

**排查步骤：**
1. 确认仓库URL格式正确
2. 检查仓库是否公开可访问
3. 验证GitHub Token权限

**解决方案：**
- 使用正确的URL格式
- 确保Token有repo权限
- 尝试其他公开仓库

### 问题3：页面加载错误

**症状：** 页面显示错误边界

**排查步骤：**
1. 查看浏览器控制台错误
2. 检查网络请求状态
3. 查看Vercel部署日志

**解决方案：**
- 刷新页面重试
- 检查网络连接
- 联系技术支持

## 📊 性能测试

### 加载性能
- 首页加载时间 < 2秒
- API响应时间 < 5秒
- 图片和资源优化

### 用户体验
- 交互响应及时
- 状态反馈清晰
- 错误处理友好

### 兼容性
- 现代浏览器支持
- 移动端适配良好
- 不同屏幕尺寸适应

## 🔄 持续测试

### 自动化测试
建议设置：
- GitHub Actions CI/CD
- 端到端测试
- API集成测试

### 监控指标
关注：
- 部署成功率
- 用户错误率
- 性能指标
- API使用量

## 📞 报告问题

如果测试中发现问题：

1. **收集信息**
   - 错误截图
   - 浏览器控制台日志
   - 复现步骤

2. **创建Issue**
   - 访问 [GitHub Issues](https://github.com/nariahlamb/gh2hf-deployer/issues)
   - 使用问题模板
   - 提供详细信息

3. **临时解决方案**
   - 刷新页面重试
   - 清除浏览器缓存
   - 使用不同浏览器测试
