import InvitesTemplate from "../Templates/InvitesTemplate";

import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import * as api from "../services/api";



export default function Invites() {

  const { user } = useAuth();

  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);



  const loadInvites = () => {

    if (!user) return;

    setLoading(true);

    api

      .fetchInvites(user.id)

      .then((d) => setItems(d.invites || []))

      .catch(() => setItems([]))

      .finally(() => setLoading(false));

  };



  useEffect(() => {

    loadInvites();

  }, [user]);



  const handleAccept = async (code) => {

    try {

      await api.acceptInvite(code);

      loadInvites();

    } catch (e) {

      alert(e.message);

    }

  };



  const handleDecline = async (code) => {

    try {

      await api.declineInvite(code);

      loadInvites();

    } catch (e) {

      alert(e.message);

    }

  };



  return (

    <div className="fx-page">

      <div className="fx-page-header">

        <span><strong>Invites</strong></span>

        <span>Pending invitations</span>

      </div>

      <div>

        {loading ? (

          <p className="fx-muted">Loading...</p>

        ) : items.length === 0 ? (

          <p className="fx-muted">No pending invites</p>

        ) : (

          items.map((i) => (

            <InvitesTemplate

              item={i}

              key={i.id}

              onAccept={() => handleAccept(i.code)}

              onDecline={() => handleDecline(i.code)}

            />

          ))

        )}

      </div>

    </div>

  );

}

