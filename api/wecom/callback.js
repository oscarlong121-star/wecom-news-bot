/**
 * 企业微信 API 回调 - Vercel Serverless 版本
 * 
 * 功能:
 * - GET: URL 验证
 * - POST: 接收消息并回复
 */

const WXBizMsgCrypt = require('../lib/wxcrypt');
const { XMLParser, XMLBuilder } = require('fast-xml-parser');
const axios = require('axios');

// 配置（从环境变量读取）
const CORP_ID = process.env.WECOM_CORP_ID;
const AGENT_ID = process.env.WECOM_AGENT_ID;
const SECRET = process.env.WECOM_SECRET;
const TOKEN = process.env.WECOM_TOKEN;
const ENCODING_AES_KEY = process.env.WECOM_ENCODING_AES_KEY;

// 加解密器
const crypt = new WXBizMsgCrypt(TOKEN, ENCODING_AES_KEY, CORP_ID);

// XML 解析器
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: true
});

// XML 构建器
const xmlBuilder = new XMLBuilder({
  ignoreAttributes: false,
  format: true,
  suppressEmptyNode: true
});

// Access Token 缓存
let accessToken = null;
let tokenExpiresAt = 0;

/**
 * 获取 Access Token
 */
async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  const url = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken';
  const params = {
    corpid: CORP_ID,
    corpsecret: SECRET
  };

  const response = await axios.get(url, { params });
  const result = response.data;

  if (result.errcode === 0) {
    accessToken = result.access_token;
    // 提前 5 分钟刷新
    tokenExpiresAt = Date.now() + (result.expires_in - 300) * 1000;
    console.log('✅ Access Token 刷新成功');
    return accessToken;
  } else {
    console.error('❌ 获取 Access Token 失败:', result);
    throw new Error(`获取 Access Token 失败：${result.errmsg}`);
  }
}

/**
 * 发送 Markdown 消息
 */
async function sendMarkdown(chatId, content) {
  const token = await getAccessToken();
  const url = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${token}`;

  const payload = {
    touser: chatId,
    msgtype: 'markdown',
    agentid: parseInt(AGENT_ID),
    markdown: {
      content: content
    }
  };

  const response = await axios.post(url, payload);
  return response.data;
}

/**
 * 解析接收到的消息
 */
function parseMessage(xmlData, encrypted = false) {
  let xml = xmlData;

  if (encrypted) {
    // 解密消息
    const root = xmlParser.parse(xmlData);
    if (root.xml && root.xml.Encrypt) {
      const decrypted = crypt.decrypt(root.xml.Encrypt);
      xml = decrypted;
    }
  }

  const parsed = xmlParser.parse(xml);
  return parsed.xml;
}

/**
 * 创建回复消息（XML 格式）
 */
function createReply(fromMsg, content, msgType = 'text') {
  const reply = {
    xml: {
      ToUserName: fromMsg.FromUserName,
      FromUserName: fromMsg.ToUserName,
      CreateTime: Math.floor(Date.now() / 1000),
      MsgType: msgType,
      Content: content
    }
  };

  const xml = xmlBuilder.build(reply);

  // 加密回复
  const encryptedContent = crypt.encrypt(xml);

  // 生成签名
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = 'random_nonce_' + Math.random().toString(36).substr(2, 9);
  const signatureList = [TOKEN, timestamp, nonce, encryptedContent].sort();
  const signature = require('crypto').createHash('sha1')
    .update(signatureList.join(''))
    .digest('hex');

  // 返回加密后的响应
  const responseXml = `<xml>
<Encrypt><![CDATA[${encryptedContent}]]></Encrypt>
<MsgSignature><![CDATA[${signature}]]></MsgSignature>
<TimeStamp>${timestamp}</TimeStamp>
<Nonce><![CDATA[${nonce}]]></Nonce>
</xml>`;

  return responseXml;
}

/**
 * 格式化新闻为 Markdown
 */
function formatNewsMarkdown(newsItems) {
  if (!newsItems || newsItems.length === 0) {
    return '暂无新闻';
  }

  let md = `## 📰 新闻热点 - ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n\n`;

  newsItems.slice(0, 10).forEach((item, index) => {
    const title = item.title_cn || item.title || '无标题';
    const source = item.source || '未知来源';
    const url = item.url || '#';
    const summary = item.summary_cn || item.summary || '';

    md += `${index + 1}. **${title}**\n`;
    md += `   来源：${source}\n`;
    if (summary) {
      md += `   ${summary}\n`;
    }
    md += `   [查看详情](${url})\n\n`;
  });

  md += `\n---\n_共 ${newsItems.length} 条新闻 | 生成时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}_`;

  return md;
}

/**
 * 从存档读取最新新闻
 */
async function loadLatestNews(limit = 20) {
  try {
    // 读取今日存档文件
    const today = new Date().toLocaleDateString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');

    const fs = require('fs');
    const path = require('path');
    
    // Vercel 无法读取本地文件，这里模拟新闻数据
    // 实际使用时需要从外部存储（如数据库、KV）读取
    
    // 模拟新闻数据（用于测试）
    return [
      {
        title: 'Vercel 部署成功',
        title_cn: 'Vercel 部署成功',
        source: '系统通知',
        url: 'https://vercel.com',
        summary: '企业微信回调服务已成功部署到 Vercel',
        summary_cn: '企业微信回调服务已成功部署到 Vercel',
        published_beijing: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
      }
    ];
  } catch (error) {
    console.error('读取新闻失败:', error);
    return [];
  }
}

/**
 * Vercel Serverless 入口函数
 */
module.exports = async (request, response) => {
  // 设置 CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 预检请求
  if (request.method === 'OPTIONS') {
    return response.status(200).send('');
  }

  const signature = request.query.msg_signature || '';
  const timestamp = request.query.timestamp || '';
  const nonce = request.query.nonce || '';

  try {
    if (request.method === 'GET') {
      // URL 验证
      console.log('🔍 收到 URL 验证请求');
      
      const echoStr = request.query.echostr || '';
      const decrypted = crypt.verifyURL(echoStr, signature, timestamp, nonce);

      if (decrypted) {
        console.log('✅ URL 验证成功');
        return response.status(200).send(decrypted);
      } else {
        console.error('❌ URL 验证失败');
        return response.status(403).send('验证失败');
      }
    }

    if (request.method === 'POST') {
      // 接收消息
      console.log('📨 收到消息');
      
      const xmlData = typeof request.body === 'string' 
        ? request.body 
        : JSON.stringify(request.body);
      
      console.log('原始消息:', xmlData.substring(0, 200));

      // 解析消息
      const msg = parseMessage(xmlData);
      console.log('解析后的消息:', msg);

      if (!msg || !msg.MsgType) {
        console.error('❌ 消息解析失败');
        return response.status(400).send('error');
      }

      // 处理消息
      const content = msg.Content || '';
      console.log(`收到来自 ${msg.FromUserName} 的消息：${content}`);

      // 根据消息内容回复
      let replyContent;
      if (content.includes('新闻') || content.includes('推送')) {
        // 推送新闻
        const newsItems = await loadLatestNews();
        replyContent = formatNewsMarkdown(newsItems);
        
        // 主动发送消息到群聊
        try {
          // 这里需要群聊 ID，可以从配置读取
          const chatId = process.env.WECOM_CHAT_ID || msg.FromUserName;
          await sendMarkdown(chatId, replyContent);
          console.log('✅ 新闻推送成功');
        } catch (error) {
          console.error('推送失败:', error);
        }
      } else {
        replyContent = `🤖 收到您的消息：${content}\n\n发送"新闻"获取最新推送`;
      }

      // 创建回复
      const replyXml = createReply(msg, replyContent);
      console.log('回复消息:', replyXml.substring(0, 200));

      return response.status(200).type('application/xml').send(replyXml);
    }

    // 不支持的方法
    return response.status(405).send('Method Not Allowed');

  } catch (error) {
    console.error('❌ 处理请求失败:', error);
    return response.status(500).send('Internal Server Error');
  }
};
