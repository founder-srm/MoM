import type React from "react";

export function MomRenderer({ text }: { text: string }) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line === "---") {
      elements.push(<hr key={i} className="border-t-2 border-border my-8" />);
      i++;
      continue;
    }

    if (line.startsWith("| ")) {
      const tableRows = [];
      let j = i;
      while (j < lines.length && lines[j].startsWith("| ")) {
        tableRows.push(lines[j]);
        j++;
      }

      elements.push(
        <div key={i} className="mb-6 overflow-x-auto border-2 border-border">
          <table className="w-full text-left text-base">
            <tbody>
              {tableRows.map((row, rIdx) => {
                const cells = row
                  .split("|")
                  .filter((c) => c.trim())
                  .map((c) => c.trim());
                if (cells[0].startsWith("---")) return null;

                const isHeader = rIdx === 0;
                return (
                  <tr
                    key={rIdx}
                    className={isHeader ? "bg-muted" : "border-t border-border"}
                  >
                    {cells.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`py-3 px-4 ${isHeader ? "font-bold uppercase tracking-wider text-xs text-muted-foreground" : "text-foreground"}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>,
      );
      i = j;
      continue;
    }

    // Bold starting line (e.g. **Agenda:**)
    const boldMatch = line.match(/^\*\*(.*)\*\*:(.*)$/);
    if (boldMatch) {
      elements.push(
        <p key={i} className="my-3 text-lg leading-relaxed text-foreground">
          <strong className="font-bold text-primary uppercase tracking-tighter">
            {boldMatch[1]}:
          </strong>
          {boldMatch[2]}
        </p>,
      );
      i++;
      continue;
    }

    // Inline bold text
    if (line.trim()) {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      elements.push(
        <p key={i} className="my-2 text-lg leading-relaxed text-foreground">
          {parts.map((p, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="font-bold text-primary">
                {p}
              </strong>
            ) : (
              p
            ),
          )}
        </p>,
      );
    }

    i++;
  }

  return <div className="space-y-2">{elements}</div>;
}
