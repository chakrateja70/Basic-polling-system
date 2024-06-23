import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const LandingPage = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleRoleSelect = (role) => {
    navigate(`/login?role=${role}`);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center vh-100"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <h1 className="display-7 font-weight-bold text-dark mb-4">
        Welcome to Polling System
      </h1>
      <div className="dropdown">
        <button
          id="dropdownDefaultButton"
          onClick={toggleDropdown}
          className="btn btn-primary dropdown-toggle"
          type="button"
        >
          Select Role
        </button>

        {dropdownOpen && (
          <div
            id="dropdown"
            className="dropdown-menu show"
            style={{ position: "absolute", top: "100%", left: 0 }}
          >
            <button
              onClick={() => handleRoleSelect("institute")}
              className="dropdown-item"
            >
              Institute
            </button>
            <button
              onClick={() => handleRoleSelect("teacher")}
              className="dropdown-item"
            >
              Teacher
            </button>
            <button
              onClick={() => handleRoleSelect("student")}
              className="dropdown-item"
            >
              Student
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
