import express from "express";
import {
  getAllTeachers,
  loginTeacher,
  signupTeacher,
  updateTeacher,
  deleteTeacher,
  getRemainingPolls,
  getTeacherByEmail,
} from "../controllers/teachersController.js";
import { verifyUser } from "../middlewares/verifyUser.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const teacherRouter = express.Router();

// Get all teachers
teacherRouter.get("/getAll", getAllTeachers);

// Signup teacher
teacherRouter.post("/signup", signupTeacher);

// Login teacher
teacherRouter.post("/login", loginTeacher);

// Update teacher by email
teacherRouter.put("/:email/update", verifyToken, verifyUser, updateTeacher);

// Delete teacher by email
teacherRouter.delete("/:email/delete", verifyToken, verifyUser, deleteTeacher);

// Get remaining polls of teacher by email
teacherRouter.get(
  "/:email/remainingpolls",
  verifyToken,
  verifyUser,
  getRemainingPolls
);

// Get teacher by emailId
teacherRouter.get("/get/:email", verifyToken, verifyUser, getTeacherByEmail);

export default teacherRouter;
