import * as crypto from 'crypto';

export function decodeECB(_key: string, encode: string) {
  // 固定长度16字符（16 字节）的key密钥，生成的密钥就是 128 位。
  // 24（24 字节）长度就是 192 位、32（32 字节）长度就是 256 位。
  // 前端使用aes-128-ecb，PKCS#7 填充，固定16字符(128位)的密钥
  /***
   const encrypted = CryptoJS.AES.encrypt(password,
    CryptoJS.enc.Utf8.parse('yourFixedKey16!!'),
    {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    }).toString();
  */
  // 16 字节密钥
  const key = Buffer.from(_key); // 确保是16字节
  // 将 Base64 编码的字符串转换为 Buffer
  const encryptedBytes = Buffer.from(encode, 'base64');
  // 初始化解密器
  const decipher = crypto.createDecipheriv('aes-128-ecb', key, null); // ECB 模式不需要 IV
  decipher.setAutoPadding(true);
  // 解密
  let decrypted = decipher.update(encryptedBytes);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString('utf8');
}
