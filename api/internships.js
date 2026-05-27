const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = async (req, res) => {

  try {

    // Create table if it does not exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS internships (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company VARCHAR(100),
        title VARCHAR(100),
        category VARCHAR(50),
        location VARCHAR(100),
        deadline DATE,
        description TEXT,
        requirements TEXT,
        offers TEXT
      )
    `);

    // Get internships from database
    const [rows] = await pool.query(
      "SELECT * FROM internships"
    );

    // Return JSON response
    res.status(200).json(rows);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
};