/**
 * 企业微信消息加解密模块
 * 基于 Crypto-JS 实现 AES-CBC 加解密
 */

const CryptoJS = require('crypto-js');

class WXBizMsgCrypt {
  constructor(token, encodingAESKey, corpId) {
    this.token = token;
    this.encodingAESKey = encodingAESKey;
    this.corpId = corpId;
    
    // 解码 AES Key (Base64)
    this.aesKey = CryptoJS.enc.Base64.parse(encodingAESKey);
  }

  /**
   * PKCS7 填充
   */
  pkcs7Pad(data) {
    const blockSize = 16;
    const padding = blockSize - (data.length % blockSize);
    const padded = Buffer.alloc(data.length + padding, padding);
    data.copy(padded);
    return padded;
  }

  /**
   * PKCS7 去填充
   */
  pkcs7Unpad(data) {
    const padding = data[data.length - 1];
    return data.slice(0, data.length - padding);
  }

  /**
   * 加密消息
   * @param {string} text - 要加密的文本
   * @returns {string} - Base64 编码的密文
   */
  encrypt(text) {
    // 生成 16 字节随机字符串
    const randomStr = this._randomString(16);
    
    // 消息体
    const msgBody = Buffer.from(text, 'utf-8');
    
    // 4 字节网络字节序的消息长度
    const msgLen = Buffer.alloc(4);
    msgLen.writeUInt32BE(msgBody.length, 0);
    
    // 拼接：随机字符串 (16) + 消息长度 (4) + 消息体 + corp_id
    const toEncrypt = Buffer.concat([
      Buffer.from(randomStr, 'utf-8'),
      msgLen,
      msgBody,
      Buffer.from(this.corpId, 'utf-8')
    ]);
    
    // PKCS7 填充
    const padded = this.pkcs7Pad(toEncrypt);
    
    // AES 加密 (CBC 模式，IV = Key 前 16 字节)
    const iv = this.aesKey.slice(0, 16);
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Hex.parse(padded.toString('hex')),
      this.aesKey,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.NoPadding // 已手动填充
      }
    );
    
    return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  }

  /**
   * 解密消息
   * @param {string} encryptedText - Base64 编码的密文
   * @returns {string} - 解密后的明文
   */
  decrypt(encryptedText) {
    // Base64 解码
    const encrypted = CryptoJS.enc.Base64.parse(encryptedText);
    
    // AES 解密
    const iv = this.aesKey.slice(0, 16);
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encrypted },
      this.aesKey,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.NoPadding
      }
    );
    
    // 转换为 Buffer
    const decryptedBytes = Buffer.from(decrypted.toString(CryptoJS.enc.Hex), 'hex');
    
    // PKCS7 去填充
    const unpadded = this.pkcs7Unpad(decryptedBytes);
    
    // 提取消息体
    // 格式：随机字符串 (16) + 消息长度 (4) + 消息体 + corp_id
    const msgLen = unpadded.readUInt32BE(16);
    const msgBody = unpadded.slice(20, 20 + msgLen);
    
    return msgBody.toString('utf-8');
  }

  /**
   * 验证签名（URL 验证）
   */
  verifySignature(timestamp, nonce, echoStr, signature) {
    const sortedList = [this.token, timestamp, nonce, echoStr].sort();
    const concatenated = sortedList.join('');
    const hash = CryptoJS.SHA1(concatenated).toString(CryptoJS.enc.Hex);
    return hash === signature;
  }

  /**
   * 验证消息签名
   */
  verifyMessageSignature(timestamp, nonce, msgBody, signature) {
    const sortedList = [this.token, timestamp, nonce, msgBody].sort();
    const concatenated = sortedList.join('');
    const hash = CryptoJS.SHA1(concatenated).toString(CryptoJS.enc.Hex);
    return hash === signature;
  }

  /**
   * 生成随机字符串
   */
  _randomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 验证 URL 并解密 echo_str
   */
  verifyURL(echoStr, signature, timestamp, nonce) {
    if (this.verifySignature(timestamp, nonce, echoStr, signature)) {
      try {
        // echo_str 可能已加密
        return this.decrypt(echoStr);
      } catch (e) {
        // 未加密，直接返回
        return echoStr;
      }
    }
    return null;
  }
}

module.exports = WXBizMsgCrypt;
