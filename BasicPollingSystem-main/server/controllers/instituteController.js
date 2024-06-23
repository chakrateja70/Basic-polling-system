import { institutePool } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Get all institutes list
export const getAllInstitutes = async (req, res) => {
  try {
    const [rows] = await institutePool.query("SELECT * FROM institutes");
    if (rows.length === 0) {
      return res.status(404).send("No record found!");
    }
    res.status(200).json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

// Signup new institute
export const signupInstitute = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send("Please provide name, email, and password.");
  }

  try {
    const [rows] = await institutePool.query(
      "SELECT * FROM institutes WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
      return res.status(409).send("Email already exists!"); // Use a more appropriate status code
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await institutePool.query(
      "INSERT INTO institutes (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    if (result.affectedRows === 1) {
      res.status(201).send("Institute registered successfully!");
    } else {
      res.status(500).send("Error registering institute.");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

// Login institute
export const loginInstitute = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await institutePool.query(
      "SELECT * FROM institutes WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).send("No institute with this email!");
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).send("Wrong password!");
    }

    const token = jwt.sign(
      { email: user.email, name: user.name, role: "0" },
      process.env.JWT_SECRET
    );

    res.cookie("token", token);
    res.status(200).send("Institute logged in!");
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

// Update institute details
export const updateInstitute = async (req, res) => {
  const { email } = req.params;
  const { name, password, phone } = req.body;

  try {
    let updateFields = [];
    let queryParams = [];

    if (name) {
      updateFields.push("name = ?");
      queryParams.push(name);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push("password = ?");
      queryParams.push(hashedPassword);
    }

    if (phone) {
      updateFields.push("phone = ?");
      queryParams.push(phone);
    }

    if (updateFields.length === 0) {
      return res
        .status(400)
        .send("Please provide name, password, or phone to update.");
    }

    queryParams.push(email);

    const updateQuery = `UPDATE institutes SET ${updateFields.join(
      ", "
    )} WHERE email = ?`;

    const [result] = await institutePool.query(updateQuery, queryParams);

    if (result.affectedRows === 1) {
      res.status(200).send("Institute updated successfully!");
    } else {
      res.status(404).send("Institute not found or no changes applied.");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error updating institute.");
  }
};

// Delete institute
export const deleteInstitute = async (req, res) => {
  const { email } = req.params;

  try {
    const [rows] = await institutePool.query(
      "SELECT * FROM institutes WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).send("Institute not found.");
    }

    const [result] = await institutePool.query(
      "DELETE FROM institutes WHERE email = ?",
      [email]
    );

    if (result.affectedRows === 1) {
      res.status(200).send("Institute deleted successfully!");
    } else {
      res.status(500).send("Error deleting institute.");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error deleting institute.");
  }
};

// Get institute by email
export const getInstituteByEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const [rows] = await institutePool.query(
      "SELECT * FROM institutes WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).send("Institute not found.");
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
