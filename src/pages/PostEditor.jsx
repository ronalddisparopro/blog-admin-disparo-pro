import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import PostForm from "../components/PostForm";
import PostPreview from "../components/PostPreview";

export default function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [previewData, setPreviewData] = useState({});
  const [loading, setLoading] = useState(id ? true : false);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*, post_categories(category_id, categories(name))")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching post:", error);
      alert("Error loading post");
      navigate("/posts");
    } else {
      const formattedData = {
        ...data,
        category_id:
          data.category_id || data.post_categories?.[0]?.category_id || "",
        category_name: data.post_categories?.[0]?.categories?.name,
      };
      setInitialData(formattedData);
      setPreviewData(formattedData);
    }
    setLoading(false);
  };

  const handleSave = async (formData) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("Você precisa estar logado para salvar.");
      return;
    }
    const author_id = user.id;

    const postData = {
      ...formData,
      author_id: author_id,
      category_id: formData.category_id || null, // Ensure empty string is null for UUID
      reading_time: formData.reading_time || 0,
      content_format: formData.content_format || "markdown",
    };

    // Remove UI-only fields
    delete postData.category_name;
    delete postData.categories;
    delete postData.og_image; // Only if it's empty or handling separately

    let result;
    if (id) {
      result = await supabase.from("posts").update(postData).eq("id", id);
    } else {
      // Generate slug for new posts if not provided (though rules say slug is not editable)
      // We expect the database to have a trigger or we generate it here
      const slug = formData.title
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
      result = await supabase
        .from("posts")
        .insert([{ ...postData, slug }])
        .select();
    }

    if (result.error) {
      alert("Error saving post: " + result.error.message);
    } else {
      const postId = id || result.data?.[0]?.id;
      if (postId && formData.category_id) {
        // Update post_categories join table
        await supabase.from("post_categories").delete().eq("post_id", postId);
        await supabase
          .from("post_categories")
          .insert([{ post_id: postId, category_id: formData.category_id }]);
      }
      alert("Post saved successfully!");
      navigate("/posts");
    }
  };

  if (loading) return <div>Loading editor...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: "1rem" }}>
        {id ? "Edit Post" : "Create New Post"}
      </h1>
      <div className="editor-layout">
        <PostForm
          initialData={initialData}
          onSave={handleSave}
          onChange={(data) => setPreviewData(data)}
        />
        <PostPreview data={previewData} />
      </div>
    </div>
  );
}
