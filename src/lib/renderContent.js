import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

export function renderContent(json) {
  if (!json) return "";

  // If it's still a string (old format), return as is
  if (typeof json === "string") return json;

  // Handle migrated WordPress format {"html": "..."}
  if (json && typeof json === "object" && json.html) return json.html;

  try {
    return generateHTML(json, [
      StarterKit,
      Link.configure({
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    ]);
  } catch (error) {
    console.error("Error rendering Tiptap content:", error);
    return "";
  }
}
