const Joi = require('joi');

// ✅ Joi 스키마 정의
const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  age: Joi.number().optional(),
  gender: Joi.string().valid('male', 'female', 'none').optional(),
  residence: Joi.string().optional()
});

// ✅ validate 함수 정의
const validate = (userData) => {
  const { error } = userSchema.validate(userData, { abortEarly: false });
  return error ? error.details : null;
};

// ✅ 클라이언트에 반환할 형태 지정
const toResponse = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  age: user.age,
  gender: user.gender,
  residence: user.residence
});

module.exports = {
  validate,     // ✅ 반드시 포함해야 합니다
  toResponse
};