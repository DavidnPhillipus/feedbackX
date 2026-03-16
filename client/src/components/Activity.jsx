import "./../css/Activity.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRooms, getInvites } from "../services/mockApi";

export default function Activity() {
  const [invites, setInvites] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    let mounted = true;

    // load invites and rooms from mock api
    getInvites()
      .then((data) => {
        if (mounted) setInvites(data);
      })
      .catch(() => {})
      .finally(() => {});

    getRooms()
      .then((data) => {
        if (mounted) setRooms(data);
      })
      .catch(() => {})
      .finally(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="wrapper">
      <h3>Activity</h3>
      <div className="invites">
        <div className="invites-header">
          <h3>Invites</h3>
          <a className="invites-count">{invites.length}</a>
        </div>
        {invites.slice(0, 3).map((inv) => (
          <div key={inv.id} className="invite-details">
            <div className="invite-profile">
              {inv.title ? inv.title.charAt(0) : "?"}
            </div>
            <div className="invite-info">
              <h4 className="invite-title">{inv.title}</h4>
              <p className="invite-about"> {inv.about}</p>
              <button className="accept-button">Accept</button>
              <button className="decline-button">Decline</button>
            </div>
          </div>
        ))}
        {invites.length > 3 && (
          <div className="see-all">
            <Link to="/feedbackRooms">See all invites on Chatrooms page</Link>
          </div>
        )}
      </div>

      <div className="rooms">
        <h3>Feedback Rooms</h3>
        {rooms.slice(0, 3).map((r) => (
          <div key={r.id} className="room-details">
            <div className="room-profile">
              {r.name ? r.name.charAt(0) : "?"}
            </div>
            <div className="room-info">
              <h4 className="room-title">{r.name}</h4>
              <p className="room-about"> {r.lastMessage}</p>
            </div>
          </div>
        ))}
        {rooms.length > 3 && (
          <div className="see-all">
            <Link to="/feedbackRooms">See all rooms</Link>
          </div>
        )}
      </div>
    </div>
  );
}
