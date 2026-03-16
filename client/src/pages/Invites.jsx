import "./../css/Invites.css";
import InvitesTemplate from "../Templates/InvitesTemplate";
import { useEffect, useState } from "react";
import { getInvites } from "../services/mockApi";

export default function Invites() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getInvites()
      .then((d) => mounted && setItems(d))
      .catch(() => mounted && setItems([]))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  return (
    <div className="page-inner container">
      <div className="columns">
        <main>
          <div className="main-header">
            <span>
              <strong>Invites</strong>
            </span>
            <span>Pending invitations</span>
          </div>
          <div className="invites-wrapper">
            {loading ? <p>Loading...</p> : items.map((i) => <InvitesTemplate item={i} key={i.id} />)}
          </div>
        </main>
      </div>
    </div>
  );
}
