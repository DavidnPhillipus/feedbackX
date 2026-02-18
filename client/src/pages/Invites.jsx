import "./../css/Invites.css";
import InvitesTemplate from "../Templates/InvitesTemplate";
import { invites } from "../mocks/mockData";

export default function Invites() {
  return (
    <div className="invites-wrapper">
      <h1 className="invites-h3">Invites</h1>
      {invites.map((i) => (
        <InvitesTemplate item={i} key={i.id} />
      ))}
    </div>
  );
}
