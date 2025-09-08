import "./css/register.css";
import icon from "./assets/google-icon.png";

export default function Login() {
  return (
    <div className="outer-container">
      <div className="form-container">
        <h1 style={{ fontSize: 36, fontFamily: "ganeva", marginTop: 40 }}>
          feedback<span style={{ color: "blue" }}>X</span>
        </h1>
        <h4
          style={{
            color: "gray",
            textAlign: "center",
            padding: 6,
            marginTop: 0,
          }}
        >
          Join the feedback revolution - where every opinion fuels innovation
        </h4>
        <button className="google">
          <img src={icon} alt="google icon" width={25} />
          Continue with Google
        </button>
        <div className="or-container">
          <div className="line"></div>
          <span className="or-text">OR</span>
          <div className="line"></div>
        </div>
        <form id="form">
          <input
            type="email"
            placeholder="Email or username"
            className=" input input-field"
          />
          <input
            type="text"
            placeholder="Full Name"
            className="input full-name"
            id="full-name"
          />
          <input
            type="text"
            placeholder="Username"
            className="input username"
            id="username"
          />
          <input
            type="password"
            placeholder="Password"
            className="input password"
            id="password"
          />
        </form>
        <div className="terms">
          <p className="text">
            People who use our service may have uploaded your contact
            information to Instagram.
            <span
              style={{ display: "inline", color: "blue", cursor: "pointer" }}
            >
              Learn More
            </span>
          </p>
          <p className="text">
            By signing up, you agree to our
            <span
              style={{
                display: "inline",
                color: "blue",
                cursor: "pointer",
              }}
            >
              Terms , Privacy Policy
            </span>
            and
            <span
              style={{
                display: "inline",
                color: "blue",
                cursor: "pointer",
              }}
            >
              Cookies Policy.
            </span>
          </p>
        </div>
        <button type="submit" id="reg">
          Sign Up
        </button>
      </div>
      <div className="login-container">
        <p className="have-account">Have an account?</p>
        <p className="login">Login</p>
      </div>
      <footer className="footer">
        <div>
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
          <span style={{ color: "blue", display: "inline" }}>X</span>. All
          rights reserved.
        </p>
      </footer>
    </div>
  );
}
