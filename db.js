const mysql = require('mysql2');

const db = mysql.createPool({
  host: "sql12.freesqldatabase.com",   // replace
  user: "sql12809202",      // replace
  password: "whTkDvTpMG",  // replace
  database: "sql12809202",  // replace
  connectionLimit: 10
});

db.getConnection((err, connection) => {
  if (err) {
    console.log("❌ Database connection failed:", err);
  } else {
    console.log("✅ Database connected successfully!");
    connection.release();
  }
});

module.exports = db;
