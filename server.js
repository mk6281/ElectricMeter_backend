// const express = require("express");
// const mysql = require("mysql");
// const cors = require("cors");
// const axios = require("axios");

// const app = express();
// app.use(express.json());
// app.use(cors());

// const db = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "",
//     database: "signup"
// });

// // ----------------- SIGNUP -----------------
// app.post('/signup', (req, res) => {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password) return res.status(400).json({ status: "Error", message: "Missing fields" });

//     const sql = "INSERT INTO login (`name`, `email`, `password`) VALUES (?, ?, ?)";
//     db.query(sql, [name, email, password], (err, data) => {
//         if (err) return res.status(500).json({ status: "Error", message: err });

//         const customerId = data.insertId;
//         const tableName = `customer_${customerId}`;
//         const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (
//             id INT PRIMARY KEY AUTO_INCREMENT,
//             date DATE NOT NULL,
//             imported FLOAT DEFAULT 0,
//             exported FLOAT DEFAULT 0
//         )`;

//         db.query(createTableSQL, (err2) => {
//             if (err2) return res.status(500).json({ status: "Error", message: err2 });
//             return res.json({ status: "Success", userId: customerId });
//         });
//     });
// });

// // ----------------- LOGIN -----------------
// app.post('/login', (req, res) => {
//     const sql = "SELECT * FROM login WHERE `email` = ? AND `password` = ?";
//     db.query(sql, [req.body.email, req.body.password], (err, data) => {
//         if (err) return res.json({ status: "Error" });
//         if (data.length > 0) return res.json({ status: "Success", user: data[0] });
//         return res.json({ status: "Failed" });
//     });
// });

// // ----------------- GET USER -----------------
// app.get('/getUser/:id', (req, res) => {
//     const userId = req.params.id;
//     const sql = "SELECT * FROM login WHERE id = ?";
//     db.query(sql, [userId], (err, data) => {
//         if (err) return res.json({ status: "Error" });
//         if (data.length > 0) return res.json({ status: "Found", user: data[0] });
//         return res.json({ status: "Not Found" });
//     });
// });

// // ----------------- USAGE -----------------
// app.get('/usage/:customerId', (req, res) => {
//     const customerId = req.params.customerId;
//     const tableName = `customer_${customerId}`;
//     const sql = `SELECT * FROM ${tableName} ORDER BY date ASC`;

//     db.query(sql, (err, data) => {
//         if (err) return res.json({ status: "Error", data: [] });
//         const fixedData = data.map(row => ({
//             date: row.date,
//             imported: parseFloat(row.imported),
//             exported: parseFloat(row.exported),
//         }));
//         res.json({ status: "OK", data: fixedData });
//     });
// });

// // ----------------- DEVICE REGISTRATION -----------------
// app.get('/registerDevice', (req, res) => {
//     const { name, ip } = req.query;
//     if (!name || !ip) return res.status(400).json({ status: "Error", message: "Missing name or ip" });

//     const sql = "UPDATE login SET device_ip = ? WHERE name = ?";
//     db.query(sql, [ip, name], (err, result) => {
//         if (err) return res.status(500).json({ status: "Error", message: err });
//         if (result.affectedRows === 0) return res.status(404).json({ status: "Error", message: "User not found" });
//         res.json({ status: "Success", message: `Device ${name} registered with IP ${ip}` });
//     });
// });

// // ----------------- TOGGLE DEVICE -----------------
// app.post('/toggleDevice', (req, res) => {
//     const { customerId, state } = req.body;
//     if (!customerId || state === undefined) return res.status(400).json({ status: "Error", message: "Missing customerId or state" });

//     const sql = "SELECT device_ip FROM login WHERE id = ?";
//     db.query(sql, [customerId], (err, result) => {
//         if (err) return res.status(500).json({ status: "Error", message: err });
//         if (result.length === 0 || !result[0].device_ip) return res.status(404).json({ status: "Error", message: "Device not registered" });

//         const deviceIp = result[0].device_ip;
//         axios.post(`http://${deviceIp}/toggle`, { state })
//             .then(() => res.json({ status: "Success", message: `Signal sent to device ${deviceIp}` }))
//             .catch(err2 => res.status(500).json({ status: "Error", message: err2.message }));
//     });
// });

// // ----------------- ENERGY DATA -----------------
// app.get('/energy', (req, res) => {
//     const { name, energy } = req.query;
//     if (!name || isNaN(parseFloat(energy))) return res.status(400).json({ status: "Error", message: "Missing name or energy" });

//     const findUserSQL = "SELECT id FROM login WHERE name = ?";
//     db.query(findUserSQL, [name], (err, result) => {
//         if (err) return res.status(500).json({ status: "Error", message: err });
//         if (result.length === 0) return res.status(404).json({ status: "Error", message: "User not found" });

//         const customerId = result[0].id;
//         const tableName = `customer_${customerId}`;
//         const imported = parseFloat(energy) >= 0 ? parseFloat(energy) : 0;
//         const exported = parseFloat(energy) < 0 ? Math.abs(parseFloat(energy)) : 0;

//         const insertSQL = `INSERT INTO ${tableName} (date, imported, exported) VALUES (CURDATE(), ?, ?)`;
//         db.query(insertSQL, [imported, exported], (err2) => {
//             if (err2) return res.status(500).json({ status: "Error", message: err2 });
//             res.json({ status: "Success", customerId, table: tableName, imported, exported });
//         });
//     });
// });

// app.listen(8081, () => {
//     console.log("Server running on port 8081");
// });

// // In-memory state of each customer
// const customerStates = {}; // { "surya": 1 }

// app.post('/toggle/:name', (req, res) => {
//     const name = req.params.name;
//     const state = req.body.state; // 0 or 1

//     if (typeof state !== "number" || ![0,1].includes(state)) {
//         return res.status(400).json({ status: "Error", message: "Invalid state" });
//     }

//     // Save state in memory
//     customerStates[name] = state;

//     // Optionally: retrieve device IP from DB and send HTTP request to device
//     db.query("SELECT device_ip FROM login WHERE name = ?", [name], (err, result) => {
//         if (err) {
//             console.log("SQL Error:", err);
//             return res.status(500).json({ status: "Error", message: err });
//         }

//         if (result.length === 0) {
//             return res.status(404).json({ status: "Error", message: "User not found" });
//         }

//         const deviceIp = result[0].device_ip;
//         console.log(`Would send state ${state} to device at IP: ${deviceIp}`);
//         // Here you could actually send a POST request to the Arduino:
//         // axios.post(`http://${deviceIp}/toggle`, { state });

//         return res.json({ status: "Success", state, ip: deviceIp || null });
//     });
// });

// // Optional: helper route to get current state
// app.get('/toggle/:name', (req, res) => {
//     const name = req.params.name;
//     const state = customerStates[name] || 0;
//     res.json({ status: "Success", state });
// });

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

// ====================== DATABASE CONNECTION ======================
const db = mysql.createPool({
  host: "30v796.h.filess.io",   // replace
  user: "electric_meter_dividebad",      // replace
  password: "f97a388ff09a8b79a24b4c929227500fc8dcde19",  // replace
  database: "electric_meter_dividebad",  // replace
  port: 61032,
  connectionLimit: 10
});

// const db = mysql.createPool({
//   host: "sql12.freesqldatabase.com",   // replace
//   user: "sql12809202",      // replace
//   password: "whTkDvTpMG",  // replace
//   database: "sql12809202",  // replace
//   port: 3306,
//   connectionLimit: 10
// });

// Test connection
db.getConnection((err, connection) => {
    if (err) {
        console.log("❌ DB Connection Error:", err);
    } else {
        console.log("✅ Connected to InfinityFree MySQL");
        connection.release();
    }
});

// ====================== SIGNUP ======================
// app.post('/signup', (req, res) => {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password)
//         return res.status(400).json({ status: "Error", message: "Missing fields" });

//     const sql = "INSERT INTO login (`name`, `email`, `password`) VALUES (?, ?, ?)";
//     db.query(sql, [name, email, password], (err, data) => {
//         if (err) return res.status(500).json({ status: "Error", message: err });

//         const customerId = data.insertId;
//         const tableName = `customer_${customerId}`;

//         const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (
//             id INT PRIMARY KEY AUTO_INCREMENT,
//             date DATE NOT NULL,
//             imported FLOAT DEFAULT 0,
//             exported FLOAT DEFAULT 0
//         )`;

//         db.query(createTableSQL, (err2) => {
//             if (err2) return res.status(500).json({ status: "Error", message: err2 });
//             return res.json({ status: "Success", userId: customerId });
//         });
//     });
// });

app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;

    const sql = "INSERT INTO login (`name`, `email`, `password`) VALUES (?, ?, ?)";
    db.query(sql, [name, email, password], (err, data) => {

        if (err) {
            console.error("Signup INSERT error:", err);
            return res.status(500).json({ status: "Error", message: err });
        }

        const customerId = data.insertId;
        const tableName = `customer_${customerId}`;

        const createTableSQL = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
        id INT NOT NULL AUTO_INCREMENT,
        date DATETIME NOT NULL,
        imported FLOAT DEFAULT 0,
        exported FLOAT DEFAULT 0,
        PRIMARY KEY (id)
    )
`;


        db.query(createTableSQL, (err2) => {
            if (err2) {
                console.error("Table creation error:", err2);
                return res.status(500).json({ status: "Error", message: err2 });
            }

            return res.json({ status: "Success", userId: customerId });
        });
    });
});



// ====================== LOGIN ======================
app.post('/login', (req, res) => {
    const sql = "SELECT * FROM login WHERE `email` = ? AND `password` = ?";
    db.query(sql, [req.body.email, req.body.password], (err, data) => {
        if (err) return res.json({ status: "Error" });
        if (data.length > 0) return res.json({ status: "Success", user: data[0] });
        return res.json({ status: "Failed" });
    });
});

app.post('/customers', (req, res) => {
    const sql = "SELECT * FROM customers WHERE `email` = ? AND `password` = ?";

    db.query(sql, [req.body.email, req.body.password], (err, data) => {
        if (err) {
            return res.json({ status: "Error" });
        }
        if (data.length > 0) {
            return res.json({
                status: "Success",
                user: data[0]   // return entire user details
            });
        } else {
            console.log("Login failed for email:", req.body.email);
            return res.json({ status: "Failed" });
        }
    });
});

// ====================== GET USER ======================
app.get('/getUser/:id', (req, res) => {
    const sql = "SELECT * FROM login WHERE id = ?";
    db.query(sql, [req.params.id], (err, data) => {
        if (err) return res.json({ status: "Error" });
        if (data.length > 0) return res.json({ status: "Found", user: data[0] });
        return res.json({ status: "Not Found" });
    });
});

// ====================== USAGE ======================
app.get('/usage/:customerId', (req, res) => {
    const customerId = req.params.customerId;
    const tableName = `customer_${customerId}`;
    const sql = `SELECT * FROM ${tableName} ORDER BY date ASC`;

    db.query(sql, (err, data) => {
        if (err) return res.json({ status: "Error", data: [] });

        const fixedData = data.map(row => ({
            date: row.date,
            imported: parseFloat(row.imported),
            exported: parseFloat(row.exported)
        }));

        res.json({ status: "OK", data: fixedData });
    });
});

// ====================== REGISTER DEVICE ======================
app.get('/registerDevice', (req, res) => {
    const { name, ip } = req.query;
    if (!name || !ip)
        return res.status(400).json({ status: "Error", message: "Missing name or ip" });

    const sql = "UPDATE login SET device_ip = ? WHERE name = ?";
    db.query(sql, [ip, name], (err, result) => {
        if (err) return res.status(500).json({ status: "Error", message: err });
        if (result.affectedRows === 0)
            return res.status(404).json({ status: "Error", message: "User not found" });

        res.json({ status: "Success", message: `Device ${name} registered with IP ${ip}` });
    });
});

// ====================== TOGGLE DEVICE ======================
// app.post('/toggleDevice', (req, res) => {
//     const { customerId, state } = req.body;

//     if (!customerId || state === undefined)
//         return res.status(400).json({ status: "Error", message: "Missing customerId or state" });

//     const sql = "SELECT device_ip FROM login WHERE id = ?";
//     db.query(sql, [customerId], (err, result) => {
//         if (err) return res.status(500).json({ status: "Error", message: err });
//         if (result.length === 0 || !result[0].device_ip)
//             return res.status(404).json({ status: "Error", message: "Device not registered" });

//         const deviceIp = result[0].device_ip;

//         axios.post(`http://${deviceIp}/toggle`, { state })
//             .then(() => res.json({ status: "Success", message: `Signal sent to device ${deviceIp}` }))
//             .catch(err2 => res.status(500).json({ status: "Error", message: err2.message }));
//     });
// });
app.post('/toggleDevice', (req, res) => {
    const { customerId, state } = req.body;

    if (!customerId || state === undefined)
        return res.status(400).json({ status: "Error", message: "Missing customerId or state" });

    // Update state in customerStates
    const nameSql = "SELECT name FROM login WHERE id = ?";
    db.query(nameSql, [customerId], (err, result) => {
        if (err) return res.status(500).json({ status: "Error", message: err });
        if (result.length === 0)
            return res.status(404).json({ status: "Error", message: "User not found" });

        const name = result[0].name;
        customerStates[name] = state;  // <-- THIS LINE IS CRUCIAL

        res.json({ status: "Success", message: `Toggle state updated for ${name}` });
    });
});

// ====================== ENERGY DATA ======================
app.get('/energy', (req, res) => {
    const { name, energy } = req.query;

    if (!name || isNaN(parseFloat(energy)))
        return res.status(400).json({ status: "Error", message: "Missing name or energy" });

    const findUserSQL = "SELECT id FROM login WHERE name = ?";
    db.query(findUserSQL, [name], (err, result) => {
        if (err) return res.status(500).json({ status: "Error", message: err });
        if (result.length === 0) return res.status(404).json({ status: "Error", message: "User not found" });

        const customerId = result[0].id;
        const tableName = `customer_${customerId}`;
        const imported = parseFloat(energy) >= 0 ? parseFloat(energy) : 0;
        const exported = parseFloat(energy) < 0 ? Math.abs(parseFloat(energy)) : 0;
      
const insertSQL =
    `INSERT INTO ${tableName} (date, imported, exported) VALUES (NOW(), ?, ?)`;
        db.query(insertSQL, [imported, exported], (err2) => {
            if (err2) return res.status(500).json({ status: "Error", message: err2 });
            res.json({ status: "Success", customerId, table: tableName, imported, exported });
        });
    });
});

// ====================== LOCAL DEVICE TOGGLE STATE ======================
const customerStates = {};

app.post('/toggle/:name', (req, res) => {
    const name = req.params.name;
    const state = req.body.state;

    if (typeof state !== "number" || ![0, 1].includes(state))
        return res.status(400).json({ status: "Error", message: "Invalid state" });

    customerStates[name] = state;

    db.query("SELECT device_ip FROM login WHERE name = ?", [name], (err, result) => {
        if (err) return res.status(500).json({ status: "Error", message: err });

        if (result.length === 0)
            return res.status(404).json({ status: "Error", message: "User not found" });

        const deviceIp = result[0].device_ip;
        console.log(`Would send state ${state} to device at IP: ${deviceIp}`);

        return res.json({ status: "Success", state, ip: deviceIp || null });
    });
});

app.get('/toggle/:name', (req, res) => {
    const name = req.params.name;
    const state = customerStates[name] || 0;
    res.json({ status: "Success", state });
});



// ====================== START SERVER ======================
app.listen(8081, () => {
    console.log("🚀 Server running on port 8081");
});
