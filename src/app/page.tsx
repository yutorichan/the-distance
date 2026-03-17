import Link from "next/link";
import { PenTool } from "lucide-react";
import { BubbleFeed } from "@/components/BubbleFeed";
import db from "@/lib/db";

export default async function Home() {
  const posts = await db.post.findMany({
    include: {
      author: true,
    },
    orderBy: {
      createdAt: 'desc',
    }
  });

  // Map to the format BubbleFeed expects
  const feedPosts = posts.length > 0 ? posts.map(post => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    author: post.author.name,
    date: post.createdAt.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    contributorCount: post.contributorCount,
    wordCount: post.wordCount,
  })) : [];

  return (
    <div className="min-h-screen relative bg-canvas">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full bg-canvas/80 backdrop-blur-md border-b border-border/50 z-50">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif font-black text-xl tracking-tighter text-ink flex items-center hover:opacity-80 transition-opacity">
            <span className="bg-ink text-surface px-2.5 py-1 mr-1.5 rounded-full text-sm">the</span> distance
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/profile" className="text-sm font-sans font-medium text-ink-muted hover:text-ink transition-colors">
              ログイン (T. Nakasako)
            </Link>
            <Link href="/new" className="flex items-center gap-2 bg-ink text-surface px-4 py-2 rounded-full text-sm font-sans font-medium hover:bg-primary-hover shadow-sm">
              <PenTool className="w-4 h-4" />
              投稿する
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
        <header className="mb-10 text-center relative z-10 pointer-events-none">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-ink mb-6 tracking-tight">
            ベーステキストを探す
          </h1>
          <p className="text-xl text-ink-muted font-serif">
            誰かと一緒に文章を書いてみましょう
          </p>
        </header>

        <BubbleFeed posts={feedPosts} />
      </main>
    </div>
  );
}
