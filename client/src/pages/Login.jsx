import React, { useState } from "react";
import "./../css/login.css";
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // mock auth: navigate to home
    navigate('/');
  }

  return (
    <div className="outer-container">
      <div className="form-container">
        <h1 style={{ fontSize: 36, fontFamily: "ganeva" }}>
          feedback<span style={{ color: "blue" }}>X</span>
        </h1>
        <form className="form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email or username"
            className=" input input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="input input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="login">
            Login
          </button>
          <div className="or-container">
            <div className="line"></div>
            <span className="or-text">OR</span>
            <div className="line"></div>
          </div>

          <button type="button" className="google">
            <FcGoogle size={20} style={{ marginRight: 8 }} aria-hidden="true" />
            Continue with Google
          </button>
          <p className="forgot-password">
            <span className="forgot">Forgot password?</span>
          </p>
        </form>
      </div>
      <div className="register-container">
        <p className="register-text">
          Don't have an account? <button className="register" onClick={() => navigate('/Register')}>Register</button>
        </p>
      </div>
      <div className="footer-login">
        <span>
          feedback<span style={{ color: "blue" }}>X</span>
        </span>
        <span className="spn">About</span>
        <span className="spn">Privacy</span>
        <span className="spn">Terms</span>
        <span className="spn">Contact</span>
        <span className="spn">Help</span>
      </div>
      <p className="spn footer-text">
        &copy; {new Date().getFullYear()} feedback
        <span style={{ color: "blue" }}>X</span>. All rights reserved.
      </p>
    </div>
  );
}
