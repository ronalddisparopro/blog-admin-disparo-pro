import React, { useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Unlink,
} from "lucide-react";

const Toolbar = ({ editor }) => {
  if (!editor) return null;

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="tiptap-toolbar">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "is-active" : ""}
        title="Bold"
      >
        <Bold size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "is-active" : ""}
        title="Italic"
      >
        <Italic size={18} />
      </button>
      <div className="toolbar-divider" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive("heading", { level: 1 }) ? "is-active" : ""}
        title="Heading 1"
      >
        <Heading1 size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive("heading", { level: 2 }) ? "is-active" : ""}
        title="Heading 2"
      >
        <Heading2 size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive("heading", { level: 3 }) ? "is-active" : ""}
        title="Heading 3"
      >
        <Heading3 size={18} />
      </button>
      <div className="toolbar-divider" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "is-active" : ""}
        title="Bullet List"
      >
        <List size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? "is-active" : ""}
        title="Ordered List"
      >
        <ListOrdered size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive("blockquote") ? "is-active" : ""}
        title="Blockquote"
      >
        <Quote size={18} />
      </button>
      <div className="toolbar-divider" />
      <button
        type="button"
        onClick={setLink}
        className={editor.isActive("link") ? "is-active" : ""}
        title="Link"
      >
        <LinkIcon size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive("link")}
        title="Unlink"
      >
        <Unlink size={18} />
      </button>
    </div>
  );
};

export default function Editor({ content, onChange }) {
  // Helper to get compatible content for Tiptap
  const getInitialContent = (rawContent) => {
    if (rawContent && typeof rawContent === "object" && rawContent.html) {
      return rawContent.html;
    }
    return rawContent;
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Placeholder.configure({
        placeholder: "Comece a escrever sua história...",
      }),
    ],
    content: getInitialContent(content),
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  React.useEffect(() => {
    if (editor && content !== undefined && content !== null) {
      const targetContent = getInitialContent(content);
      const currentContent = editor.getJSON();

      if (typeof targetContent === "string") {
        // For HTML strings (like migrated posts), if editor is currently empty,
        // it's likely we just loaded the post.
        if (editor.isEmpty && targetContent.trim() !== "") {
          editor.commands.setContent(targetContent);
        }
      } else if (targetContent && typeof targetContent === "object") {
        // For JSON docs, sync only if they are different
        if (JSON.stringify(targetContent) !== JSON.stringify(currentContent)) {
          editor.commands.setContent(targetContent);
        }
      }
    }
  }, [content, editor]);

  return (
    <div className="tiptap-editor-container">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="tiptap-content-area" />
    </div>
  );
}
