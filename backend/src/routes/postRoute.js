const express = require('express');
const router = express.Router();
const Joi = require('joi');

const postController = require('../controllers/postController');
const { authenticateToken } = require('../middlewares/authmiddleware');
const validate = require('../middlewares/validate');

const postSchema = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    'string.base': '제목은 문자열이어야 합니다.',
    'string.empty': '제목은 필수입니다.',
    'string.min': '제목은 최소 2자 이상이어야 합니다.',
    'string.max': '제목은 최대 100자 이하이어야 합니다.',
    'any.required': '제목은 필수입니다.',
  }),
  content: Joi.string().min(1).max(1000).required().messages({
    'string.base': '내용은 문자열이어야 합니다.',
    'string.empty': '내용은 필수입니다.',
    'string.min': '내용은 최소 1자 이상이어야 합니다.',
    'string.max': '내용은 최대 1000자 이하이어야 합니다.',
    'any.required': '내용은 필수입니다.',
  }),
});

router.post(
  '/',
  authenticateToken,
  validate(postSchema),
  postController.createPost
);

router.delete('/:id', authenticateToken, postController.deletePost);

module.exports = router;
