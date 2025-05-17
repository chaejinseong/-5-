const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const userDto = require('../dtos/userDto');


const registerUser = async (userData) => {
  // 유효성 검사
  const errors = userDto.validate(userData);
  if (errors) {
    throw { status: 400, message: 'Validation failed', errors };
  }

  // 이메일 중복 확인
  const existingUser = await userRepository.findUserByEmail(userData.email);
  if (existingUser) {
    throw { status: 409, message: '이미 등록된 이메일입니다' };
  }

  // 비밀번호 해싱
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

  // 사용자 생성
  const userId = await userRepository.createUser({
    ...userData,
    password: hashedPassword,
  });

  // 생성된 사용자 조회
  const newUser = await userRepository.findUserById(userId);
  if (!newUser) {
    throw { status: 500, message: '사용자 생성 후 조회 실패' };
  }

  return userDto.toResponse(newUser);
};

const loginUser = async (email, password) => {
  const user = await userRepository.findUserByEmail(email);

  if (!user) {
    throw { status: 401, message: '이메일 또는 비밀번호가 일치하지 않습니다' };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw { status: 401, message: '이메일 또는 비밀번호가 일치하지 않습니다' };
  }

  const token = generateToken(user.id, { role: user.role });

  return { user, token };
};

const generateToken = (userId, options = {}) => {
  const payload = { userId, ...options };
  const expiresIn = options.needsCompletion ? '1h' : '24h';

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다.');
  }

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const getUserById = async (userId) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw { status: 404, message: '사용자를 찾을 수 없습니다' };
  }
  return userDto.toResponse(user);
};

const updateUserProfile = async (userId, profileData) => {
  await userRepository.updateUser(userId, profileData);
  const user = await userRepository.findUserById(userId);
  return userDto.toResponse(user);
};

const deactivateUser = async (userId) => {
  return await userRepository.updateUser(userId, { status: 0 });
};

const getAdmins = async () => {
  const admins = await userRepository.findAdmins();
  return admins.map((admin) => userDto.toResponse(admin));
};

const updateUserRole = async (userId, role) => {
  const ALLOWED_ROLES = ['user', 'admin'];
  if (!ALLOWED_ROLES.includes(role)) {
    throw { status: 400, message: '유효하지 않은 역할입니다.' };
  }

  const success = await userRepository.updateUserRole(userId, role);
  if (!success) {
    throw { status: 404, message: '사용자를 찾을 수 없습니다.' };
  }

  return await getUserById(userId);
};

module.exports = {
  registerUser,
  loginUser,
  generateToken,
  getUserById,
  updateUserProfile,
  deactivateUser,
  getAdmins,
  updateUserRole,
};