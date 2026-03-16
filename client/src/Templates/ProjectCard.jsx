import "./../css/ProjectCard.css";

export default function ProjectCard({
  id,
  title,
  description,
  category,
  status,
  unread = 0,
}) {
  // Generate a project image based on id
  const projectImages = {
    p1: "https://picsum.photos/600/400?image=25",
    p2: "https://picsum.photos/600/400?image=26",
    p3: "https://picsum.photos/600/400?image=27",
    p4: "https://picsum.photos/600/400?image=28",
    p5: "https://picsum.photos/600/400?image=29",
    p6: "https://picsum.photos/600/400?image=31",
    p7: "https://picsum.photos/600/400?image=32",
    p8: "https://picsum.photos/600/400?image=33",
  };

  const projectImage = projectImages[id] || "https://picsum.photos/600/400?image=25";

  const getStatusBadge = (status) => {
    switch (status) {
      case "In Progress":
        return "In Progress";
      case "Planning":
        return "Planning";
      case "Completed":
        return "Completed";
      default:
        return status;
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <img 
          src="https://i.pravatar.cc/80?img=9" 
          alt="Your Profile" 
          className="card-author-image" 
        />
        <div className="card-header-content">
          <div className="card-header-top">
            <span className="card-author-name">You</span>
            <div className="card-badges">
              <button className="card-badge">{category}</button>
              <button className="card-badge">{getStatusBadge(status)}</button>
            </div>
          </div>
          <h2 className="card-title">{title}</h2>
          <p className="card-description">{description}</p>
        </div>
      </div>
      <div className="format-part">
        <div className="format">
          <img src={projectImage} alt={title} />
        </div>
        <div className="reactions">
          <div className="project-unread-badge">
            {unread > 0 && (
              <span className="unread-indicator">
                💬 {unread}
              </span>
            )}
          </div>
          <button className="feedback-button">Open</button>
        </div>
      </div>
    </div>
  );
}

