import "./css/SearchTemplate.css";

export default function SearchTemplate() {
  return (
    <div className="search-template-container">
      <div className="search-profile">
        <img src="https://unsplash/picture-of-david" alt="user profile" />
      </div>
      <div className="title-section">
        <p>This is just the title you are searching</p>
      </div>
    </div>
  );
}
