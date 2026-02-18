import "./../css/SearchTemplate.css";

export default function SearchTemplate({ item }) {
  const avatar = item?.avatar || "https://via.placeholder.com/40";
  const title = item?.title || "Untitled";

  return (
    <div className="search-template-container">
      <div className="search-profile">
        <img src={avatar} alt="user profile" />
      </div>
      <div className="title-section">
        <p>{title}</p>
      </div>
    </div>
  );
}
