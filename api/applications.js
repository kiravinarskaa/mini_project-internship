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
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        internship_id INT,
        student_name VARCHAR(100),
        email VARCHAR(150),
        cv_file_name VARCHAR(255),
        motivation TEXT,
        status VARCHAR(50) DEFAULT 'Submitted',
        application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    if (req.method === "GET") {
      const [rows] = await pool.query("SELECT * FROM applications");
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const {
        internship_id,
        student_name,
        email,
        cv_file_name,
        motivation
      } = req.body;

      await pool.query(
        `INSERT INTO applications
        (internship_id, student_name, email, cv_file_name, motivation)
        VALUES (?, ?, ?, ?, ?)`,
        [internship_id, student_name, email, cv_file_name, motivation]
      );

      return res.status(201).json({
        message: "Application saved successfully"
      });
    }

    res.status(405).json({
      error: "Method not allowed"
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};