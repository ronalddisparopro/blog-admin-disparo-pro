import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { supabase } from "./lib/supabase";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import PostsList from "./pages/PostsList";
import PostEditor from "./pages/PostEditor";
import "./index.css";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="auth-guard">
        <h1 style={{ color: "var(--text-muted)" }}>Carregando...</h1>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route
          path="/login"
          element={!session ? <Login /> : <Navigate to="/posts" />}
        />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            session ? (
              <Layout>
                <Routes>
                  <Route path="/posts" element={<PostsList />} />
                  <Route path="/posts/new" element={<PostEditor />} />
                  <Route path="/posts/edit/:id" element={<PostEditor />} />
                  <Route path="*" element={<Navigate to="/posts" />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
