import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import 'bootstrap/dist/css/bootstrap.min.css';

export const CreatePollPage = () => {
  const [pollName, setPollName] = useState("");
  const [options, setOptions] = useState([]);
  const [forTeacher, setForTeacher] = useState(true);
  const [forStudent, setForStudent] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      navigate("/");
      alert("Please login!");
      return;
    }
  }, [navigate]);

  const handleOptionChange = (id, value) => {
    setOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.id === id ? { ...option, text: value } : option
      )
    );
  };

  const addOption = () => {
    setOptions((prevOptions) => [...prevOptions, { id: Date.now(), text: "" }]);
  };

  const handleCreatePoll = async () => {
    if (!pollName || options.length === 0) {
      alert("Poll Name and Options are required!");
      return;
    }

    if (!forTeacher && !forStudent) {
      alert("No role selected! Please select at least one role.");
      return;
    }

    const optionsObject = options.reduce((acc, option) => {
      acc[option.text] = 0;
      return acc;
    }, {});

    try {
      const response = await axios.post("/api/poll/create", {
        name: pollName,
        options: optionsObject,
        forTeacher: forTeacher ? 1 : 0,
        forStudent: forStudent ? 1 : 0,
      });

      if (response.status === 200) {
        alert("Poll created successfully!");
        navigate(-1);
      }
    } catch (error) {
      alert("Error occurred!");
      console.error("Error creating poll", error);
    }
  };

  return (
    <div className="container mt-5" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <div className="p-5 bg-white rounded-lg shadow-lg">
        <h1 className="text-center mb-5" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Create Poll</h1>
        <div className="mb-4">
          <label htmlFor="pollName" className="form-label">Poll Name</label>
          <input
            type="text"
            id="pollName"
            className="form-control"
            value={pollName}
            onChange={(e) => setPollName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="form-label mr-5">Options</label>
          {options.map((option) => (
            <div key={option.id} className="input-group mb-2">
              <input
                type="text"
                placeholder="Option"
                value={option.text}
                onChange={(e) => handleOptionChange(option.id, e.target.value)}
                className="form-control"
                required
              />
            </div>
          ))}
          <button
            onClick={addOption}
            className="btn btn-primary"
          >
            Add Option
          </button>
        </div>
        <div className="form-check mb-4">
          <input
            type="checkbox"
            id="forTeacher"
            className="form-check-input"
            checked={forTeacher}
            onChange={(e) => setForTeacher(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="forTeacher">For Teacher</label>
        </div>
        <div className="form-check mb-4">
          <input
            type="checkbox"
            id="forStudent"
            className="form-check-input"
            checked={forStudent}
            onChange={(e) => setForStudent(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="forStudent">For Student</label>
        </div>
        <div className="d-flex justify-content-between">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
          >
            Back
          </button>
          <button
            onClick={handleCreatePoll}
            className="btn btn-success"
          >
            Create Poll
          </button>
        </div>
      </div>
    </div>
  );
};
