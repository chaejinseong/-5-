const db = require('../config/db');

const findUserByEmail = async (email) => {
  const query = `SELECT * FROM users WHERE email = ?`;
  
  try {
    const [rows] = await db.execute(query, [email]);
    return rows[0] || null;
  } catch (error) {
    console.error('이메일로 사용자 검색 중 오류:', error);
    throw error;
  }
};

const findUserById = async (id) => {
  const query = `SELECT * FROM users WHERE id = ?`;
  
  try {
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
  } catch (error) {
    console.error('ID로 사용자 검색 중 오류:', error);
    throw error;
  }
};

const createUser = async (userData) => {
  const { name, email, password, age, gender, age_group } = userData;

  const query = `
    INSERT INTO users (name, email, password, age, gender, age_group, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  try {
    const [result] = await db.execute(query, [
      name ?? null,
      email ?? null,
      password ?? null,
      age ?? null,
      gender ?? null,
      age_group ?? null
    ]);
    return result.insertId;
  } catch (error) {
    console.error('사용자 생성 중 오류:', error);
    throw error;
  }
};
const updateUser = async (userId, userData) => {
  const updateFields = [];
  const values = [];
  
  Object.entries(userData).forEach(([key, value]) => {
    if (value !== undefined) {
      updateFields.push(`${key} = ?`);
      values.push(value);
    }
  });
  
  if (updateFields.length === 0) return;
  
  const query = `
    UPDATE users 
    SET ${updateFields.join(', ')}, updated_at = NOW() 
    WHERE id = ?
  `;
  
  values.push(userId);
  
  try {
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

const findAdmins = async () => {
  const query = `SELECT * FROM users WHERE role = 'admin'`;
  
  try {
    const [rows] = await db.execute(query);
    return rows;
  } catch (error) {
    console.error('관리자 검색 중 오류:', error);
    throw error;
  }
};

const updateUserRole = async (userId, role) => {
  const query = `UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?`;
  
  try {
    const [result] = await db.execute(query, [role, userId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('사용자 역할 변경 중 오류:', error);
    throw error;
  }
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser , 
  updateUser ,
  findAdmins ,
  updateUserRole
};