import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { studentPool } from "./config/db.js";
import "dotenv/config";
import studentRouter from "./routes/studentsRoutes.js";
import teacherRouter from "./routes/teachersRoute.js";
import instituteRouter from "./routes/instituteRoute.js";
import pollRouter from "./routes/pollRoute.js";
import { verifyToken } from "./middlewares/verifyToken.js";

const app = express();

//deploy in vercel
app.use(cors({
  origin: ["https://basic-polling-system-client.vercel.app", "http://localhost:3000"],
  methods: ["POST", "GET"],
  credentials: false,
}))

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use("/api/student", studentRouter);
app.use("/api/teacher", teacherRouter);
app.use("/api/institute", instituteRouter);
app.use("/api/poll", verifyToken, pollRouter);

// Routes

app.get("/test", (req, res) => {
  res.status(200).send("Hey from server!");
});

// Conditionally listen
studentPool
  .query("SELECT 1")
  .then(() => {
    console.log("MySql DB connected!");

    app.listen(process.env.PORT || 8000 , () => {
      console.log(`Server started at port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
