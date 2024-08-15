import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';

export const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  axios.defaults.withCredentials = true;

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const roleFromUrl = queryParams.get("role");
    if (roleFromUrl) {
      setRole(roleFromUrl);
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    axios.post("https://basic-polling-system.vercel.app/signup", { name, email, phone, password, repeatPassword, role })
      .then(result => console.log(result))
      .catch(err => console.log(err));

    if (password !== repeatPassword) {
      alert("Password not matching!");
      return;
    }

    const newUser = {
      name,
      email,
      phone,
      password,
    };

    try {
      const response = await fetch(`/api/${role}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        alert("Registered Successfully\nPlease Login");
        navigate(`/login?role=${role}`);
        return;
      } else {
        const errorMessage = await response.text();
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100" style={styles.container}>
      <form className="card p-5 shadow-lg w-100" style={styles.form} onSubmit={handleSubmit}>
        <h2 className="text-center mb-4" style={styles.heading}>Register</h2>

        <div className="mb-4">
          <label htmlFor="name" className="form-label">Name</label>
          <input
            type="text"
            id="name"
            className="form-control"
            placeholder="John Doe"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="form-label">Email</label>
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

        <div className="mb-4">
          <label htmlFor="phone" className="form-label">Mobile number</label>
          <input
            type="text"
            id="phone"
            className="form-control"
            placeholder="123-456-7890"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            id="password"
            className="form-control"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="repeat-password" className="form-label">confirm password</label>
          <input
            type="password"
            id="repeat-password"
            className="form-control"
            required
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
          />
        </div>

        <div className="form-check mb-4">
          <input
            type="checkbox"
            className="form-check-input"
            id="terms"
            required
          />
          <label className="form-check-label" htmlFor="terms">
            I agree with the{" "}
            <a href="/" className="text-primary">
              terms and conditions
            </a>
          </label>
        </div>

        <button type="submit" className="btn btn-primary w-100 mb-3">
          Register new account
        </button>

        <p className="text-center">
          Already registered?{" "}
          <Link to={`/login?role=${role}`} className="text-primary">
            Log in here
          </Link>
        </p>
      </form>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, Helvetica, sans-serif'
  },
  form: {
    maxWidth: '500px',
    borderRadius: '10px'
  },
  heading: {
    fontSize: '2rem',
    fontWeight: 'bold'
  }
};
