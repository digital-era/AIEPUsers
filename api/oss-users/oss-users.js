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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // 只包含你实际支持的方法
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // --- Handle OPTIONS preflight request ---
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // --- API Logic ---
  if (req.method === 'GET') {
    try {
      let result;
      try {
        result = await client.get(USERS_FILE);
      } catch (getSpecificError) {
        // 如果文件不存在，可以考虑创建一个空的，或者返回特定状态
        if (getSpecificError.code === 'NoSuchKey' || getSpecificError.status === 404) {
          // 选项1: 返回 404
          // return res.status(404).json({ error: 'Users file not found' });

          // 选项2: 创建空文件并返回空对象 (如同之前的版本)
          console.log(`'${USERS_FILE}' not found. Creating it with default content.`);
          await client.put(USERS_FILE, Buffer.from('{}'));
          return res.status(200).json({});
        }
        // 其他 get 错误，重新抛出由外层 catch 处理 (如果需要两层 catch)
        // 或者直接在这里处理
        throw getSpecificError;
      }
      res.status(200).json(JSON.parse(result.content.toString()));
    } catch (error) {
      console.error('OSS GET error:', error);
      res.status(error.status || 500).json({
        error: 'Failed to fetch users',
        details: error.message, // 提供更多错误细节
        code: error.code       // 提供错误码
      });
    }
  } else if (req.method === 'POST') {
    const requestBody = req.body;
    let usersToSave;

    // 根据 auth.js, req.body 应该是 { users: { ...actualUserData... } }
    if (requestBody && typeof requestBody.users === 'object' && requestBody.users !== null) {
        usersToSave = requestBody.users;
    } else {
      // 如果不符合预期结构，返回错误
      return res.status(400).json({ error: 'Users data required in the "users" field of the request body' });
    }

    // 可选：进行更严格的 usersToSave 数据验证
    if (Object.keys(usersToSave).length === 0 && JSON.stringify(usersToSave) !== '{}') {
        // 防止传入空对象但不是 {} 的情况，例如 { users: null } 经过上面处理后 usersToSave 会是 null
        // 但如果你的逻辑允许空用户列表 (例如清空用户)，则此检查可能不需要或需要调整
    }

    try {
      await client.put(USERS_FILE, Buffer.from(JSON.stringify(usersToSave)));
      res.status(200).json({ message: 'Users updated successfully' }); // 成功的消息可以更具体
    } catch (error) {
      console.error('OSS PUT error:', error);
      res.status(error.status || 500).json({
        error: 'Failed to update users',
        details: error.message,
        code: error.code
      });
    }
  } else {
    // 处理所有其他不被允许的 HTTP 方法
    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']); // 告诉客户端服务器允许哪些方法
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
};
