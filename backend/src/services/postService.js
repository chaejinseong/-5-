const postRepository = require('../repositories/postRepository');

exports.createPost = async (userId, title, content) => {
  return await postRepository.createPost(userId, title, content);
};

exports.deletePost = async (postId, userId) => {
  const post = await postRepository.findPostById(postId);
  if (!post) throw { status: 404, message: '게시글을 찾을 수 없습니다.' };
  if (post.user_id !== userId) throw { status: 403, message: '삭제 권한이 없습니다.' };

  await postRepository.deletePost(postId);
};
