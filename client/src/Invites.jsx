import "./css/Invites.css";
import InvitesTemplate from "./InvitesTemplate";
export default function Invites() {
  return (
    <div className="invites-wrapper">
      <h1 className="invites-h3">Invites</h1>
      <InvitesTemplate />
      <InvitesTemplate />
      <InvitesTemplate />
      <InvitesTemplate />
      <InvitesTemplate />
    </div>
  );
}
