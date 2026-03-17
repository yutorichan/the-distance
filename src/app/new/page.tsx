"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { createNewBaseText } from "@/app/actions";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setIsSubmitting(true);
    
    try {
      // The action returns the newly created post ID
      const newPostId = await createNewBaseText(title, content);
      router.push(`/${newPostId}`);
    } catch (error) {
      console.error("Failed to create post:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-canvas flex flex-col">
      {/* Top Navigation Minimal */}
      <nav className="fixed top-0 w-full bg-canvas/80 backdrop-blur-md border-b border-border/50 z-50">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-sans font-medium text-ink-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            一覧に戻る
          </Link>
          <div className="font-serif font-black text-xl tracking-tighter text-ink flex items-center">
            <span className="bg-ink text-surface px-2.5 py-1 mr-1.5 rounded-full text-sm">the</span> distance
          </div>
          <div className="w-[88px]"></div> {/* Spacer to center the logo */}
        </div>
      </nav>

      <main className="flex-1 pt-24 pb-32 max-w-3xl mx-auto w-full px-6 flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <header className="mb-12">
          <p className="text-sm font-bold text-ink-muted tracking-widest uppercase mb-4 opacity-60">
            Write a new base text
          </p>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="新しい思想の種（タイトル）"
            className="w-full text-4xl sm:text-5xl font-serif font-bold text-ink bg-transparent border-none outline-none placeholder:text-ink-muted/30"
            autoFocus
          />
        </header>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="ここから文章を書き始めます。完全なオリジナルを目指す必要はありません。あなたの視点から見た景色を置いてみてください..."
          className="flex-1 w-full text-lg sm:text-xl font-serif text-ink leading-[2.2] bg-transparent border-none outline-none resize-none placeholder:text-ink-muted/30"
        />

      </main>

      {/* Floating Action Button for Submission */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim() || isSubmitting}
          className="flex items-center gap-2 bg-ink text-surface px-8 py-4 rounded-full font-serif font-bold tracking-wide hover:bg-primary-hover hover:-translate-y-1 hover:shadow-xl transition-all disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:shadow-none shadow-lg"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-surface border-t-transparent animate-spin inline-block"></span>
              発芽中...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              この種を蒔く
            </span>
          )}
        </button>
      </div>
      
    </div>
  );
}
