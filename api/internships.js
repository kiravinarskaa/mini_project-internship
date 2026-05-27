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
    ('TechNova', 'Frontend Intern', 'Web', 'Remote', '2026-06-20',
    'Assist in UI development and improve website pages.',
    'HTML, CSS, JavaScript basics',
    'Mentorship, certificate, portfolio experience'),

    ('DataBridge', 'Data Analyst Intern', 'Data', 'Remote', '2026-07-05',
    'Support data cleaning, Excel reports, and simple dashboard preparation.',
    'Excel, SQL basics, attention to detail',
    'Training, real reporting tasks, recommendation letter'),

    ('CyberShield', 'Cybersecurity Awareness Intern', 'Cybersecurity', 'Hybrid', '2026-07-15',
    'Help prepare cybersecurity awareness materials and phishing prevention content.',
    'Security basics, communication skills, interest in cyber hygiene',
    'Mentorship, awareness project experience, certificate'),

    ('DesignFlow', 'UI/UX Design Intern', 'Design', 'Remote', '2026-06-30',
    'Create wireframes, improve layouts, and support user interface design.',
    'Figma basics, creativity, understanding of layout',
    'Portfolio case study, feedback sessions, certificate'),

    ('WebNest', 'Junior Web Intern', 'Web', 'On-site', '2026-08-01',
    'Build simple landing pages and update website content.',
    'HTML, CSS, GitHub basics',
    'Team experience, code review, internship certificate');
      `);
    }

    // Return internships
    await pool.query("DELETE FROM internships");
    const [rows] = await pool.query("SELECT * FROM internships");

    res.status(200).json(internships);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};