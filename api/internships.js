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

    // Create internships table
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

    // Check if table empty
    const [rows] = await pool.query(
      "SELECT * FROM internships"
    );

    // Insert default internship
    if (rows.length === 0) {
      await pool.query(`
        INSERT INTO internships
        (company, title, category, location, deadline, description, requirements, offers)
        VALUES
        (
          'TechNova',
          'Frontend Intern',
          'Web',
          'Remote',
          '2026-06-20',
          'Assist in UI development',
          'HTML, CSS, JavaScript',
          'Mentorship and certificate'
        )
      `);
    }

    // Return internships
    const [internships] = await pool.query(
      "SELECT * FROM internships"
    );

    res.status(200).json(internships);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};