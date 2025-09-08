import React from "react";
import "./css/login.css";
import icon from "./assets/google-icon.png";

export default function Login() {
  return (
    <div className="outer-container">
      <div className="form-container">
        <h1 style={{ fontSize: 36, fontFamily: "ganeva" }}>
          feedback<span style={{ color: "blue" }}>X</span>
        </h1>
        <form className="form">
          <input
            type="email"
            placeholder="Email or username"
            className=" input input-field"
          />
          <input
            type="password"
            placeholder="Password"
            className="input input-field"
          />
          <button type="submit" className="login">
            Login
          </button>
          <div className="or-container">
            <div className="line"></div>
            <span className="or-text">OR</span>
            <div className="line"></div>
          </div>

          <button className="google">
            <img src={icon} alt="google icon" width={25} />
            Continue with Google
          </button>
          <p className="forgot-password">
            <span className="forgot">Forgot password?</span>
          </p>
        </form>
      </div>
      <div className="register-container">
        <p className="register-text">
          Don't have an account? <button className="register">Register</button>
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
