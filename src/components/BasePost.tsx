import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, Users } from "lucide-react";

interface BasePostProps {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
  contributorCount: number;
  wordCount: number;
}

export function BasePost({
  id,
  title,
  author,
  date,
  content,
  contributorCount,
  wordCount,
}: BasePostProps) {
  const readTime = Math.ceil(wordCount / 400); // Rough estimate for Japanese text

  return (
    <article className="max-w-2xl mx-auto px-4 py-12 sm:py-20">
      <header className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight tracking-tight text-ink">
          {title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm font-sans text-ink-muted mb-8 border-b border-border pb-8">
          <div className="flex items-center gap-2 font-medium text-ink">
            <div className="w-8 h-8 rounded-full bg-ink text-surface flex items-center justify-center font-bold text-xs">
              {author.charAt(0)}
            </div>
            {author}
          </div>
          <span className="opacity-50">•</span>
          <time>{date}</time>
          <span className="opacity-50">•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>約 {readTime} 分で読めます</span>
          </div>
          <span className="opacity-50">•</span>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{contributorCount} 人の共同推進者</span>
          </div>
        </div>
      </header>

      <div className="prose prose-lg max-w-none text-ink text-lg leading-loose space-y-8 mb-16">
        {content.split("\n\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <footer className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6 px-4 py-6 bg-surface rounded-xl shadow-sm border border-border/50">
        <div className="text-center sm:text-left">
          <h3 className="font-sans font-bold text-lg mb-1">文章を進める</h3>
          <p className="font-sans text-sm text-ink-muted">
            この文章にあなたの視点を加え、新しい距離へ進めましょう。
          </p>
        </div>
        <Link
          href={`/${id}/collaborate`}
          className="inline-flex items-center gap-2 bg-ink text-surface px-6 py-3 rounded-full font-sans font-medium hover:bg-primary-hover transition-colors shadow-md hover:shadow-lg hover:-translate-y-0.5 duration-200"
        >
          協働画面へ <ArrowRight className="w-4 h-4" />
        </Link>
      </footer>
    </article>
  );
}
