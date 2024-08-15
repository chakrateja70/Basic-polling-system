import express from "express";
import {
  createPoll,
  deletePoll,
  votePoll,
  getAllPolls,
  getPollById,
  getPollsByInstituteEmail,
} from "../controllers/pollController.js";
import { verifyInstitute } from "../middlewares/verifyInstitute.js";

const pollRouter = express.Router();

// Create poll
pollRouter.post("/create", createPoll);

// Give vote
pollRouter.post("/vote/:pollId", votePoll);

// Delete poll by Id
pollRouter.delete("/:pollId", deletePoll);

// Get all polls
pollRouter.get("/getAll", verifyInstitute, getAllPolls);

// Get poll by pollId
pollRouter.get("/get/:pollId", getPollById);

// Get poll by institute email
pollRouter.get("/getPollsByIEmail/:instituteEmail", getPollsByInstituteEmail);

export default pollRouter;
