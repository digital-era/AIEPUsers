const OSS = require('ali-oss');

const client = new OSS({
  region: 'oss-cn-hangzhou', // 你实际的区域
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: 'aiep-users' // 你实际的 Bucket 名称
});

const USERS_FILE = 'users.json';
const DEFAULT_USERS_CONTENT = Buffer.from('{}'); // 默认内容

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      let result;
      try {
        // 尝试获取文件
        result = await client.get(USERS_FILE);
      } catch (error) {
        // 如果错误是 NoSuchKey (文件不存在)
        if (error.code === 'NoSuchKey' || error.status === 404) {
          console.log(`'${USERS_FILE}' not found. Creating it with default content.`);
          // 创建文件，内容为 {}
          await client.put(USERS_FILE, DEFAULT_USERS_CONTENT);
          // 重新获取文件 (或者直接使用默认内容，取决于你的需求)
          // 这里我们选择再次获取，以确保一致性，虽然也可以直接用 DEFAULT_USERS_CONTENT
          // result = await client.get(USERS_FILE); // 如果创建后需要立即读出来
          // 或者，如果创建后就返回默认内容：
          return res.status(200).json({}); // 直接返回新创建的空对象
        }
        // 如果是其他错误 (如 AccessDenied)，则重新抛出，由外层 catch 处理
        throw error;
      }

      // 如果文件存在且已获取
      res.status(200).json(JSON.parse(result.content.toString()));

    } catch (error) {
      console.error('OSS GET or PUT error:', error);
      // 返回更详细的错误信息给客户端可能有助于调试，但生产环境要注意敏感信息泄露
      res.status(error.status || 500).json({
        error: 'Failed to fetch or initialize users data',
        details: error.message,
        code: error.code
      });
    }
  } else if (req.method === 'POST') {
    const { users } = req.body;
    if (!users) {
      return res.status(400).json({ error: 'Users data required' });
    }
    try {
      await client.put(USERS_FILE, Buffer.from(JSON.stringify(users)));
      res.status(200).json({ message: 'Users updated' });
    } catch (error) {
      console.error('OSS PUT error:', error);
      res.status(error.status || 500).json({
        error: 'Failed to update users',
        details: error.message,
        code: error.code
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
