import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, PlusCircle, LogOut } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Layout({ children }) {
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div
          className="sidebar-brand"
          style={{
            padding: "1.5rem",
            fontSize: "1.25rem",
            fontWeight: "bold",
            color: "var(--primary)",
          }}
        >
          <img src="/logo-disparo-pro.svg" alt="Logo Disparo Pro" />
        </div>
        <nav className="sidebar-nav">
          <Link
            to="/posts"
            className={`nav-link ${location.pathname === "/posts" ? "active" : ""}`}
          >
            <FileText size={20} />
            Posts
          </Link>
          <Link
            to="/posts/new"
            className={`nav-link ${location.pathname === "/posts/new" ? "active" : ""}`}
          >
            <PlusCircle size={20} />
            Novo Post
          </Link>
          <button
            onClick={handleLogout}
            className="nav-link btn-ghost"
            style={{
              marginTop: "auto",
              border: "none",
              width: "100%",
              cursor: "pointer",
            }}
          >
            <LogOut size={20} />
            Sair
          </button>
        </nav>
      </aside>
      <main className="content-area">{children}</main>
    </div>
  );
}
