import { pollsPool, studentPool, teacherPool } from "../config/db.js";
import jwt from "jsonwebtoken";

// Create poll
export const createPoll = async (req, res) => {
  const { name, options, forTeacher, forStudent } = req.body;

  const token = req.cookies.token;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "0") {
      return res
        .status(403)
        .send("Unauthorized. Only institutes can create polls.");
    }

    const instituteName = decoded.name;
    const instituteEmail = decoded.email;

    const padToTwoDigits = (num) => num.toString().padStart(2, "0");
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${padToTwoDigits(
      currentDate.getMonth() + 1
    )}-${padToTwoDigits(currentDate.getDate())} ${padToTwoDigits(
      currentDate.getHours()
    )}:${padToTwoDigits(currentDate.getMinutes())}:${padToTwoDigits(
      currentDate.getSeconds()
    )}`;

    const pollConn = await pollsPool.getConnection();
    const [result] = await pollConn.query(
      `INSERT INTO polls (name, date, options, forTeacher, forStudent, totalTeacher, totalStudent, win, institutename, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
      [
        name,
        formattedDate,
        JSON.stringify(options),
        forTeacher,
        forStudent,
        0,
        0,
        JSON.stringify({}),
        instituteName,
        instituteEmail,
      ]
    );
    const pollId = result.insertId;
    pollConn.release();

    // Update remainingpolls for teachers if forTeacher is 1
    if (forTeacher === 1) {
      const updateTeachersQuery = `
                UPDATE teachers 
                SET remainingpolls = JSON_ARRAY_APPEND(COALESCE(remainingpolls, '[]'), '$', ?)`;
      await teacherPool.query(updateTeachersQuery, [pollId]);
    }

    // Update remainingpolls for students if forStudent is 1
    if (forStudent === 1) {
      const updateStudentsQuery = `
                UPDATE students 
                SET remainingpolls = JSON_ARRAY_APPEND(COALESCE(remainingpolls, '[]'), '$', ?)`;
      await studentPool.query(updateStudentsQuery, [pollId]);
    }

    res.send("Poll created successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating poll.");
  }
};

// Give vote
export const votePoll = async (req, res) => {
  // console.log("apiHit");
  const { pollId } = req.params;
  // console.log("pollID\n", pollId);
  const { selectedOption } = req.body;

  const token = req.cookies.token;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if decoded token has the required role (1 for teacher, 2 for student)
    if (decoded.role !== "1" && decoded.role !== "2") {
      return res
        .status(403)
        .send("Unauthorized. Only students or teachers can vote.");
    }

    // Determine userType based on role
    const userType = decoded.role === "1" ? "teacher" : "student";
    // console.log("userType\n", userType);
    const userId = decoded.email; // Email is the unique identifier
    // console.log("userId\n", userId);

    // Fetch current poll data
    const pollConn = await pollsPool.getConnection();
    const [results] = await pollConn.query(
      `SELECT options, totalStudent, totalTeacher FROM polls WHERE id = ?`,
      [pollId]
    );

    // console.log("results\n", results);
    // console.log("userType\n", userType);
    if (results.length == 0) {
      pollConn.release();
      // console.log("userType\n", userType);

      // const pollIdStr = pollId.toString();

      // Check and remove pollId from remainingpolls for the logged-in teacher
      // console.log("userType\n", userType);
      if (userType === "teacher") {
        // console.log("teacherHIT");
        const fetchTeacherQuery = `SELECT remainingpolls FROM teachers WHERE email = ?`;
        const [teacherResults] = await teacherPool.query(fetchTeacherQuery, [
          userId,
        ]);

        if (teacherResults.length > 0) {
          const remainingpolls = teacherResults[0].remainingpolls || [];
          // console.log("remainingpolls\n", remainingpolls, pollId);
          // if (remainingpolls.includes(pollId)) {
          const updatedRemainingpolls = remainingpolls.filter(
            (id) => id != pollId
          );
          // console.log("updatedRemainingpolls\n", updatedRemainingpolls);
          const updateTeacherQuery = `
              UPDATE teachers 
              SET remainingpolls = ?
              WHERE email = ?`;
          await teacherPool.query(updateTeacherQuery, [
            JSON.stringify(updatedRemainingpolls),
            userId,
          ]);
          // }
        }
      }

      // Check and remove pollId from remainingpolls for the logged-in student
      if (userType === "student") {
        // console.log("studentHit");
        const fetchStudentQuery = `SELECT remainingpolls FROM students WHERE email = ?`;
        const [studentResults] = await studentPool.query(fetchStudentQuery, [
          userId,
        ]);

        // console.log("studentResults\n", studentResults);

        if (studentResults.length > 0) {
          const remainingpolls = studentResults[0].remainingpolls || [];
          console.log("remainingpolls\n", remainingpolls, pollId);
          // if (remainingpolls.includes(pollIdStr)) {
          const updatedRemainingpolls = remainingpolls.filter(
            (id) => id != pollId
          );
          console.log("updatedRemainingpolls\n", updatedRemainingpolls);
          const updateStudentQuery = `
              UPDATE students 
              SET remainingpolls = ?
              WHERE email = ?`;
          await studentPool.query(updateStudentQuery, [
            JSON.stringify(updatedRemainingpolls),
            userId,
          ]);
          // }
        }
      }

      return res.status(404).send("Poll not found.");
    }

    const poll = results[0];

    let options =
      typeof poll.options === "string"
        ? JSON.parse(poll.options)
        : poll.options;
    let totalStudent = parseInt(poll.totalStudent);
    let totalTeacher = parseInt(poll.totalTeacher);

    // Increment vote count based on user type
    if (userType === "student") {
      totalStudent += 1;
    } else if (userType === "teacher") {
      totalTeacher += 1;
    }

    // Update options with selected vote
    options[selectedOption] = (options[selectedOption] || 0) + 1;

    // Determine winning option or tie
    let maxVotes = 0;
    let winningOptions = [];

    for (let [option, votes] of Object.entries(options)) {
      if (votes > maxVotes) {
        maxVotes = votes;
        winningOptions = [option];
      } else if (votes === maxVotes) {
        winningOptions.push(option);
      }
    }

    // Construct winLabel based on winning options or tie
    let winLabel = "";
    if (winningOptions.length === 1) {
      winLabel = winningOptions[0];
    } else {
      winLabel = `tie:${winningOptions.join(",")}`;
    }

    // Update polls table with new vote counts and winLabel
    await pollConn.query(
      `UPDATE polls SET options = ?, totalStudent = ?, totalTeacher = ?, win = ? WHERE id = ?`,
      [
        JSON.stringify(options),
        totalStudent.toString(),
        totalTeacher.toString(),
        JSON.stringify(winLabel),
        pollId,
      ]
    );

    // Release connection
    pollConn.release();

    // Remove pollId from remainingpolls for teachers if userType is teacher
    if (userType === "teacher") {
      // console.log("userType\n", userType);
      const fetchTeachersQuery = `SELECT remainingpolls FROM teachers WHERE email = ?`;
      const [teachersResults] = await teacherPool.query(fetchTeachersQuery, [
        userId,
      ]);

      // console.log("teachersResults\n", teachersResults);

      if (teachersResults.length === 0) {
        return res.status(404).send("Teacher not found.");
      }

      const remainingpolls = teachersResults[0].remainingpolls || [];

      const updatedRemainingpolls = remainingpolls.filter((id) => id != pollId);

      const updateTeachersQuery = `
              UPDATE teachers 
              SET remainingpolls = ?
              WHERE email = ?`;
      await teacherPool.query(updateTeachersQuery, [
        JSON.stringify(updatedRemainingpolls),
        userId,
      ]);
    }

    // Remove pollId from remainingpolls for students if userType is student
    if (userType === "student") {
      const fetchStudentsQuery = `SELECT remainingpolls FROM students WHERE email = ?`;
      const [studentsResults] = await studentPool.query(fetchStudentsQuery, [
        userId,
      ]);

      // console.log(studentsResults[0]);

      if (studentsResults.length === 0) {
        return res.status(404).send("Student not found.");
      }

      const remainingpolls = studentsResults[0].remainingpolls || [];

      // console.log("remainingpolls\n", remainingpolls);

      const updatedRemainingpolls = remainingpolls.filter((id) => id != pollId);

      // console.log("updatedRemainingpolls\n", updatedRemainingpolls);

      const updateStudentsQuery = `
              UPDATE students 
              SET remainingpolls = ?
              WHERE email = ?`;
      await studentPool.query(updateStudentsQuery, [
        JSON.stringify(updatedRemainingpolls),
        userId,
      ]);
    }

    res.send("Vote submitted successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error submitting vote.");
  }
};

// Delete poll by Id
export const deletePoll = async (req, res) => {
  const { pollId } = req.params;

  try {
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);

    // Check if decoded token has the required role (0 for institute)
    if (decoded.role !== "0") {
      return res
        .status(403)
        .send("Unauthorized. Only institutes can delete polls.");
    }

    // Delete poll from polls table
    const pollConn = await pollsPool.getConnection();
    await pollConn.query("DELETE FROM polls WHERE id = ?", [pollId]);
    pollConn.release();

    res.send(`Poll with ID ${pollId} deleted successfully.`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting poll.");
  }
};

// Get all polls
export const getAllPolls = async (req, res) => {
  try {
    const pollConn = await pollsPool.getConnection();
    const [results] = await pollConn.query("SELECT * FROM polls");
    pollConn.release();

    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching polls.");
  }
};

// Get poll by pollId
export const getPollById = async (req, res) => {
  const { pollId } = req.params;

  try {
    const pollConn = await pollsPool.getConnection();
    const [results] = await pollConn.query(`SELECT * FROM polls WHERE id = ?`, [
      pollId,
    ]);

    pollConn.release();

    if (results.length === 0) {
      return res.status(404).send("Poll not found.");
    }

    res.json(results[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving poll details.");
  }
};

// Get poll by institute email
export const getPollsByInstituteEmail = async (req, res) => {
  const { instituteEmail } = req.params;
  // console.log("------->instituteEmail\n", instituteEmail);

  try {
    const pollConn = await pollsPool.getConnection();
    const [results] = await pollConn.query(
      `SELECT * FROM polls WHERE email = ?`,
      [instituteEmail]
    );
    pollConn.release();

    if (results.length === 0) {
      return res
        .status(404)
        .send("No polls found for the specified institute.");
    }

    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching polls.");
  }
};
