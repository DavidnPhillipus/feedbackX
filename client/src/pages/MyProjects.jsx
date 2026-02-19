import "./../css/MyProjects.css";
import { useState } from "react";

export default function MyProjects() {
  const [projects] = useState([
    { id: 1, title: "Redesign landing", status: "Active" },
    { id: 2, title: "Mobile auth flow", status: "Planning" },
  ]);

  return (
    <div className="page-inner container">
      <h1>My Projects</h1>
      <div className="projects-list">
        {projects.map((p) => (
          <div key={p.id} className="project-card card-base">
            <h3>{p.title}</h3>
            <p className="muted">Status: {p.status}</p>
            <div className="project-actions">
              <button className="btn">Open</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
