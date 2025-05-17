const Joi = require('joi');

// 실제 지출 저장용 스키마
const expenseSchema = Joi.object({
  category: Joi.string().valid('식비', '교통', '생활', '쇼핑', '기타').required(),
  title: Joi.string().required(),
  amount: Joi.number().integer().required(),
  payment_method: Joi.string().valid('카드', '현금', '계좌이체').required(),
  is_fixed: Joi.boolean().required(),
  memo: Joi.string().allow(''),
  year: Joi.number().integer().required(),
  month: Joi.number().integer().min(1).max(12).required(),
  day: Joi.number().integer().min(1).max(31).required()
});

module.exports = {
  expenseSchema  // ✅ 이름 통일
};