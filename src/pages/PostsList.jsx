import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { supabase } from "../lib/supabase";

export default function PostsList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const fetchPosts = async () => {
    setLoading(true);
    const { data, count, error } = await supabase
      .from("posts")
      .select("*, categories!posts_category_id_fkey(name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Error fetching posts:", error);
      alert("Error fetching posts: " + error.message);
    } else {
      setPosts(data);
      setTotalCount(count);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to archive this post?")) return;

    const { error } = await supabase
      .from("posts")
      .update({ status: "archived" })
      .eq("id", id);

    if (error) {
      alert("Error archiving post: " + error.message);
    } else {
      fetchPosts();
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1>Posts</h1>
        <Link to="/posts/new" className="btn btn-primary">
          <Plus size={20} />
          Novo Post
        </Link>
      </div>

      <div
        className="preview-pane"
        style={{ padding: "0", marginBottom: "2rem" }}
      >
        <table className="data-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Status</th>
              <th>Categoria</th>
              <th>Destaque</th>
              <th>Publicado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  Carregando posts...
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  Nenhum post encontrado.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id}>
                  <td style={{ fontWeight: "500" }}>{post.title}</td>
                  <td>
                    <span className={`badge badge-${post.status}`}>
                      {post.status}
                    </span>
                  </td>
                  <td>{post.categories?.name || "Uncategorized"}</td>
                  <td>{post.is_featured ? "⭐ Yes" : "No"}</td>
                  <td
                    style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}
                  >
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link
                        to={`/posts/edit/${post.id}`}
                        className="btn btn-ghost"
                        style={{ padding: "0.5rem" }}
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="btn btn-ghost"
                        style={{ padding: "0.5rem", color: "var(--danger)" }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <button
          className="btn btn-ghost"
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
        >
          <ChevronLeft size={20} />
          Anterior
        </button>
        <span style={{ color: "var(--text-muted)" }}>
          Página {page + 1} de {Math.ceil(totalCount / pageSize) || 1}
        </span>
        <button
          className="btn btn-ghost"
          disabled={(page + 1) * pageSize >= totalCount}
          onClick={() => setPage((p) => p + 1)}
        >
          Próximo
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
