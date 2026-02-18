import "./../css/InvitesTemplate.css";

export default function InvitesTemplate({ item }) {
  return (
    <div className="invite-details">
      <div className="invite-profile">
        {item?.avatar ? (
          <img src={item.avatar} alt={`${item.title} avatar`} />
        ) : (
          "D"
        )}
      </div>
      <div className="invite-info">
        <h4 className="invite-title">{item?.title}</h4>
        <span className="invite-about"> {item?.about}</span>
        <button className="accept-button">Accept</button>
        <button className="decline-button">Decline</button>
      </div>
    </div>
  );
}
