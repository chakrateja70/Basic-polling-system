import { studentPool } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Get all students list
export const getAllStudents = async (req, res) => {
  try {
    const [rows] = await studentPool.query("SELECT * FROM students");
    if (rows.length === 0) {
      return res.status(404).send("No record found!");
    }
    res.status(200).json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

// Signup new student
export const signupStudent = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).send("Please provide name, email, and password.");
  }

  try {
    const [rows] = await studentPool.query(
      "SELECT * FROM students WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
      return res.status(409).send("Email already exists!");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await studentPool.query(
      "INSERT INTO students (name, email, password, phone) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, phone]
    );

    if (result.affectedRows === 1) {
      res.status(201).send("Student registered successfully!");
    } else {
      res.status(500).send("Error registering student.");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

// Login Student
export const loginStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await studentPool.query(
      "SELECT * FROM students WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).send("No student with this email!");
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).send("Wrong password!");
    }

    const token = jwt.sign(
      { email: user.email, name: user.name, role: "2" },
      process.env.JWT_SECRET
    );

    res.cookie("token", token);
    res.status(200).send("User logged in!");
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

// Update student
export const updateStudent = async (req, res) => {
  const { email } = req.params;
  const { name, oldPassword, newPassword, phone } = req.body;

  const updateValues = [];

  let sql = `UPDATE students SET`;

  // Check if name is provided
  if (name) {
    sql += ` name = ?,`;
    updateValues.push(name);
  }

  // Check if both oldPassword and newPassword are provided for password update
  if (newPassword && !oldPassword) {
    return res.status(400).send("Please enter oldPassword too!");
  }
  else if(!newPassword && oldPassword){
    return res.status(400).send("Please enter newPassword too!");
  }
  else if (oldPassword && newPassword) {
    try {
      const [rows] = await studentPool.query(
        "SELECT * FROM students WHERE email = ?",
        [email]
      );

      if (rows.length === 0) {
        return res.status(404).send("Student not found.");
      }

      const user = rows[0];
      const passwordMatch = await bcrypt.compare(oldPassword, user.password);

      if (!passwordMatch) {
        return res.status(401).send("Old password is incorrect.");
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash the new password
      sql += ` password = ?,`;
      updateValues.push(hashedPassword);
    } catch (error) {
      console.error(error);
      return res.status(500).send("Error updating password.");
    }
  }

  // Check if phone is provided
  if (phone !== undefined) {
    sql += ` phone = ?,`;
    updateValues.push(phone); // Push the plain phone value
  }

  // Remove the trailing comma from the SQL query
  sql = sql.slice(0, -1);

  // Add the WHERE clause to specify the email
  sql += ` WHERE email = ?`;
  updateValues.push(email);

  try {
    // Execute the query with parameter values
    const [result] = await studentPool.query(sql, updateValues);

    if (result.affectedRows === 1) {
      res.status(200).send(`Student with email ${email} updated successfully.`);
    } else {
      res.status(404).send(`Student with email ${email} not found.`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(`Error updating student with email ${email}.`);
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  const { email } = req.params;

  try {
    const [result] = await studentPool.query(
      "DELETE FROM students WHERE email = ?",
      [email]
    );

    if (result.affectedRows === 1) {
      res.status(200).send("Student deleted successfully!");
    } else {
      res.status(404).send("Student not found or no deletion occurred.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting student.");
  }
};

// Function to get remaining polls for logged-in student
export const getRemainingPolls = async (req, res) => {
  try {
    // Extract student information from token
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send("Unauthorized: No token provided.");
    }

    // Decode token to get student email
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    // Query to get remaining polls
    const [studentRows] = await studentPool.query(
      "SELECT remainingpolls FROM students WHERE email = ?",
      [email]
    );

    if (studentRows.length === 0) {
      return res.status(404).send("Student not found.");
    }

    // Extract remaining polls value
    const remainingPolls = studentRows[0].remainingpolls;

    // Return remaining polls count
    res.status(200).json({ remainingPolls });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching remaining polls.");
  }
};

// Get single student by email
export const getStudentByEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const [rows] = await studentPool.query(
      "SELECT * FROM students WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).send("Student not found.");
    }

    const student = rows[0];
    res.status(200).json(student);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching student.");
  }
};
