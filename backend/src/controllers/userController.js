const userService = require('../services/userService.js');
const userDto = require('../dtos/userDto');
const jwt = require('jsonwebtoken');

//회원가입
const register = async (req, res, next) => {
  try {
    const userData = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      age: req.body.age || null,
      gender: req.body.gender || null,
      residence: req.body.residence || null
    };
    
    const result = await userService.registerUser(userData);
    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다',
      data: result
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
        errors: error.errors
      });
    }
    next(error);
  }
};

//로그인
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '이메일과 비밀번호를 입력해주세요'
      });
    }
    
    const { user, token } = await userService.loginUser(email, password);
    
    res.status(200).json({
      success: true,
      message: '로그인 성공',
      data: {
        user: userDto.toResponse(user),
        token,
        isAdmin: user.role === 'admin'
      }
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

//사용자 정보 조회
const me = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await userService.getUserById(userId);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  me
};