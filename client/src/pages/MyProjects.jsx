import { useState, useEffect } from "react";

import { useAuth } from "../context/AuthContext";

import * as api from "../services/api";

import ProjectCard from "../Templates/ProjectCard";

import Activity from "../components/Activity";



export default function MyProjects() {

  const { user } = useAuth();

  const [projects, setProjects] = useState([]);

  const [loadingProjects, setLoadingProjects] = useState(true);



  useEffect(() => {

    if (!user) return;

    api

      .fetchUserPosts(user.id)

      .then((d) => {

        const posts = (d.posts || []).map((p) => ({

          id: p.id,

          title: p.title,

          description: p.body,

          category: JSON.parse(p.tags || "[]")[0] || "General",

          status: p.published ? "Published" : "Draft",

          imageUrl: p.imageUrl,

        }));

        setProjects(posts);

      })

      .catch(() => setProjects([]))

      .finally(() => setLoadingProjects(false));

  }, [user]);



  return (

    <div className="fx-page">

      <div className="fx-page-header">

        <span><strong>My Projects</strong></span>

        <span>What you're working on</span>

      </div>

      <div className="fx-grid fx-grid--with-aside">

        <main>

          <div className="fx-feed fx-feed--grid">

            {loadingProjects ? (

              <p className="fx-muted">Loading projects...</p>

            ) : projects.length > 0 ? (

              projects.map((p) => (

                <ProjectCard

                  key={p.id}

                  id={p.id}

                  title={p.title}

                  description={p.description}

                  category={p.category}

                  status={p.status}

                  imageUrl={p.imageUrl}

                />

              ))

            ) : (

              <p className="fx-muted">No projects yet. <a href="/post">Create a post!</a></p>

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

