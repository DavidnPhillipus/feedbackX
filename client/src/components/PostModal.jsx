import CardTemplate from "../Templates/CardTemplate";

export default function PostModal({ post, onClose }) {
  if (!post) return null;

  return (
    <div className="fx-modal-overlay">
      <div className="fx-modal-backdrop" onClick={onClose} />
      <div className="fx-modal-content">
        <button type="button" className="fx-modal-close" onClick={onClose} aria-label="Close">×</button>
        <CardTemplate {...post} />
      </div>
    </div>
  );
}
