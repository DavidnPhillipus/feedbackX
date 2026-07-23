import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../services/api";
import { fetchRooms } from "../services/socket";

export default function Activity() {
  const { user } = useAuth();
  const [invites, setInvites] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    let mounted = true;

    fetchRooms()
      .then((data) => mounted && setRooms(data))
      .catch(() => mounted && setRooms([]));

    if (user?.id) {
      api
        .fetchInvites(user.id)
        .then((data) => mounted && setInvites(data.invites || []))
        .catch(() => mounted && setInvites([]));
    }

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const latestInvite = invites[0];
  const latestRoom = rooms[0];

  return (
    <div className="fx-panel">
      <h3 className="fx-panel__title">Activity</h3>
      <div className="fx-panel__sections">
        <div className="fx-panel__section">
          <h4>Invites</h4>
          {latestInvite ? (
            <div className="fx-panel__item">
              <div className="fx-panel__avatar">
                {latestInvite.title ? latestInvite.title.charAt(0) : "?"}
              </div>
              <div>
                <p className="fx-panel__item-title">{latestInvite.title}</p>
                <p className="fx-panel__item-meta">Total: {invites.length}</p>
              </div>
            </div>
          ) : (
            <p className="fx-muted">No invites yet</p>
          )}
          <Link to="/Invites" className="fx-panel__link">View All</Link>
        </div>
        <div className="fx-panel__section">
          <h4>Feedback</h4>
          {latestRoom ? (
            <div className="fx-panel__item">
              <div className="fx-panel__avatar">
                {latestRoom.name ? latestRoom.name.charAt(0) : "?"}
              </div>
              <div>
                <p className="fx-panel__item-title">{latestRoom.name}</p>
                <p className="fx-panel__item-meta">Total: {rooms.length}</p>
              </div>
            </div>
          ) : (
            <p className="fx-muted">No feedback rooms yet</p>
          )}
          <Link to="/feedbackRooms" className="fx-panel__link">View All</Link>
        </div>
      </div>
    </div>
  );
}
