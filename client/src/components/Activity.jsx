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

  const latestInvite = invites[0];
  const latestRoom = rooms[0];

  return (
    <div className="activity-compact">
      <h3>Activity</h3>
      <div className="activity-sections">
        <div className="invites-section">
          <h4>Invites</h4>
          {latestInvite && (
            <div className="latest-item">
              <div className="item-profile">{latestInvite.title ? latestInvite.title.charAt(0) : "?"}</div>
              <div className="item-info">
                <p className="item-title">{latestInvite.title}</p>
                <p className="item-count">New: {invites.length}</p>
              </div>
            </div>
          )}
          <Link to="/feedbackRooms" className="view-all">View All</Link>
        </div>
        <div className="feedback-section">
          <h4>Feedback</h4>
          {latestRoom && (
            <div className="latest-item">
              <div className="item-profile">{latestRoom.name ? latestRoom.name.charAt(0) : "?"}</div>
              <div className="item-info">
                <p className="item-title">{latestRoom.name}</p>
                <p className="item-count">Total: {rooms.length}</p>
              </div>
            </div>
          )}
          <Link to="/feedbackRooms" className="view-all">View All</Link>
        </div>
      </div>
    </div>
  );
}
