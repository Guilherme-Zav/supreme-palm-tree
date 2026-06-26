"use client";

/**
 * Renderizador de Markdown minimalista e seguro (sem dependências).
 * Escapa HTML primeiro e depois aplica um subconjunto de markdown:
 * títulos, negrito, itálico, código inline, links, listas, hr e parágrafos.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(text: string): string {
  let t = escapeHtml(text);
  // código inline
  t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
  // negrito
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  // itálico
  t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  // links [texto](url)
  t = t.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$1" rel="noopener noreferrer" target="_blank">$1</a>'.replace(
      'href="$1"',
      'href="$2"',
    ),
  );
  return t;
}

function toHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let listType: "ul" | "ol" | null = null;

  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");

    if (!line.trim()) {
      closeList();
      continue;
    }

    // hr
    if (/^(\s*[-*_]){3,}\s*$/.test(line) && !/^\s*[-*]\s/.test(line)) {
      closeList();
      out.push("<hr/>");
      continue;
    }

    // títulos
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      closeList();
      const level = Math.min(h[1].length, 3);
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
      continue;
    }

    // lista ordenada
    const ol = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (ol) {
      if (listType !== "ol") {
        closeList();
        out.push("<ol>");
        listType = "ol";
      }
      out.push(`<li>${inline(ol[1])}</li>`);
      continue;
    }

    // lista não ordenada
    const ul = /^\s*[-*•]\s+(.*)$/.exec(line);
    if (ul) {
      if (listType !== "ul") {
        closeList();
        out.push("<ul>");
        listType = "ul";
      }
      out.push(`<li>${inline(ul[1])}</li>`);
      continue;
    }

    closeList();
    out.push(`<p>${inline(line)}</p>`);
  }

  closeList();
  return out.join("\n");
}

export default function Markdown({
  content,
  className = "",
  typing = false,
}: {
  content: string;
  className?: string;
  typing?: boolean;
}) {
  return (
    <div
      className={`prose-output ${typing ? "typing-caret" : ""} ${className}`}
      dangerouslySetInnerHTML={{ __html: toHtml(content) }}
    />
  );
}
