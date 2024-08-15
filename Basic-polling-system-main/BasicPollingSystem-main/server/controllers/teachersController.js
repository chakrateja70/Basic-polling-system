import { teacherPool } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Get all teachers list
export const getAllTeachers = async (req, res) => {
  try {
    const [rows] = await teacherPool.query("SELECT * FROM teachers");
    if (rows.length === 0) {
      return res.status(404).send("No record found!");
    }
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching teachers.");
  }
};

// Signup new Teacher
export const signupTeacher = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send("Please provide name, email, and password.");
  }

  try {
    const [rows] = await teacherPool.query(
      "SELECT * FROM teachers WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
      return res.status(409).send("Email already exists!"); // Use a more appropriate status code
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await teacherPool.query(
      "INSERT INTO teachers (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    if (result.affectedRows === 1) {
      res.status(201).send("Teacher registered successfully!");
    } else {
      res.status(500).send("Error registering teacher.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error registering teacher.");
  }
};

// Login teacher
export const loginTeacher = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await teacherPool.query(
      "SELECT * FROM teachers WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).send("No teacher with this email!");
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).send("Wrong password!");
    }

    const token = jwt.sign(
      { email: user.email, name: user.name, role: "1" },
      process.env.JWT_SECRET
    );

    res.cookie("token", token);
    res.status(200).send("Teacher logged in!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error logging in teacher.");
  }
};

// Update teacher
export const updateTeacher = async (req, res) => {
  const { email } = req.params;
  const { name, password, phone } = req.body;

  // Check if at least one field to update is provided
  if (!name && !password && !phone) {
    return res
      .status(400)
      .send(
        "Please provide at least one field to update (name, password, phone)."
      );
  }

  try {
    // Fetch existing teacher data
    const [rows] = await teacherPool.query(
      "SELECT * FROM teachers WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).send("Teacher not found.");
    }

    const teacher = rows[0];

    let hashedPassword = teacher.password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Update fields in the database
    const [result] = await teacherPool.query(
      "UPDATE teachers SET name = ?, password = ?, phone = ? WHERE email = ?",
      [name || teacher.name, hashedPassword, phone || teacher.phone, email]
    );

    if (result.affectedRows === 1) {
      res.status(200).send("Teacher updated successfully!");
    } else {
      res.status(500).send("Error updating teacher.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating teacher.");
  }
};

// Delete teacher
export const deleteTeacher = async (req, res) => {
  const { email } = req.params;

  try {
    // Check if teacher exists
    const [rows] = await teacherPool.query(
      "SELECT * FROM teachers WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).send("Teacher not found.");
    }

    // Delete teacher from database
    const [result] = await teacherPool.query(
      "DELETE FROM teachers WHERE email = ?",
      [email]
    );

    if (result.affectedRows === 1) {
      res.status(200).send("Teacher deleted successfully!");
    } else {
      res.status(500).send("Error deleting teacher.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting teacher.");
  }
};

// Get remaining polls for logged-in teacher
export const getRemainingPolls = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send("Unauthorized: No token provided.");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    // Query to get remaining polls
    const [teacherRows] = await teacherPool.query(
      "SELECT remainingpolls FROM teachers WHERE email = ?",
      [email]
    );

    if (teacherRows.length === 0) {
      return res.status(404).send("Teacher not found.");
    }

    // Extract remaining polls value
    const remainingPolls = teacherRows[0].remainingpolls;

    res.status(200).json({ remainingPolls });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching remaining polls.");
  }
};

// Get one teacher by email
export const getTeacherByEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const [rows] = await teacherPool.query(
      "SELECT * FROM teachers WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).send("Teacher not found.");
    }

    const teacher = rows[0];
    res.status(200).json(teacher);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching teacher.");
  }
};
