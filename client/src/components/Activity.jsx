import "./../css/Activity.css";

export default function Activity() {
  return (
    <div className="wrapper">
      <h3>Activity</h3>
      <div className="invites">
        <div className="invites-header">
          <h3>Invites</h3>
          <a className="invites-count">2</a>
        </div>
        <div className="invite-details">
          <div className="invite-profile">D</div>
          <div className="invite-info">
            <h4 className="invite-title">Design Sprint</h4>
            <p className="invite-about"> Review Motherboards</p>
            <button className="accept-button">Accept</button>
            <button className="decline-button">Decline</button>
          </div>
        </div>
        <div className="invite-details">
          <div className="invite-profile">D</div>
          <div className="invite-info">
            <h4 className="invite-title">Design Sprint</h4>
            <p className="invite-about"> Review Motherboards</p>
            <button className="accept-button">Accept</button>
            <button className="decline-button">Decline</button>
          </div>
        </div>
      </div>

      <div className="rooms">
        <h3>Feedback Rooms</h3>
        <div className="room-details">
          <div className="room-profile">P</div>
          <div className="room-info">
            <h4 className="room-title">Product Design</h4>
            <p className="room-about"> Fianlize roadmap</p>
          </div>
        </div>
        <div className="room-details">
          <div className="room-profile">P</div>
          <div className="room-info">
            <h4 className="room-title">Product Design</h4>
            <p className="room-about"> Fianlize roadmap</p>
          </div>
        </div>
      </div>
    </div>
  );
}
