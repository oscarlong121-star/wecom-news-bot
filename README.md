# 企业微信回调服务 - Vercel 部署指南

## 📋 部署步骤

### 步骤 1: 安装 Node.js 和 npm

```bash
# macOS
brew install node

# 或访问 https://nodejs.org 下载安装包
```

### 步骤 2: 安装 Vercel CLI

```bash
npm install -g vercel
```

### 步骤 3: 登录 Vercel

```bash
cd /home/admin/openclaw/workspace/skills/network-intel/vercel-wecom-bot
vercel login
```

按提示选择登录方式（GitHub/GitLab/Bitbucket/Email）

### 步骤 4: 安装依赖

```bash
npm install
```

### 步骤 5: 配置环境变量

**方式 A: 使用 Vercel Dashboard（推荐）**

1. 访问 https://vercel.com/dashboard
2. 创建项目或选择已部署的项目
3. Settings → Environment Variables
4. 添加以下变量：
   - `WECOM_CORP_ID`: 企业微信 CorpID
   - `WECOM_AGENT_ID`: 应用 AgentId
   - `WECOM_SECRET`: 应用 Secret
   - `WECOM_TOKEN`: 机器人 Token
   - `WECOM_ENCODING_AES_KEY`: 机器人 EncodingAESKey
   - `WECOM_CHAT_ID`: 推送的目标群聊 ID

**方式 B: 使用 .env 文件（本地测试）**

```bash
cp .env.example .env.local
# 编辑 .env.local 填入配置
```

### 步骤 6: 部署到 Vercel

```bash
# 首次部署
vercel

# 按提示操作:
# - Set up and deploy? Y
# - Which scope? (选择你的账号)
# - Link to existing project? N
# - What's your project's name? wecom-news-bot
# - In which directory is your code located? ./
# - Want to override the settings? N

# 生产环境部署
vercel --prod
```

### 步骤 7: 获取回调 URL

部署成功后，Vercel 会显示：

```
🔗  https://wecom-news-bot-xxx.vercel.app
```

**回调 URL 为**: `https://wecom-news-bot-xxx.vercel.app/api/wecom/callback`

---

## 🔧 企业微信配置

### 1. 配置回调 URL

1. 登录企业微信管理后台
2. 应用管理 → 自建应用 → 选择你的应用
3. 机器人 → API 模式
4. 填写：
   - **Token**: 与 `.env` 中的 `WECOM_TOKEN` 一致
   - **EncodingAESKey**: 与 `.env` 中的 `WECOM_ENCODING_AES_KEY` 一致
   - **回调 URL**: `https://wecom-news-bot-xxx.vercel.app/api/wecom/callback`
5. 点击"验证并保存"

### 2. 验证成功

如果配置正确，企业微信会显示"验证成功"

---

## 🧪 测试

### 测试 1: URL 验证

企业微信会自动验证回调 URL，成功则保存配置

### 测试 2: 发送消息

1. 在企业微信群中@机器人
2. 发送"新闻"
3. 机器人应回复新闻内容

### 测试 3: 查看日志

```bash
# 查看部署日志
vercel logs

# 实时日志
vercel logs --follow
```

---

## 🔄 更新代码

```bash
# 修改代码后
git add .
git commit -m "更新回调逻辑"
git push

# 或直接重新部署
vercel --prod
```

Vercel 会自动重新部署（如果连接了 Git）

---

## ⚠️ 注意事项

### 1. 读取新闻存档

Vercel Serverless 无法读取本地文件，需要：

**方案 A: 使用外部存储**
- Vercel KV (Redis)
- Vercel Blob (对象存储)
- 第三方数据库（MongoDB/MySQL）

**方案 B: 定时推送**
- 使用 Cron 定时触发 API
- 主动推送新闻到群聊

### 2. 冷启动

首次调用可能有 1-3 秒延迟，属正常现象

### 3. 超时限制

Vercel Serverless 超时限制：
- Hobby: 10 秒
- Pro: 60 秒

新闻推送通常在 5 秒内完成

---

## 📊 成本估算

**Hobby (免费)**:
- 带宽：100GB/月
- Serverless: 100GB-小时/月
- 新闻推送：每天 12 次 × 30 天 × 10KB ≈ 3.6MB/月
- **完全免费**

---

## 📞 故障排除

### 问题 1: 验证失败

**原因**: Token 或 AESKey 不匹配

**解决**: 检查企业微信配置和 `.env` 是否一致

### 问题 2: 500 错误

**原因**: 环境变量未配置

**解决**: Vercel Dashboard → Settings → Environment Variables

### 问题 3: 消息发送失败

**原因**: Access Token 获取失败

**解决**: 检查 CorpID 和 Secret 是否正确

---

**部署时间**: 2026-03-22  
**版本**: Vercel v1.0
