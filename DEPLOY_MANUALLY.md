# 手动部署到 Vercel 指南

## 🎯 由于网络限制，请手动完成以下步骤

---

## 步骤 1: 在 GitHub 创建仓库

1. **访问**: https://github.com/new
2. **Repository name**: `wecom-news-bot`
3. **Description**: `企业微信新闻推送机器人 - Vercel 版本`
4. **Public** 或 **Private**: 任选
5. **不要** 勾选 "Add a README file"
6. 点击 **Create repository**

---

## 步骤 2: 推送代码到 GitHub

```bash
cd /home/admin/openclaw/workspace/skills/network-intel/vercel-wecom-bot

# 设置远程仓库（替换 YOUR_USERNAME 为您的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/wecom-news-bot.git

# 推送
git push -u origin main
```

---

## 步骤 3: 在 Vercel 导入项目

1. **访问**: https://vercel.com/new
2. **点击**: "Import Git Repository" 下的 **GitHub** 按钮
3. **授权**: 如果提示，授权 Vercel 访问 GitHub
4. **选择**: 找到 `wecom-news-bot` 仓库
5. **点击**: "Import"

---

## 步骤 4: 配置项目

**保持默认设置**:
- **Framework Preset**: `Other`
- **Root Directory**: `./`
- **Build Command**: (留空)
- **Output Directory**: (留空)
- **Install Command**: `npm install`

点击 **Deploy**

---

## 步骤 5: 配置环境变量

部署完成后：

1. 进入项目页面
2. 点击 **Settings** → **Environment Variables**
3. 添加以下 6 个变量：

```
WECOM_CORP_ID=您的企业微信 CorpID
WECOM_AGENT_ID=您的应用 AgentId
WECOM_SECRET=您的应用 Secret
WECOM_TOKEN=您自定义的 Token
WECOM_ENCODING_AES_KEY=您的 EncodingAESKey
WECOM_CHAT_ID=推送的目标群聊 ID
```

4. 点击 **Save**

---

## 步骤 6: 重新部署

添加环境变量后需要重新部署：

1. 点击 **Deployments** 标签
2. 点击最新的部署右侧的 **⋮**
3. 选择 **Redeploy**
4. 点击 **Redeploy** 确认

---

## 步骤 7: 获取回调 URL

部署成功后，您会看到：

```
https://wecom-news-bot-xxxx.vercel.app
```

**回调 URL 为**: `https://wecom-news-bot-xxxx.vercel.app/api/wecom/callback`

---

## 步骤 8: 配置企业微信

1. 企业微信管理后台 → 应用管理 → 机器人
2. API 模式 → 配置
3. 填写：
   - **Token**: 与 `WECOM_TOKEN` 一致
   - **EncodingAESKey**: 与 `WECOM_ENCODING_AES_KEY` 一致
   - **回调 URL**: `https://wecom-news-bot-xxxx.vercel.app/api/wecom/callback`
4. 点击 **验证并保存**

---

## ✅ 测试

在企业微信群中@机器人并发送"新闻"，应该收到回复。

---

## 📋 检查清单

- [ ] GitHub 仓库已创建
- [ ] 代码已推送
- [ ] Vercel 项目已导入
- [ ] 环境变量已配置
- [ ] 重新部署完成
- [ ] 回调 URL 已复制到企业微信
- [ ] 企业微信验证成功
- [ ] 测试消息发送成功

---

**创建时间**: 2026-03-22 10:15
