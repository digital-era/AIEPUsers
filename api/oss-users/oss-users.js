const OSS = require('ali-oss');

const client = new OSS({
  region: 'oss-cn-hangzhou',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: 'evolutionary-paradigm-users'
});

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const result = await client.get('users.json');
      res.status(200).json(JSON.parse(result.content.toString()));
    } catch (error) {
      console.error('OSS GET error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  } else if (req.method === 'POST') {
    const { users } = req.body;
    if (!users) {
      return res.status(400).json({ error: 'Users data required' });
    }
    try {
      await client.put('users.json', Buffer.from(JSON.stringify(users)));
      res.status(200).json({ message: 'Users updated' });
    } catch (error) {
      console.error('OSS PUT error:', error);
      res.status(500).json({ error: 'Failed to update users' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
