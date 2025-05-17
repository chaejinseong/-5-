const db = require('../config/db');

exports.createPost = async (userId, title, content) => {
  const [result] = await db.execute(
    'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)',
    [userId, title, content]
  );
  return result.insertId;
};

exports.findPostById = async (postId) => {
  const [rows] = await db.execute('SELECT * FROM posts WHERE id = ?', [postId]);
  return rows[0];
};

exports.deletePost = async (postId) => {
  await db.execute('DELETE FROM posts WHERE id = ?', [postId]);
};
