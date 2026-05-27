const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  try {
    await pool.query("DELETE FROM internships");

    await pool.query(`
      INSERT INTO internships
      (company, title, category, location, deadline, description, requirements, offers)
      VALUES
      ('TechNova', 'Frontend Intern', 'Web', 'Remote', '2026-06-20', 'Assist in UI development.', 'HTML, CSS, JavaScript', 'Mentorship and certificate'),
      ('DataBridge', 'Data Analyst Intern', 'Data', 'Remote', '2026-07-05', 'Support data cleaning and reports.', 'Excel, SQL basics', 'Training and real reporting tasks'),
      ('CyberShield', 'Cybersecurity Intern', 'Cybersecurity', 'Hybrid', '2026-07-15', 'Help prepare security awareness materials.', 'Security basics and communication', 'Mentorship and certificate'),
      ('DesignFlow', 'UI/UX Design Intern', 'Design', 'Remote', '2026-06-30', 'Create wireframes and improve layouts.', 'Figma basics', 'Portfolio case study'),
      ('WebNest', 'Junior Web Intern', 'Web', 'On-site', '2026-08-01', 'Build simple landing pages.', 'HTML, CSS, GitHub', 'Code review and certificate')
    `);

    res.status(200).json({ message: "Internships added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};