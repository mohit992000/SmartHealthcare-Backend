const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const { verifyToken, authorizeRoles } = require("./authMiddleware");// Import middleware
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // Leave blank if no password
  database: "SmartHealthcare",
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL database!");
});

 
// Protected Routes - Add Here   

// Protect fetching patients - Only Admin and Doctor can access
app.get("/patients", verifyToken, authorizeRoles("Admin", "Doctor"), (req, res) => {
  db.query("SELECT * FROM Patients", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Protect adding a new doctor - Only Admin can access
app.post("/doctors", verifyToken, authorizeRoles("Admin"), (req, res) => {
  const { name, specialization, email, phone } = req.body;
  const sql = "INSERT INTO Doctors (name, specialization, email, phone) VALUES (?, ?, ?, ?)";
  const values = [name, specialization, email, phone];
  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Doctor added successfully!", doctor_id: result.insertId });
  });
});

// Protect deleting appointments - Only Admin can access
app.delete("/appointments/:id", verifyToken, authorizeRoles("Admin"), (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM Appointments WHERE appointment_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Appointment deleted successfully!" });
  });
});

// API Routes
app.get("/", (req, res) => {
  res.json({ message: "SmartHealthcare API is running!" });
});

// Start Server
const PORT = 7070;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Fetch all patients
app.get("/patients", (req, res) => {
  db.query("SELECT * FROM Patients", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Fetch all doctors
app.get("/doctors", (req, res) => {
  db.query("SELECT * FROM Doctors", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Fetch all appointments
app.get("/appointments", (req, res) => {
  db.query("SELECT * FROM Appointments", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Fetch all medical records
app.get("/medical-records", (req, res) => {
  db.query("SELECT * FROM MedicalRecords", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
// Add a new patient
app.post("/patients", (req, res) => {
  const { name, email, phone, date_of_birth, gender, address } = req.body;
  const sql = "INSERT INTO Patients (name, email, phone, date_of_birth, gender, address) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [name, email, phone, date_of_birth, gender, address], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Patient added successfully!", patient_id: result.insertId });
  });
});

// Add a new doctor
app.post("/doctors", (req, res) => {
  const { name, specialization, email, phone } = req.body;
  const sql = "INSERT INTO Doctors (name, specialization, email, phone) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, specialization, email, phone], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Doctor added successfully!", doctor_id: result.insertId });
  });
});

// Add a new appointment
app.post("/appointments", (req, res) => {
  const { patient_id, doctor_id, appointment_date, status } = req.body;
  const sql = "INSERT INTO Appointments (patient_id, doctor_id, appointment_date, status) VALUES (?, ?, ?, ?)";
  db.query(sql, [patient_id, doctor_id, appointment_date, status], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Appointment scheduled successfully!", appointment_id: result.insertId });
  });
});

// Add a new medical record
app.post("/medical-records", (req, res) => {
  const { patient_id, doctor_id, diagnosis, prescription } = req.body;
  const sql = "INSERT INTO MedicalRecords (patient_id, doctor_id, diagnosis, prescription) VALUES (?, ?, ?, ?)";
  db.query(sql, [patient_id, doctor_id, diagnosis, prescription], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Medical record added successfully!", record_id: result.insertId });
  });
});
// Update Entries (PUT)
app.put("/patients/:id", (req, res) => {
  const { id } = req.params;
  const { name, email, phone, date_of_birth, gender, address } = req.body;
  const sql = `UPDATE Patients SET name = ?, email = ?, phone = ?, date_of_birth = ?, gender = ?, address = ? WHERE patient_id = ?`;
  const values = [name, email, phone, date_of_birth, gender, address, id];
  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Patient updated successfully!" });
  });
});

app.put("/doctors/:id", (req, res) => {
  const { id } = req.params;
  const { name, specialization, email, phone } = req.body;

  // Correct SQL query
  const sql = `UPDATE Doctors SET name = ?, specialization = ?, email = ?, phone = ? WHERE doctor_id = ?`;
  const values = [name, specialization, email, phone, id];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Doctor not found." });
    }

    res.json({ message: "Doctor updated successfully!" });
  });
});

app.put("/appointments/:id", (req, res) => {
  const { id } = req.params;
  const { patient_id, doctor_id, appointment_date, status } = req.body;
  const sql = `UPDATE Appointments SET patient_id = ?, doctor_id = ?, appointment_date = ?, status = ? WHERE appointment_id = ?`;
  const values = [patient_id, doctor_id, appointment_date, status, id];
  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Appointment updated successfully!" });
  });
});

app.put("/medical-records/:id", (req, res) => {
  const { id } = req.params;
  const { patient_id, doctor_id, diagnosis, prescription } = req.body;
  const sql = `UPDATE MedicalRecords SET patient_id = ?, doctor_id = ?, diagnosis = ?, prescription = ? WHERE record_id = ?`;
  const values = [patient_id, doctor_id, diagnosis, prescription, id];
  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Medical record updated successfully!" });
  });
});

// Delete Entries (DELETE)
app.delete("/patients/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM Patients WHERE patient_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Patient deleted successfully!" });
  });
});

app.delete("/doctors/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM Doctors WHERE doctor_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Doctor deleted successfully!" });
  });
});

app.delete("/appointments/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM Appointments WHERE appointment_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Appointment deleted successfully!" });
  });
});

app.delete("/medical-records/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM MedicalRecords WHERE record_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Medical record deleted successfully!" });
  });
});

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔐 Secret for JWT (you can store this in a .env file for better security)
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ➡️ Register User (Signup)
app.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    const sql = `INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)`;
    db.query(sql, [name, email, hashedPassword, role || "Patient"], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ error: "User already exists" });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: "User registered successfully!" });
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ➡️ Login User (Signin)
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Check if user exists
  const sql = `SELECT * FROM Users WHERE email = ?`;
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = results[0];

    // Compare hashed passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = jwt.sign({ userId: user.user_id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token });
  });
});
