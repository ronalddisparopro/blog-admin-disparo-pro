import React from "react";
import { renderContent } from "../lib/renderContent";

export default function PostPreview({ data }) {
  const readingTime = data.reading_time || 0;

  return (
    <div className="preview-pane">
      <div className="preview-content">
        {data.cover_image_path && (
          <img
            src={data.cover_image_path}
            alt={data.cover_image_alt || "Cover"}
            className="preview-cover"
          />
        )}

        <h1 className="preview-title">{data.title || "Título do Post"}</h1>

        <div className="preview-meta">
          <span>{data.category_name || "Categoria"}</span>
          <span>•</span>
          <span>{readingTime} min de leitura</span>
          <span>•</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>

        {data.excerpt && (
          <p
            style={{
              fontSize: "1.25rem",
              color: "var(--text-muted)",
              marginBottom: "2rem",
              fontStyle: "italic",
            }}
          >
            {data.excerpt}
          </p>
        )}

        <div
          className="tiptap-content-render"
          dangerouslySetInnerHTML={{ __html: renderContent(data.content) }}
        />
      </div>
    </div>
  );
}
