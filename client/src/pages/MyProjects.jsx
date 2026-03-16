import "./../css/MyProjects.css";
import { useState, useEffect } from "react";
import { getProjects, getRooms } from "../services/mockApi";
import ProjectCard from "../Templates/ProjectCard";
import Activity from "../components/Activity";

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [feedbackRooms, setFeedbackRooms] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    let mounted = true;
    getProjects()
      .then((p) => mounted && setProjects(p))
      .catch(() => mounted && setProjects([]))
      .finally(() => mounted && setLoadingProjects(false));
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    let mounted = true;
    getRooms()
      .then((r) => mounted && setFeedbackRooms(r))
      .catch(() => mounted && setFeedbackRooms([]));
    return () => (mounted = false);
  }, []);

  // Map unread messages to projects
  const getUnreadCount = (projectId) => {
    const room = feedbackRooms.find((r) => r.id === `r${projectId.slice(-1)}`);
    return room ? room.unread : 0;
  };

  return (
    <div className="page-inner container">
      <div className="columns">
        <main>
          <div className="main-header">
            <span>
              <strong>My Projects</strong>
            </span>
            <span>What you're working on</span>
          </div>
          <div className="projects-feed">
            {loadingProjects ? (
              <p>Loading projects...</p>
            ) : projects.length > 0 ? (
              projects.map((p) => (
                <ProjectCard
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  description={p.description}
                  category={p.category}
                  status={p.status}
                  unread={getUnreadCount(p.id)}
                />
              ))
            ) : (
              <p className="muted">No projects yet</p>
            )}
          </div>
        </main>
        <aside>
          <Activity />
        </aside>
      </div>
    </div>
  );
}
