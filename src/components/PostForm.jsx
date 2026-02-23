import React, { useState, useEffect } from "react";
import { Upload, X, Check } from "lucide-react";
import Editor from "./Editor";
import { supabase } from "../lib/supabase";

export default function PostForm({ initialData, onSave, onChange }) {
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    cover_image_path: "",
    cover_image_alt: "",
    status: "draft",
    is_featured: false,
    category_id: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    og_image: "",
    og_image_alt: "",
    ...Object.fromEntries(
      Object.entries(initialData || {}).map(([k, v]) => [k, v ?? ""]),
    ),
  });

  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*");
    if (data) setCategories(data);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    const updated = { ...formData, [name]: newValue };
    setFormData(updated);

    // Calculate reading time before passing to preview
    const words = updated.content?.split(/\s+/).filter(Boolean).length || 0;
    const readingTime = Math.ceil(words / 200);

    onChange({
      ...updated,
      reading_time: readingTime,
      category_name: categories.find((c) => c.id === updated.category_id)?.name,
    });
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    // Immediate preview using URL.createObjectURL
    const localUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      [field === "cover_image" ? "cover_image_path" : field]: localUrl,
    }));
    onChange({
      ...formData,
      [field === "cover_image" ? "cover_image_path" : field]: localUrl,
    });

    try {
      const timestamp = Date.now();
      const slug =
        formData.title
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/[^\w-]+/g, "") || "temp";
      const fileName = `${slug}-${timestamp}.webp`;

      const { data, error } = await supabase.storage
        .from("blog-covers")
        .upload(fileName, file);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("blog-covers").getPublicUrl(fileName);

      setFormData((prev) => ({
        ...prev,
        [field === "cover_image" ? "cover_image_path" : field]: publicUrl,
      }));
      onChange({
        ...formData,
        [field === "cover_image" ? "cover_image_path" : field]: publicUrl,
      });
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      className="editor-form-scroll"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(formData);
      }}
    >
      <section style={{ marginBottom: "2rem" }}>
        <div className="form-group">
          <label className="form-label">Título *</label>
          <input
            type="text"
            name="title"
            className="form-input"
            required
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Resumo</label>
          <textarea
            name="excerpt"
            className="form-textarea"
            rows="2"
            value={formData.excerpt}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="form-group">
          <label className="form-label">Conteúdo Principal</label>
          <Editor
            content={formData.content}
            onChange={(json) => {
              const updated = { ...formData, content: json };
              setFormData(updated);

              // Helper to extract plain text for reading time
              const extractText = (node) => {
                if (!node) return "";
                if (node.type === "text") return node.text;
                if (node.content && Array.isArray(node.content)) {
                  return node.content.map(extractText).join(" ");
                }
                return "";
              };

              const textContent = extractText(json);
              const words =
                textContent.split(/\s+/).filter(Boolean).length || 0;
              const readingTime = Math.ceil(words / 200);

              onChange({
                ...updated,
                reading_time: readingTime,
                category_name: categories.find(
                  (c) => c.id === updated.category_id,
                )?.name,
              });
            }}
          />
        </div>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h3>Mídia</h3>
        <div className="form-group">
          <label className="form-label">Imagem de Capa</label>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            {formData.cover_image_path && (
              <img
                src={formData.cover_image_path}
                alt="Preview"
                style={{
                  width: "80px",
                  height: "60px",
                  borderRadius: "4px",
                  objectFit: "cover",
                }}
              />
            )}
            <label
              className="btn btn-ghost"
              style={{ cursor: "pointer", border: "1px dashed var(--border)" }}
            >
              <Upload size={18} />
              {uploading ? "Uploading..." : "Upload Image"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "cover_image_path")}
              />
            </label>
          </div>
          <input
            type="text"
            name="cover_image_alt"
            className="form-input"
            placeholder="Texto alternativo"
            value={formData.cover_image_alt}
            onChange={handleChange}
            style={{ marginTop: "0.5rem" }}
          />
        </div>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
              <option value="archived">Arquivado</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Categoria</label>
            <select
              name="category_id"
              className="form-select"
              value={formData.category_id}
              onChange={handleChange}
            >
              <option value="">Selecione a categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div
          className="form-group"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <input
            type="checkbox"
            name="is_featured"
            checked={formData.is_featured}
            onChange={handleChange}
          />
          <label className="form-label" style={{ marginBottom: 0 }}>
            Post em Destaque
          </label>
        </div>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h3>SEO</h3>
        <div className="form-group">
          <label className="form-label">Meta Title</label>
          <input
            type="text"
            name="meta_title"
            className="form-input"
            value={formData.meta_title}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Meta Description</label>
          <textarea
            name="meta_description"
            className="form-textarea"
            rows="2"
            value={formData.meta_description}
            onChange={handleChange}
          ></textarea>
        </div>
      </section>

      <div
        style={{
          position: "sticky",
          bottom: 0,
          padding: "1rem 0",
          background: "var(--bg-main)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          gap: "1rem",
        }}
      >
        <button type="submit" className="btn btn-primary">
          <Check size={20} />
          {formData.status === "published"
            ? "Atualizar & Publicar"
            : "Salvar Alterações"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => window.history.back()}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
