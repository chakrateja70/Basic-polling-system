/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import 'bootstrap/dist/css/bootstrap.min.css';

export const ADashBoard = () => {
  const [data, setData] = useState([]);
  const { email } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPollData = async () => {
      try {
        const response = await axios.get(`/api/poll/getPollsByIEmail/${email}`, {
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        setData(response.data);
      } catch (error) {
        console.error("Error fetching poll data:", error);
      }
    };

    if (email) {
      fetchPollData();
    }

    const token = Cookies.get("token");
    if (!token) {
      navigate("/");
      alert("Please login!");
      return;
    }
  }, [email]);

  const handleDeletePoll = async (pollId) => {
    try {
      await axios.delete(`/api/poll/${pollId}`);
      setData(data.filter((poll) => poll.id !== pollId));
    } catch (error) {
      console.error(`Error deleting poll with ID ${pollId}`, error);
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    console.log("Logged out");
    navigate("/");
  };

  return (
    <div className="container mt-5 p-4 bg-light rounded shadow" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <h1 className="text-center mb-4" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#343a40' }}>
        Admin Dashboard
      </h1>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link
          to="/createPoll"
          className="btn btn-primary"
          style={{ fontWeight: 'bold', padding: '10px 20px' }}
        >
          Create Poll
        </Link>
        <div>
          <Link
            to={`/profile/${email}?role=institute`}
            className="btn btn-secondary mr-2"
            style={{ fontWeight: 'bold', padding: '10px 20px' }}
          >
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="btn btn-danger"
            style={{ fontWeight: 'bold', padding: '10px 20px' }}
          >
            Logout
          </button>
        </div>
      </div>
      {data.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped table-bordered text-center">
            <thead className="thead-dark">
              <tr>
                <th>ID</th>
                <th>Institute Name</th>
                <th>Date</th>
                <th>Options</th>
                <th>For Teacher</th>
                <th>Total Teachers</th>
                <th>For Student</th>
                <th>Total Students</th>
                <th>Win</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.id}</td>
                  <td>{item.institutename}</td>
                  <td>
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td>
                    {item.options &&
                      Object.entries(item.options).map(([option, value]) => (
                        <div key={option}>{`${option}: ${value}`}</div>
                      ))}
                  </td>
                  <td>{item.forTeacher}</td>
                  <td>{item.totalTeacher}</td>
                  <td>{item.forStudent}</td>
                  <td>{item.totalStudent}</td>
                  <td>
                    {item.win.length > 0 ? item.win : `N/A`}
                  </td>
                  <td>{item.name}</td>
                  <td>
                    <button
                      onClick={() => handleDeletePoll(item.id)}
                      className="btn btn-danger"
                      style={{ fontWeight: 'bold', padding: '8px 16px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <h1 className="text-center text-secondary" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
          Please Create Polls!
        </h1>
      )}
    </div>
  );
};
