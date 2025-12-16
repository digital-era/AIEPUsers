// api/sts.js
const STS = require('@alicloud/sts20150401');
const OpenApi = require('@alicloud/openapi-client');

export default async function handler(req, res) {
  // 处理跨域 (CORS) - 允许你的 GitHub Pages 域名访问
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // 上线时建议改成你的具体域名，如 'https://yourname.github.io'
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const config = new OpenApi.Config({
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,       // 从环境变量读取
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET // 从环境变量读取
    });
    // 你的 OSS 所在 Endpoint，STS 通常是 sts.aliyuncs.com
    config.endpoint = `sts.aliyuncs.com`;

    const client = new STS.default(config);
    
    const request = new STS.AssumeRoleRequest({
      roleArn: process.env.OSS_ROLE_ARN, // 阿里云 RAM 角色 ARN
      roleSessionName: 'QuantGuardiansSession',
      durationSeconds: 900 // 15分钟有效期
    });

    const response = await client.assumeRole(request);
    
    // 返回临时密钥给前端
    res.status(200).json({
      AccessKeyId: response.body.credentials.accessKeyId,
      AccessKeySecret: response.body.credentials.accessKeySecret,
      SecurityToken: response.body.credentials.securityToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch STS token' });
  }
}
