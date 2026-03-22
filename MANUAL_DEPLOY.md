# Vercel 手动部署指南

## 🎯 由于 CLI 登录限制，请使用网页方式部署

---

## 方案 A: 使用 GitHub 导入（推荐）

### 步骤 1: 将代码推送到 GitHub

```bash
cd /home/admin/openclaw/workspace/skills/network-intel/vercel-wecom-bot

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: WeCom bot for Vercel"

# 创建 GitHub 仓库（访问 https://github.com/new）
# 仓库名：wecom-news-bot
# 可见性：Private 或 Public

# 关联并推送
git remote add origin https://github.com/YOUR_USERNAME/wecom-news-bot.git
git branch -M main
git push -u origin main
```

---

### 步骤 2: 在 Vercel 导入项目

1. **访问**: https://vercel.com/new
2. **点击**: "Import Git Repository" 下的 GitHub 图标
3. **授权**: 如果提示，授权 Vercel 访问 GitHub
4. **选择**: 找到 `wecom-news-bot` 仓库
5. **点击**: "Import"

---

### 步骤 3: 配置项目

**Project Name**: `wecom-news-bot`  
**Framework Preset**: `Other`  
**Root Directory**: `./`  
**Build Command**: (留空)  
**Output Directory**: (留空)  
**Install Command**: `npm install`

---

### 步骤 4: 配置环境变量

在 Vercel 项目页面：
1. Settings → Environment Variables
2. 添加以下变量：

```
WECOM_CORP_ID=your_corp_id
WECOM_AGENT_ID=your_agent_id
WECOM_SECRET=your_secret
WECOM_TOKEN=your_token
WECOM_ENCODING_AES_KEY=your_aes_key
WECOM_CHAT_ID=your_chat_id
```

---

### 步骤 5: 部署

1. 点击 "Deploy"
2. 等待部署完成（约 1-2 分钟）
3. 获得域名：`https://wecom-news-bot.vercel.app`

**回调 URL**: `https://wecom-news-bot.vercel.app/api/wecom/callback`

---

## 方案 B: 使用 Vercel CLI（如果登录成功）

```bash
cd /home/admin/openclaw/workspace/skills/network-intel/vercel-wecom-bot

# 登录
vercel login

# 部署
vercel --prod
```

---

## 📋 企业微信配置

拿到回调 URL 后：

1. 企业微信管理后台 → 应用管理 → 机器人
2. API 模式 → 配置
3. 填写：
   - **Token**: 与 `WECOM_TOKEN` 一致
   - **EncodingAESKey**: 与 `WECOM_ENCODING_AES_KEY` 一致
   - **回调 URL**: `https://wecom-news-bot.vercel.app/api/wecom/callback`
4. 验证并保存

---

## ✅ 测试

在企业微信群中@机器人并发送"新闻"，应该收到回复。

---

**创建时间**: 2026-03-22 09:47
