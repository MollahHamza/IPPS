import React from 'react';

// Renders article text without ever injecting HTML, so content can't run scripts.
// Supported formatting (also explained in the admin editor):
//   blank line      -> new paragraph
//   ## Heading      -> sub-heading (### for a smaller one)
//   > quote         -> pull quote
//   - item          -> bullet list
//   **bold**        -> bold text
//   https://…       -> clickable link

const INLINE = /(\*\*[^*]+\*\*|https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"])/g;

export function renderInline(text) {
  return text.split(INLINE).map((part, i) => {
    if (!part) return null;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (/^https?:\/\//.test(part)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer">
          {part}
        </a>
      );
    }
    return part;
  });
}

function withLineBreaks(text, keyPrefix) {
  return text.split('\n').flatMap((line, i) => (i === 0 ? [renderInline(line)] : [<br key={`${keyPrefix}-${i}`} />, renderInline(line)]));
}

export function parseBlocks(content) {
  return (content || '')
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split('\n');
      if (/^###\s+/.test(block) && lines.length === 1) return { type: 'h3', text: block.replace(/^###\s+/, '') };
      if (/^##\s+/.test(block) && lines.length === 1) return { type: 'h2', text: block.replace(/^##\s+/, '') };
      if (lines.every((l) => /^>\s?/.test(l))) return { type: 'quote', text: lines.map((l) => l.replace(/^>\s?/, '')).join('\n') };
      if (lines.every((l) => /^[-*]\s+/.test(l))) return { type: 'list', items: lines.map((l) => l.replace(/^[-*]\s+/, '')) };
      return { type: 'p', text: block };
    });
}

export default function ArticleBody({ content }) {
  return (
    <div className="article-body">
      {parseBlocks(content).map((block, i) => {
        switch (block.type) {
          case 'h2':
            return <h2 key={i}>{renderInline(block.text)}</h2>;
          case 'h3':
            return <h3 key={i}>{renderInline(block.text)}</h3>;
          case 'quote':
            return <blockquote key={i}>{withLineBreaks(block.text, i)}</blockquote>;
          case 'list':
            return (
              <ul key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          default:
            return <p key={i}>{withLineBreaks(block.text, i)}</p>;
        }
      })}
    </div>
  );
}
