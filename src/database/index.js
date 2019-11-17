const oracledb = require('oracledb');
const config = require('../config/database');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const open = async () => {
  try {
    return await oracledb.getConnection(config);
  } catch (err) {
    return err;
  }
};

const close = async conn => {
  if (conn) {
    try {
      await conn.close();
    } catch (err) {
      console.log(err.message);
    }
  }
};

module.exports = {
  open,
  close,
  options: {
    bindOut: oracledb.BIND_OUT,
    number: oracledb.NUMBER,
  },
};
