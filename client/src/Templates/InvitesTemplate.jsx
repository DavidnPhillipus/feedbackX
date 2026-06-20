export default function InvitesTemplate({ item, onAccept, onDecline }) {

  return (

    <div className="fx-invite">

      <div className="fx-invite__avatar">

        {item?.avatar ? (

          <img src={item.avatar} alt={`${item.title} avatar`} />

        ) : (

          "D"

        )}

      </div>

      <div className="fx-invite__body">

        <h4 className="fx-invite__title">{item?.title}</h4>

        <span className="fx-invite__about">{item?.about}</span>

        <div className="fx-invite__actions">

          <button type="button" className="fx-btn" onClick={onAccept}>Accept</button>

          <button type="button" className="fx-btn fx-btn--secondary" onClick={onDecline}>Decline</button>

        </div>

      </div>

    </div>

  );

}

