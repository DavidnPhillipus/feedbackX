import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRooms, getInvites } from "../services/mockApi";

export default function Activity() {
  const [invites, setInvites] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    let mounted = true;
    getInvites().then((data) => mounted && setInvites(data)).catch(() => {});
    getRooms().then((data) => mounted && setRooms(data)).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const latestInvite = invites[0];
  const latestRoom = rooms[0];

  return (
    <div className="fx-panel">
      <h3 className="fx-panel__title">Activity</h3>
      <div className="fx-panel__sections">
        <div className="fx-panel__section">
          <h4>Invites</h4>
          {latestInvite && (
            <div className="fx-panel__item">
              <div className="fx-panel__avatar">
                {latestInvite.title ? latestInvite.title.charAt(0) : "?"}
              </div>
              <div>
                <p className="fx-panel__item-title">{latestInvite.title}</p>
                <p className="fx-panel__item-meta">New: {invites.length}</p>
              </div>
            </div>
          )}
          <Link to="/feedbackRooms" className="fx-panel__link">View All</Link>
        </div>
        <div className="fx-panel__section">
          <h4>Feedback</h4>
          {latestRoom && (
            <div className="fx-panel__item">
              <div className="fx-panel__avatar">
                {latestRoom.name ? latestRoom.name.charAt(0) : "?"}
              </div>
              <div>
                <p className="fx-panel__item-title">{latestRoom.name}</p>
                <p className="fx-panel__item-meta">Total: {rooms.length}</p>
              </div>
            </div>
          )}
          <Link to="/feedbackRooms" className="fx-panel__link">View All</Link>
        </div>
      </div>
    </div>
  );
}
