import db from '../config/db.js';

const findByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const { rows } = await db.query(query, [email]);
  return rows[0];
};

const findById = async (id) => {
  const query = 'SELECT * FROM users WHERE id = $1';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const createUser = async (user) => {
  const { email, password, name, role } = user;
  const query = 'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING *';
  const { rows } = await db.query(query, [email, password, name, role]);
  return rows[0];
};

const updateUser = async (id, updates) => {
  const { name, email, role } = updates;
  const query = 'UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4 RETURNING *';
  const { rows } = await db.query(query, [name, email, role, id]);
  return rows[0];
};

const deleteUser = async (id) => {
  const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

export default {
  findByEmail,
  findById,
  createUser,
  updateUser,
  deleteUser
};
