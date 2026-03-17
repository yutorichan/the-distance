"use client";

import React, { useState } from "react";
import { Trash2, Check, X } from "lucide-react";
import { deletePost } from "@/app/actions";

interface DeletePostButtonProps {
  postId: string;
}

export function DeletePostButton({ postId }: DeletePostButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    deletePost(postId);
  };

  const handleStopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const toggleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsConfirming(!isConfirming);
  };

  return (
    <div 
      className={`absolute top-4 right-4 transition-all duration-200 z-30 ${isConfirming ? 'opacity-100 ring-1 ring-red-200 bg-white rounded-lg shadow-sm p-1 flex items-center gap-1' : 'opacity-0 group-hover/card:opacity-100'}`}
      onMouseDown={handleStopPropagation}
      onMouseUp={handleStopPropagation}
    >
      {isConfirming ? (
        <>
          <span className="text-[10px] font-bold text-red-600 px-2 uppercase tracking-tighter">削除しますか？</span>
          <button
            onClick={handleDelete}
            className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            title="削除確定"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleConfirm}
            className="p-1.5 bg-slate-100 text-slate-500 rounded-md hover:bg-slate-200 transition-colors"
            title="キャンセル"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </>
      ) : (
        <button 
          type="button"
          onClick={toggleConfirm}
          className="p-2 text-ink-muted hover:text-red-500 hover:bg-red-50 rounded-full transition-colors relative z-40"
          title="記事を削除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
