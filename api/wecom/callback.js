/**
 * 企业微信 API 回调 - Vercel Serverless 版本（新格式）
 * 
 * 功能:
 * - GET: URL 验证
 * - POST: 接收消息并回复
 * 
 * 使用 Vercel Functions 新格式：export default { fetch }
 */

const WXBizMsgCrypt = require('./lib/wxcrypt');
const crypto = require('crypto');

// 配置（从环境变量读取）
const CORP_ID = process.env.WECOM_CORP_ID || '';
const AGENT_ID = process.env.WECOM_AGENT_ID || '';
const SECRET = process.env.WECOM_SECRET || '';
const TOKEN = process.env.WECOM_TOKEN || '';
const ENCODING_AES_KEY = process.env.WECOM_ENCODING_AES_KEY || '';

// 加解密器
const crypt = new WXBizMsgCrypt(TOKEN, ENCODING_AES_KEY, CORP_ID);

/**
 * Vercel Function 入口（新格式）
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

  // 获取查询参数
  const signature = request.query?.msg_signature || '';
  const timestamp = request.query?.timestamp || '';
  const nonce = request.query?.nonce || '';
  const echostr = request.query?.echostr || '';

  console.log('🔍 收到回调请求');
  console.log('  Method:', request.method);
  console.log('  Signature:', signature);
  console.log('  Timestamp:', timestamp);
  console.log('  Nonce:', nonce);
  console.log('  EchoStr:', echostr ? '存在' : '不存在');

  try {
    if (request.method === 'GET') {
      // URL 验证
      console.log('📝 处理 URL 验证请求');
      
      // 验证签名
      const sortedList = [TOKEN, timestamp, nonce, echostr].sort();
      const concatenated = sortedList.join('');
      const calculatedSignature = crypto.createHash('sha1').update(concatenated).digest('hex');
      
      console.log('  计算签名:', calculatedSignature);
      console.log('  接收签名:', signature);
      console.log('  签名匹配:', calculatedSignature === signature);
      
      if (calculatedSignature === signature) {
        console.log('✅ URL 验证成功（明文模式）');
        return response.status(200).send(echostr);
      }
      
      // 尝试验证加密模式
      try {
        const decrypted = crypt.verifyURL(echostr, signature, timestamp, nonce);
        if (decrypted) {
          console.log('✅ URL 验证成功（加密模式）');
          return response.status(200).send(decrypted);
        }
      } catch (decryptError) {
        console.log('⚠️ 解密失败:', decryptError.message);
      }
      
      console.error('❌ URL 验证失败');
      return response.status(403).send('验证失败');
    }

    if (request.method === 'POST') {
      // 接收消息
      console.log('📨 处理消息请求');
      
      // 企业微信目前只需要验证，POST 可以返回空
      return response.status(200).send('success');
    }

    // 不支持的方法
    return response.status(405).send('Method Not Allowed');

  } catch (error) {
    console.error('❌ 处理请求失败:', error);
    return response.status(500).send('Internal Server Error');
  }
};
