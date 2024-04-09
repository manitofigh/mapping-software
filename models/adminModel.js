import db from '../config/db.js';

const getAdmins = async () => {
  const query = 'SELECT * FROM users WHERE role = \'admin\'';
  const { rows } = await db.query(query);
  return rows;
};

const isAdmin = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1 AND role = \'admin\'';
  const { rows } = await db.query(query, [email]);
  return rows.length > 0;
};

const createAdmin = async (adminDetails) => {
  const { email, password, name } = adminDetails;
  const query = 'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, \'admin\') RETURNING *';
  const { rows } = await db.query(query, [email, password, name]);
  return rows[0];
};

const updateAdmin = async (id, updates) => {
  const { name, email } = updates;
  const query = 'UPDATE users SET name = $1, email = $2 WHERE id = $3 AND role = \'admin\' RETURNING *';
  const { rows } = await db.query(query, [name, email, id]);
  return rows[0];
};

const deleteAdmin = async (id) => {
  const query = 'DELETE FROM users WHERE id = $1 AND role = \'admin\' RETURNING *';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

export default {
  getAdmins,
  isAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin
};
