import React from "react";
import { Quote } from "lucide-react";

export type DiffLine = {
  type: "added" | "removed" | "unchanged";
  text: string;
};

interface DiffViewerProps {
  diffs: DiffLine[];
}

export function DiffViewer({ diffs }: DiffViewerProps) {
  return (
    <div className="font-serif leading-loose text-lg text-ink bg-surface border border-border/50 rounded-xl px-6 py-6 shadow-sm relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-diff-add-text via-accent to-diff-remove-text opacity-40"></div>
      
      <div className="absolute top-4 right-4 text-ink-muted/20">
        <Quote className="w-8 h-8" />
      </div>

      <div className="relative z-10 space-y-3">
        {diffs.map((line, index) => {
          if (line.type === "added") {
            return (
              <span
                key={index}
                className="inline bg-diff-add-bg text-diff-add-text px-1 py-0.5 rounded-sm mx-1 font-medium transition-colors hover:bg-diff-add-bg/80"
                title="追加された表現"
              >
                {line.text}
              </span>
            );
          }
          if (line.type === "removed") {
            return (
              <span
                key={index}
                className="inline bg-diff-remove-bg text-diff-remove-text px-1 py-0.5 rounded-sm mx-1 line-through decoration-diff-remove-text/50 transition-colors hover:bg-diff-remove-bg/80 opacity-80"
                title="削除された表現"
              >
                {line.text}
              </span>
            );
          }
          return (
            <span key={index} className="inline text-ink/90">
              {line.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}
