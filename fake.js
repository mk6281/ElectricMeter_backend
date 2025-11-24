const mysql = require("mysql2");

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "signup"
});

// FUNCTION: Generate fake positive & negative readings
function generateReading() {
    // Generates numbers from -100 to +100
    return Math.floor(Math.random() * 200) - 100;
}

// Insert data every 2 seconds
setInterval(() => {
    const value = generateReading();

    let imported = 0;
    let exported = 0;

    if (value >= 0) {
        imported = value;          // positive readings
    } else {
        exported = Math.abs(value); // negative readings modulated
    }

    db.query(
        "INSERT INTO energy_usage (imported, exported) VALUES (?, ?)",
        [imported, exported],
        (err) => {
            if (err) {
                console.error("DB Error:", err);
            } else {
                console.log("Inserted → Imported:", imported, "Exported:", exported);
            }
        }
    );

}, 2000);

console.log("Fake Arduino generator running...");
