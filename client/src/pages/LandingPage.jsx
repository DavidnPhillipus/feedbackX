import hero from "../assets/hero.png";
import { useNavigate } from "react-router-dom";
import { FiGithub, FiTwitter, FiLinkedin } from "react-icons/fi";

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="fx-landing">
      <nav className="fx-landing__nav">
        <h1 className="fx-landing__logo">
          feedback<span className="fx-logo__accent">X</span>
        </h1>
        <div className="fx-landing__nav-links">
          <button type="button" className="fx-landing__nav-btn" onClick={scrollToHowItWorks}>How it works</button>
          <button type="button" className="fx-landing__nav-btn">Categories</button>
          <button type="button" className="fx-landing__nav-btn" onClick={() => navigate('/Login')}>Login</button>
          <button type="button" className="fx-landing__nav-btn fx-landing__nav-btn--primary" onClick={() => navigate('/Register')}>Register</button>
        </div>
      </nav>

      <section className="fx-landing__hero">
        <div>
          <h1 className="fx-landing__headline">
            Create a project room, invite peers, and get fast, useful feedback
          </h1>
          <p className="fx-landing__subtext">
            Turn posts into progress — share work in progress, collect honest reactions,
            and get discovered by peers who can help you level up.
          </p>
        </div>
        <img src={hero} alt="feedbackX hero" className="fx-landing__hero-img" />
      </section>

      <h2 id="how-it-works" className="fx-landing__section-title">How It Works</h2>
      <section className="fx-landing__steps">
        <div className="fx-landing__step">
          <span className="fx-landing__step-icon">➕</span>
          <h3>Post your Project</h3>
          <p>Upload images, links, or videos. Share your project and get feedback from collaborators.</p>
        </div>
        <div className="fx-landing__step">
          <span className="fx-landing__step-icon">💬</span>
          <h3>Get Feedback</h3>
          <p>Get more people to see your project. Enter the project room and share your insights.</p>
        </div>
        <div className="fx-landing__step">
          <span className="fx-landing__step-icon">⬆️</span>
          <h3>Improve & iterate</h3>
          <p>Use the feedback you get to improve your project. Iterate faster and better.</p>
        </div>
      </section>

      <section className="fx-landing__cta">
        <div className="fx-landing__cta-inner">
          <h2>Ready to level up your work?</h2>
          <p>Join a community of creators sharing honest feedback on design, code, and product.</p>
          <div className="fx-landing__cta-actions">
            <button type="button" className="fx-landing__cta-btn" onClick={() => navigate('/Register')}>
              Get started free
            </button>
            <button type="button" className="fx-landing__cta-btn fx-landing__cta-btn--ghost" onClick={() => navigate('/Login')}>
              Sign in
            </button>
          </div>
        </div>
      </section>

      <footer className="fx-landing__footer">
        <div className="fx-landing__footer-main">
          <div className="fx-landing__footer-brand">
            <h2 className="fx-landing__logo">
              feedback<span className="fx-logo__accent">X</span>
            </h2>
            <p>Peer feedback that helps you ship better work, faster.</p>
          </div>

          <div className="fx-landing__footer-col">
            <h4>Product</h4>
            <button type="button" onClick={scrollToHowItWorks}>How it works</button>
            <button type="button" onClick={() => navigate('/Explore')}>Explore</button>
            <button type="button" onClick={() => navigate('/Register')}>Create account</button>
          </div>

          <div className="fx-landing__footer-col">
            <h4>Company</h4>
            <button type="button">About</button>
            <button type="button">Blog</button>
            <button type="button">Careers</button>
          </div>

          <div className="fx-landing__footer-col">
            <h4>Support</h4>
            <button type="button">Help center</button>
            <button type="button">Privacy</button>
            <button type="button">Terms</button>
          </div>
        </div>

        <div className="fx-landing__footer-bottom">
          <p>&copy; {new Date().getFullYear()} feedbackX. All rights reserved.</p>
          <div className="fx-landing__footer-social">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FiTwitter size={18} />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <FiGithub size={18} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FiLinkedin size={18} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
