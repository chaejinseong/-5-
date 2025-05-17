const postService = require('../services/postService');

exports.createPost = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.id;

  try {
    const postId = await postService.createPost(userId, title, content);
    res.status(201).json({ message: '게시글이 등록되었습니다.', postId });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  try {
    await postService.deletePost(postId, userId);
    res.json({ message: '게시글이 성공적으로 삭제되었습니다.' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || '서버 오류' });
  }
};
