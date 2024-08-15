import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  axios.defaults.withCredentials = true;

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const roleFromUrl = queryParams.get("role");
    if (roleFromUrl) {
      setRole(roleFromUrl);
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    axios.post("https://basic-polling-system.vercel.app/login", { email, password, role })
      .then(result => console.log(result))
      .catch(err => console.log(err));

    try {
      const response = await fetch(`/api/${role}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        console.log("User logged in successfully!");
        if (role === "institute") {
          return navigate(`/adminDashBoard/${email}?role=${role}`);
        }
        navigate(`/dashboard/${email}?role=${role}`);
      } else {
        const errorMessage = await response.text();
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  return (
    <form
      className="container mt-5 p-4 bg-white rounded shadow"
      style={{ maxWidth: "400px" }}
      onSubmit={handleSubmit}
    >
      <h2 className="mb-4 text-center">Login</h2>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          className="form-control"
          placeholder="name@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          className="form-control"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary btn-block"
      >
        Login
      </button>
      <p className="mt-3 text-center">
        Don't have an account?{" "}
        <Link
          to={`/signup?role=${role}`}
          className="text-primary"
        >
          Signup
        </Link>
        .
      </p>
    </form>
  );
};
