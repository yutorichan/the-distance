import { BasePost } from "@/components/BasePost";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import db from "@/lib/db";
import { notFound } from "next/navigation";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const post = await db.post.findUnique({
    where: { id },
    include: { author: true },
  });

  if (!post) {
    notFound();
  }

  const postData = {
    id: post.id,
    title: post.title,
    author: post.author.name,
    date: post.createdAt.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    contributorCount: post.contributorCount,
    wordCount: post.wordCount,
    content: post.content,
  };

  return (
    <div className="min-h-screen relative bg-canvas">
      {/* Top Navigation Minimal */}
      <nav className="fixed top-0 w-full bg-canvas/80 backdrop-blur-md border-b border-border/50 z-50">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-sans font-medium text-ink-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            一覧に戻る
          </Link>
          <div className="font-serif font-black text-xl tracking-tighter text-ink flex items-center absolute left-1/2 -translate-x-1/2">
            <span className="bg-ink text-surface px-2.5 py-1 mr-1.5 rounded-full text-sm">the</span> distance
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-14">
        <BasePost {...postData} />
      </main>
    </div>
  );
}
