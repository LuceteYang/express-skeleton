const pool = require('./db').pool;

exports.getPosts = async () => {
  const client = await pool.connect();
  let res;
  try {
    const result = await client.query(
      'select $1::text as name', ['brianc']
    );
    res = result.rows;
  } catch (err) {
    throw err;
  } finally {
    client.release(); // Release for other connections to use
  }
  return res;
};