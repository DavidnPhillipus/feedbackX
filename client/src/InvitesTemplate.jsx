import "./css/InvitesTemplate.css";

export default function InvitesTemplate() {
  return (
    <div className="invite-details">
      <div className="invite-profile">D</div>
      <div className="invite-info">
        <h4 className="invite-title">Design Sprint</h4>
        <span className="invite-about"> Review Motherboards</span>
        <button className="accept-button">Accept</button>
        <button className="decline-button">Decline</button>
      </div>
    </div>
  );
}
