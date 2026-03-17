"use client";

import React, { useState } from "react";
import { DiffViewer, type DiffLine } from "./DiffViewer";
import { Heart, UserPlus, GitMerge, Flag, Trash2, Check, X } from "lucide-react";

interface ProposalCardProps {
  id: string;
  author: string;
  avatarLetter: string;
  timestamp: string;
  diffs: DiffLine[];
  initialUpvotes: number;
  onAdopt?: (id: string) => void;
  onUndoAdopt?: (id: string) => void;
  onDelete?: (id: string) => void;
  isAdopted?: boolean;
}

export function ProposalCard({
  id,
  author,
  avatarLetter,
  timestamp,
  diffs,
  initialUpvotes,
  onAdopt,
  onUndoAdopt,
  onDelete,
  isAdopted = false,
}: ProposalCardProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [hasVoted, setHasVoted] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [isConfirmingWithdraw, setIsConfirmingWithdraw] = useState(false);

  const handleVote = () => {
    if (hasVoted) {
      setUpvotes((prev) => prev - 1);
    } else {
      setUpvotes((prev) => prev + 1);
    }
    setHasVoted(!hasVoted);
  };

  const handleReport = () => {
    if (confirm("この提案を通報しますか？")) {
      setIsReported(true);
      alert("通報を受け付けました。ご協力ありがとうございます。");
    }
  };

  return (
    <div className={`
      relative font-sans border rounded-2xl overflow-hidden shadow-sm transition-all duration-300
      ${isAdopted ? 'border-accent bg-accent/5 ring-1 ring-accent/20' : 'border-border bg-surface hover:shadow-md hover:border-border'}
    `}>
      {isAdopted && (
        <div className="absolute top-0 right-0 bg-accent text-surface text-xs font-bold px-3 py-1 rounded-bl-lg">
          採用済み
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
            {avatarLetter}
          </div>
          <div>
            <h4 className="font-semibold text-ink text-sm flex items-center gap-1.5">
              {author}
              <span className="text-xs font-normal text-ink-muted bg-slate-100 px-1.5 py-0.5 rounded">共同推進者</span>
            </h4>
            <p className="text-xs text-ink-muted mt-0.5">{timestamp}</p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1">
          {onDelete && !isAdopted && (
            <div className={`flex items-center gap-1 transition-all ${isConfirmingWithdraw ? 'bg-red-50 border border-red-100 rounded-full px-2 py-0.5' : ''}`}>
              {isConfirmingWithdraw ? (
                <>
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-tighter mr-1">取り下げますか？</span>
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(id);
                    }}
                    className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsConfirmingWithdraw(false);
                    }}
                    className="p-1 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsConfirmingWithdraw(true);
                  }}
                  className="p-2 rounded-full text-ink-muted/50 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="提案を取り下げる"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          <button
            onClick={handleReport}
            disabled={isReported}
            className={`p-2 rounded-full transition-colors ${
              isReported ? "text-red-400 cursor-not-allowed" : "text-ink-muted/50 hover:text-red-500 hover:bg-red-50"
            }`}
            title="通報する"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Diff Content */}
      <div className="p-5">
        <div className="mb-2 text-xs font-medium text-ink-muted uppercase tracking-wider">提案された変更</div>
        <DiffViewer diffs={diffs} />
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-3 border-t border-border/50 flex items-center justify-between bg-zinc-50/50">
        <button
          onClick={handleVote}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            hasVoted
              ? "text-red-500 bg-red-50 hover:bg-red-100"
              : "text-ink-muted hover:text-ink hover:bg-slate-100"
          }`}
        >
          <Heart className={`w-4 h-4 ${hasVoted ? "fill-current" : ""}`} />
          <span>{upvotes} 支持</span>
        </button>

        {!isAdopted && onAdopt && (
          <button
            onClick={() => onAdopt(id)}
            className="flex items-center gap-2 px-4 py-1.5 bg-ink text-surface rounded-full text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
          >
            <GitMerge className="w-4 h-4" />
            採用する
          </button>
        )}
        
        {isAdopted && onUndoAdopt && (
          <button
            onClick={() => onUndoAdopt(id)}
            className="flex items-center gap-2 px-4 py-1.5 border border-border/80 text-ink-muted rounded-full text-sm font-medium hover:text-ink hover:bg-slate-100 transition-colors"
          >
            元に戻す
          </button>
        )}
      </div>
    </div>
  );
}
