export default function SearchTemplate({ item }) {
  const avatar = item?.profilePicture || item?.avatar || "https://via.placeholder.com/40";
  const title = item?.title || "Untitled";

  return (
    <div className="fx-search-page__result">
      <img src={avatar} alt="" />
      <p>{title}</p>
    </div>
  );
}
