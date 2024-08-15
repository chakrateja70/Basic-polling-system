import express from "express";
import {
  getAllStudents,
  loginStudent,
  signupStudent,
  updateStudent,
  deleteStudent,
  getRemainingPolls,
  getStudentByEmail,
} from "../controllers/studentController.js";
import { verifyUser } from "../middlewares/verifyUser.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const studentRouter = express.Router();

// Get all students
studentRouter.get("/getAll", getAllStudents);

// Signup student
studentRouter.post("/signup", signupStudent);

// Login student
studentRouter.post("/login", loginStudent);

// Update student by email
studentRouter.put("/:email/update", verifyToken, verifyUser, updateStudent);

// Delete student by email
studentRouter.delete("/:email/delete", verifyToken, verifyUser, deleteStudent);

// get single student by email
studentRouter.get("/get/:email", verifyToken, verifyUser, getStudentByEmail);

// Get remaining polls of student by email
studentRouter.get(
  "/:email/remainingpolls",
  verifyToken,
  verifyUser,
  getRemainingPolls
);

export default studentRouter;
