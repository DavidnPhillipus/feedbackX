import React from "react";
import "./css/landingPage.css";
import hero from "./assets/hero.png";

export default function LandingPage() {
  return (
    <div className="outer-div">
      <header>
        <nav className="nav">
          <h1
            style={{
              fontSize: 30,
              fontFamily: "ganeva",
              marginTop: 30,
              marginLeft: 15,
              color: "black",
            }}
          >
            feedback<span style={{ color: "blue" }}>X</span>
          </h1>
          <div className="nav-btns">
            <button className="btn">How it works</button>
            <button className="btn">Categories</button>
            <button className="btn login">Login</button>
            <button className="btn register">Regster</button>
          </div>
        </nav>
      </header>
      <main className="main-container">
        <section className="sig-container">
          <section className="signature">
            <h1 className="sig">
              Create a project room, invite peers, and get fast, useful feedback
            </h1>
            <p className="sig-text">
              Turn posts int to progress - share work in progress, collect
              honest reactions, and get discovered by peers who can help you
              level up.
            </p>
          </section>
          <div className="image-container">
            <img
              src={hero}
              alt="My hero section"
              style={{ maxWidth: 550, marginTop: 50 }}
            />
          </div>
        </section>
        <div>
          <h2 className="hw-header">How It Works</h2>
          <section className="hw-works">
            <div className="box">
              <span className="span">➕</span>
              <h3>Post your Project</h3>
              <p className="text">
                Upload images, links, or videos or even nusic. Share your
                project with the world and get feedback from collabors and other
                users.
              </p>
            </div>
            <div className="box ">
              <span className="span">💬</span>
              <h3>Get Feedback</h3>
              <p className="text">
                Get more people to see your project and get more feedback. Enter
                the project room and share your insights.
              </p>
            </div>
            <div className="box ">
              <span className="span">⬆️</span>
              <h3>Improve & iterate</h3>
              <p className="text">
                Use the feedback you get to improve your project. Iterate faster
                and better. Get more feedback and improve even more.
              </p>
            </div>
          </section>
        </div>
        <section className="post-room"></section>
      </main>
    </div>
  );
}
