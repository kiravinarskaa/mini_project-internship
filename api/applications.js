const mysql = require("mysql2/promise");


// Create a connection pool to the MySQL database.
// A pool is more efficient than opening a new connection
// for every request.
const pool = mysql.createPool({
  host: process.env.DB_HOST,  // Database host
  user: process.env.DB_USER,    // Database username
  password: process.env.DB_PASSWORD,  // Database password
  database: process.env.DB_NAME,    // Database name
  port: process.env.DB_PORT,     // Database port
  ssl: {
    rejectUnauthorized: false     // Allow SSL connection
  }
});

// Main API handler
module.exports = async (req, res) => {
  try {

    // Create the applications table if it does not exist.
    // This runs every time the API is called, but MySQL
    // will only create the table once.
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

    
    // GET REQUEST
    // Return all applications
    if (req.method === "GET") {
      const [rows] = await pool.query("SELECT * FROM applications");
      return res.status(200).json(rows);
    }

    // DELETE REQUEST
    // Delete all applications
    if (req.method === "DELETE") {
        await pool.query("DELETE FROM applications");

        return res.status(200).json({
        message: "All applications deleted"
    });
    }

    // POST REQUEST
    // Save a new application
    if (req.method === "POST") {
       // Extract data sent from the frontend
      const {
        internship_id,
        student_name,
        email,
        cv_file_name,
        motivation
      } = req.body;

      /* Check if this email already applied for this internship */
      const [existing] = await pool.query(
        `SELECT * FROM applications
         WHERE internship_id = ? AND email = ?`,
        [internship_id, email]
      );

      // If a matching application exists,
      // prevent duplicate submissions.
      if (existing.length > 0) {
        return res.status(409).json({
          error: "You have already applied for this internship."
        });
      }

      /* Save new application */
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

    // Send a 405 (Method Not Allowed) response when a request
// uses an HTTP method that is not implemented by this API.
// Supported methods: GET, POST, DELET
    res.status(405).json({
      error: "Method not allowed"
    });

      // Handle unexpected server or database errors

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};