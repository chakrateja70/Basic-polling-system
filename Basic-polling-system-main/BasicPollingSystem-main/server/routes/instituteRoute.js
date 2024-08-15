import express from "express";
import {
  getAllInstitutes,
  loginInstitute,
  signupInstitute,
  updateInstitute,
  deleteInstitute,
  getInstituteByEmail,
} from "../controllers/instituteController.js";
import { verifyUser } from "../middlewares/verifyUser.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const instituteRouter = express.Router();

// Get all institutes
instituteRouter.get("/getAll", getAllInstitutes);

// Get institute by email Id
instituteRouter.get("/get/:email", getInstituteByEmail);

// Signup new institute
instituteRouter.post("/signup", signupInstitute);

// Login institute
instituteRouter.post("/login", loginInstitute);

// Update institute details by email
instituteRouter.put("/:email/update", verifyToken, verifyUser, updateInstitute);

// Delete institute by email
instituteRouter.delete(
  "/:email/delete",
  verifyToken,
  verifyUser,
  deleteInstitute
);

export default instituteRouter;
