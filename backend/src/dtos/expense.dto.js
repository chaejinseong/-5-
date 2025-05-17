const Joi = require('joi');

// 오늘 지출 임시 등록용 스키마
const expenseTempSchema = Joi.object({
  category: Joi.string().valid('식비', '교통', '생활', '쇼핑', '기타').required(),
  title: Joi.string().max(255).required(),
  amount: Joi.number().min(0).required(),
  payment_method: Joi.string().valid('카드', '현금', '계좌이체').required(),
  is_fixed: Joi.boolean().required(),
  memo: Joi.string().allow('', null),
  spent_at: Joi.date().required()
});

module.exports = {
  expenseTempSchema
};