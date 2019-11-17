const bcrypt = require('bcryptjs');
const database = require('../../database');
const keysToLowerCase = require('../../utils/keysToLowerCase');

class UserController {
  async index(req, res) {
    let conn;
    try {
      const query = `SELECT * FROM USERS`;
      conn = await database.open();
      const response = await conn.execute(query);
      return res.json(keysToLowerCase(response));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    } finally {
      await database.close(conn);
    }
  }

  async store(req, res) {
    let conn;
    try {
      const { name, email, admin } = req.body;
      const password = await bcrypt.hash(req.body.password, 8);
      const query = `INSERT INTO USERS (
          ID, NAME, EMAIL, PASSWORD, ADMIN, CREATED_AT
        ) VALUES (
            (SELECT NVL(MAX(ID), 0) + 1 FROM USERS)
          , :name
          , :email
          , :password
          , :admin
          , LOCALTIMESTAMP
        )  RETURNING ID INTO :id`;
      conn = await database.open();
      const response = await conn.execute(
        query,
        {
          name,
          email,
          password,
          admin,
          id: {
            dir: database.options.bindOut,
            type: database.options.number,
          },
        },
        {
          autoCommit: true,
        }
      );
      if (response.rowsAffected && response.rowsAffected === 1) {
        const [id] = response.outBinds.id;
        const result = await conn.execute(
          'SELECT * FROM USERS WHERE ID = :id',
          { id }
        );
        return res.json(keysToLowerCase(result)[0]);
      }
      return res.status(400).json({ error: 'Insert has been failed.' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  async show(req, res) {
    let conn;
    try {
      const { id } = req.params;
      const query = 'SELECT * FROM USERS WHERE ID = :id';
      conn = await database.open();
      const response = await conn.execute(query, { id });
      if (response.rows.length) {
        return res.json(keysToLowerCase(response)[0]);
      }
      return res.json({ error: 'User not found.' });
    } catch (err) {
      return res.status(500).json({ erro: err.message });
    }
  }

  async update(req, res) {
    let conn;
    try {
      const { id } = req.params;
      const { name, email, admin } = req.body;
      const password = await bcrypt.hash(req.body.password, 8);
      const query = `UPDATE USERS SET 
            NAME = :name
          , EMAIL = :email
          , PASSWORD = :password
          , ADMIN = :admin 
          , UPDATED_AT = LOCALTIMESTAMP
          WHERE ID = :id`;
      conn = await database.open();
      const response = await conn.execute(
        query,
        {
          id,
          name,
          email,
          password,
          admin,
        },
        {
          autoCommit: true,
        }
      );
      if (response.rowsAffected && response.rowsAffected === 1) {
        const result = await conn.execute(
          'SELECT * FROM USERS WHERE ID = :id',
          { id }
        );
        return res.json(keysToLowerCase(result)[0]);
      }
      return res.status(400).json({ error: 'Update has been failed.' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    } finally {
      database.close(conn);
    }
  }

  async destroy(req, res) {
    let conn;
    try {
      const { id } = req.params;
      const query = 'DELETE FROM USERS WHERE ID = :id';
      conn = await database.open();
      const response = await conn.execute(query, { id }, { autoCommit: true });
      if (response.rowsAffected && response.rowsAffected === 1) {
        return res.json({ result: 'ok' });
      }
      return res.json({ error: 'User not found.' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    } finally {
      database.close(conn);
    }
  }
}

module.exports = new UserController();
