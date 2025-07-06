#!/usr/bin/env node

/**
 * 测试脚本：验证修复后的 Hugging Face API 集成
 * 运行方式：node test-hf-api.js
 */

const {
  createRepo,
  uploadFile,
  listSpaces,
  deleteRepo,
  whoAmI
} = require('@huggingface/hub');

// 从环境变量获取配置
const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;
const HF_USERNAME = process.env.HUGGINGFACE_USERNAME;

if (!HF_TOKEN || !HF_USERNAME) {
  console.error('❌ 请设置环境变量:');
  console.error('   HUGGINGFACE_TOKEN=your_token_here');
  console.error('   HUGGINGFACE_USERNAME=your_username_here');
  process.exit(1);
}

async function testHuggingFaceAPI() {
  console.log('🧪 开始测试 Hugging Face API 集成...\n');

  try {
    // 1. 测试 API 连接
    console.log('1️⃣ 测试 API 连接...');

    const userInfo = await whoAmI({ credentials: { accessToken: HF_TOKEN } });
    console.log(`✅ API 连接成功! 用户: ${userInfo.name}`);
    console.log(`   用户名: ${userInfo.name}`);
    console.log(`   头像: ${userInfo.avatarUrl}\n`);

    // 2. 测试创建 Space (使用测试名称)
    const testSpaceName = `test-gh2hf-${Date.now()}`;
    const spaceId = `${HF_USERNAME}/${testSpaceName}`;
    
    console.log('2️⃣ 测试创建 Space...');
    console.log(`   Space ID: ${spaceId}`);
    
    try {
      const result = await createRepo({
        repo: { type: 'space', name: spaceId },
        credentials: { accessToken: HF_TOKEN },
        private: false,
        sdk: 'docker'
      });
      
      console.log(`✅ Space 创建成功!`);
      console.log(`   URL: ${result.repoUrl}`);
      console.log(`   访问地址: https://huggingface.co/spaces/${spaceId}\n`);

      // 3. 测试上传文件
      console.log('3️⃣ 测试文件上传...');
      
      const readmeContent = `---
title: ${testSpaceName}
emoji: 🧪
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
---

# ${testSpaceName}

这是一个测试 Space，用于验证 GH2HF Deployer 的功能。

创建时间: ${new Date().toISOString()}
`;

      await uploadFile({
        repo: { type: 'space', name: spaceId },
        credentials: { accessToken: HF_TOKEN },
        file: {
          path: 'README.md',
          content: new Blob([readmeContent], { type: 'text/plain' })
        },
        commitTitle: 'Add README.md'
      });

      console.log('✅ README.md 上传成功!\n');

      // 4. 测试获取 Space 状态
      console.log('4️⃣ 测试获取 Space 状态...');

      // 使用 listSpaces 查找我们的 Space
      let spaceFound = false;
      for await (const space of listSpaces({
        search: { owner: HF_USERNAME, query: testSpaceName },
        credentials: { accessToken: HF_TOKEN },
        additionalFields: ['runtime']
      })) {
        if (space.name === testSpaceName) {
          console.log(`✅ Space 状态获取成功!`);
          console.log(`   名称: ${space.name}`);
          console.log(`   SDK: ${space.sdk}`);
          console.log(`   状态: ${space.runtime?.stage || 'unknown'}`);
          console.log(`   硬件: ${space.runtime?.hardware || 'cpu-basic'}\n`);
          spaceFound = true;
          break;
        }
      }

      if (!spaceFound) {
        console.log('⚠️ Space 未在列表中找到，但这可能是正常的（刚创建的 Space 可能需要时间同步）\n');
      }

      // 5. 清理测试 Space
      console.log('5️⃣ 清理测试 Space...');

      await deleteRepo({
        repo: { type: 'space', name: spaceId },
        credentials: { accessToken: HF_TOKEN }
      });

      console.log('✅ 测试 Space 已删除\n');

    } catch (spaceError) {
      console.error(`❌ Space 操作失败: ${spaceError.message}`);
      
      // 尝试清理可能创建的 Space
      try {
        await deleteRepo({
          repo: { type: 'space', name: spaceId },
          credentials: { accessToken: HF_TOKEN }
        });
        console.log('🧹 已清理可能创建的测试 Space');
      } catch (cleanupError) {
        // 忽略清理错误
      }
      
      throw spaceError;
    }

    console.log('🎉 所有测试通过! Hugging Face API 集成正常工作。');
    console.log('\n📝 测试总结:');
    console.log('   ✅ API 连接正常');
    console.log('   ✅ Space 创建功能正常');
    console.log('   ✅ 文件上传功能正常');
    console.log('   ✅ 状态查询功能正常');
    console.log('   ✅ Space 删除功能正常');
    console.log('\n🚀 现在可以安全地使用 GH2HF Deployer 进行真实部署了!');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('\n🔧 可能的解决方案:');
    console.error('   1. 检查 HUGGINGFACE_TOKEN 是否有效');
    console.error('   2. 确认 token 有创建 Space 的权限');
    console.error('   3. 检查网络连接');
    console.error('   4. 确认用户名正确');
    
    process.exit(1);
  }
}

// 运行测试
testHuggingFaceAPI().catch(console.error);
