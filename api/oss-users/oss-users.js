// 假设你的文件顶部有类似这样的引入
const OSS = require('ali-oss'); // 或者其他你需要的模块

// 假设你的 OSS client 初始化代码在这里
const client = new OSS({
  region: process.env.OSS_REGION || 'oss-cn-hangzhou',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET || 'aiep-users'
});

const USERS_FILE = 'users.json'; // 你的文件名
// 其他你可能有的常量或辅助函数

module.exports = async (req, res) => {
  // --- CORS Headers ---
  // 允许所有源访问。生产环境中，你可能希望限制为你的前端域名
  // 例如: res.setHeader('Access-Control-Allow-Origin', 'https://your-frontend-domain.com');
  res.setHeader('Access-Control-Allow-Origin', '*');
  // 允许的 HTTP 方法
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // 根据你的 API 支持的方法调整
  // 允许的请求头
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Authorization 如果你将来会用
  // 允许凭证（例如 cookies），如果你的前端需要发送凭证。
  // 如果 Access-Control-Allow-Origin 是 '*'，则不能设置 Access-Control-Allow-Credentials 为 'true'。
  // 如果源是特定的，可以启用: res.setHeader('Access-Control-Allow-Credentials', 'true');

  // --- Handle OPTIONS preflight request ---
  if (req.method === 'OPTIONS') {
    res.status(204).end(); // 204 No Content，表示预检成功
    return; // 结束处理，不执行后续逻辑
  }

  // --- 你现有的 API 逻辑开始于此 ---
  if (req.method === 'GET') {
    // 你处理 GET 请求的逻辑
    try {
      // 示例：const result = await client.get(USERS_FILE);
      // res.status(200).json(JSON.parse(result.content.toString()));
      res.status(200).json({ message: 'GET request received, replace with your logic' });
    } catch (error) {
      console.error('GET Error:', error);
      res.status(error.status || 500).json({ error: 'Failed to process GET request', details: error.message });
    }
  } else if (req.method === 'POST') {
    // 你处理 POST 请求的逻辑
    try {
      // const data = req.body;
      // 示例：await client.put(USERS_FILE, Buffer.from(JSON.stringify(data)));
      // res.status(200).json({ message: 'Data updated' });
      res.status(200).json({ message: 'POST request received, replace with your logic', data: req.body });
    } catch (error) {
      console.error('POST Error:', error);
      res.status(error.status || 500).json({ error: 'Failed to process POST request', details: error.message });
    }
  }
  // ... 其他 HTTP 方法的处理 (PUT, DELETE, etc.)
  else {
    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']); // 提示客户端允许的方法
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
};
