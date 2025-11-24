const mysql = require('mysql2');

const db = mysql.createPool({
  host: "sql100.infinityfree.com",   // replace
  user: "if0_40496596",      // replace
  password: "Z4FkVgUKRVCT",  // replace
  database: "if0_40496596_sign_up",  // replace
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
