"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createNewBaseText(title: string, content: string) {
  const post = await db.post.create({
    data: {
      title,
      // Create a simple excerpt
      excerpt: content.length > 80 ? content.substring(0, 80) + "..." : content,
      content,
      status: "writing",
      authorId: "user-nakasako",
      contributorCount: 1,
      wordCount: content.replace(/\s+/g, "").length,
    },
  });
  
  revalidatePath('/');
  return post.id;
}

export async function createProposal(
  postId: string,
  proposalType: string,
  targetContext: string,
  diffsJson: string
) {
  // Use 'user-nakasako' as the mock logged-in user
  const proposal = await db.proposal.create({
    data: {
      postId,
      authorId: "user-nakasako",
      proposalType,
      targetContext,
      diffsJson,
      isAdopted: false,
      upvotes: 1,
    },
  });

  revalidatePath(`/${postId}/collaborate`);
  return proposal;
}

export async function adoptProposal(proposalId: string, postId: string, newBaseText: string) {
  // 1. Update proposal to adopted
  await db.proposal.update({
    where: { id: proposalId },
    data: { isAdopted: true },
  });

  // 2. Update post base text
  await db.post.update({
    where: { id: postId },
    data: { content: newBaseText },
  });

  revalidatePath(`/${postId}/collaborate`);
  revalidatePath(`/${postId}`);
}

export async function undoAdoptProposal(proposalId: string, postId: string, newBaseText: string) {
  // 1. Update proposal to un-adopted
  await db.proposal.update({
    where: { id: proposalId },
    data: { isAdopted: false },
  });

  // 2. Update post base text
  await db.post.update({
    where: { id: postId },
    data: { content: newBaseText },
  });

  revalidatePath(`/${postId}/collaborate`);
  revalidatePath(`/${postId}`);
}

export async function updatePostStatus(postId: string, status: "writing" | "completed") {
  await db.post.update({
    where: { id: postId },
    data: { status },
  });

  revalidatePath(`/${postId}/collaborate`);
  revalidatePath(`/${postId}`);
}

export async function deletePost(postId: string) {
  // First delete associated proposals due to foreign key constraints if needed
  // SQLite with Prisma usually handles this if defined, or we do it manually
  await db.proposal.deleteMany({
    where: { postId },
  });

  await db.post.delete({
    where: { id: postId },
  });

  revalidatePath('/');
  revalidatePath('/profile');
}

export async function deleteProposal(proposalId: string, postId: string) {
  await db.proposal.delete({
    where: { id: proposalId },
  });

  revalidatePath(`/${postId}/collaborate`);
}
