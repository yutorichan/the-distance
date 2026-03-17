import { notFound } from "next/navigation";
import db from "@/lib/db";
import CollaborateClient from "@/components/CollaborateClient";

export default async function CollaboratePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const post = await db.post.findUnique({
    where: { id },
    include: {
      author: true,
      proposals: {
        include: {
          author: true,
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });

  if (!post) {
    notFound();
  }

  const initialProposals = post.proposals.map(p => ({
    id: p.id,
    author: p.author.name,
    avatarLetter: p.author.avatarLetter,
    timestamp: p.createdAt.toLocaleDateString("ja-JP"),
    initialUpvotes: p.upvotes,
    isAdopted: p.isAdopted,
    proposalType: p.proposalType as "replace" | "insert",
    targetContext: p.targetContext,
    diffs: JSON.parse(p.diffsJson),
  }));

  return (
    <CollaborateClient 
      postId={post.id}
      initialBaseText={post.content}
      initialPostStatus={post.status as "writing" | "completed"}
      initialProposals={initialProposals}
    />
  );
}
