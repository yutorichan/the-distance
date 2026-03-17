import Link from "next/link";
import { ArrowLeft, Edit3, GitMerge, FileText, Trash2 } from "lucide-react";
import db from "@/lib/db";
import { notFound } from "next/navigation";
import { deletePost } from "@/app/actions";
import { DeletePostButton } from "@/components/DeletePostButton";

// Mock logged-in user
const CURRENT_USER_ID = "user-nakasako";

export default async function ProfilePage() {
  const user = await db.user.findUnique({
    where: { id: CURRENT_USER_ID },
    include: {
      posts: {
        orderBy: { createdAt: "desc" }
      },
      proposals: {
        include: {
          post: true
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!user) notFound();

  // Deduplicate participated posts (a user might have multiple proposals on the same post)
  const participatedPostsMap = new Map();
  user.proposals.forEach(proposal => {
    if (!participatedPostsMap.has(proposal.postId)) {
      participatedPostsMap.set(proposal.postId, proposal.post);
    }
  });
  const participatedPosts = Array.from(participatedPostsMap.values());

  return (
    <div className="min-h-screen relative bg-canvas pb-20">
      {/* Top Navigation Minimal */}
      <nav className="fixed top-0 w-full bg-canvas/80 backdrop-blur-md border-b border-border/50 z-50">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-sans font-medium text-ink-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            トップへ
          </Link>
          <div className="font-serif font-black text-xl tracking-tighter text-ink flex items-center absolute left-1/2 -translate-x-1/2">
            <span className="bg-ink text-surface px-2.5 py-1 mr-1.5 rounded-full text-sm">the</span> distance
          </div>
        </div>
      </nav>

      <main className="pt-24 max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Profile Header */}
        <header className="mb-16 flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-24 h-24 rounded-full bg-accent/10 border-2 border-accent/20 flex items-center justify-center text-accent font-serif text-4xl shadow-sm">
            {user.avatarLetter}
          </div>
          <div>
            <h1 className="text-3xl font-sans font-bold text-ink mb-1">{user.name}</h1>
            <p className="text-ink-muted font-serif text-sm">
              {user.posts.length} 個のベーステキスト · {user.proposals.length} 回の提案
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Section: Authored Posts */}
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-100">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink-muted uppercase tracking-widest mb-6">
              <Edit3 className="w-4 h-4" />
              あなたが撒いた種
            </h2>
            
            <div className="space-y-4">
              {user.posts.length === 0 ? (
                <div className="text-ink-muted/60 text-sm font-serif p-6 bg-surface border border-border/50 rounded-xl">
                  まだベーステキストを作成していません。
                </div>
              ) : (
                user.posts.map(post => (
                  <div key={post.id} className="relative group/card">
                    <Link 
                      href={`/${post.id}`} 
                      className="block bg-surface border border-border/50 rounded-xl p-5 hover:border-accent/40 hover:shadow-sm transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-sm font-bold tracking-wider ${post.status === 'completed' ? 'bg-slate-100 text-slate-500' : 'bg-green-50 text-green-700'}`}>
                          {post.status === 'completed' ? '完成' : '執筆中'}
                        </span>
                        <span className="text-xs text-ink-muted">{post.createdAt.toLocaleDateString("ja-JP")}</span>
                      </div>
                      <h3 className="font-serif font-bold text-ink text-lg leading-snug mb-2 group-hover:text-accent transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm font-serif text-ink-muted line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </Link>
                    
                    {/* Delete Button (Visible on Hover) */}
                    <DeletePostButton postId={post.id} />
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Section: Participated Posts */}
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink-muted uppercase tracking-widest mb-6">
              <GitMerge className="w-4 h-4" />
              あなたが育てた距離
            </h2>
            
            <div className="space-y-4">
              {participatedPosts.length === 0 ? (
                <div className="text-ink-muted/60 text-sm font-serif p-6 bg-surface border border-border/50 rounded-xl">
                  まだ他の人のテキストに提案していません。
                </div>
              ) : (
                participatedPosts.map(post => (
                  <Link 
                    key={post.id} 
                    href={`/${post.id}`} 
                    className="block bg-surface border border-border/50 rounded-xl p-5 hover:border-accent/40 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-3 h-3 text-ink-muted" />
                      <span className="text-xs text-ink-muted">{post.createdAt.toLocaleDateString("ja-JP")}</span>
                    </div>
                    <h3 className="font-serif font-bold text-ink text-lg leading-snug mb-2 group-hover:text-accent transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm font-serif text-ink-muted line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
