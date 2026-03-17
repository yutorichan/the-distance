import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const BASE_CONTENT = `文章を書くという行為は、長らく「自己表現」や「所有物」の生産として捉えられてきた。しかし、すべてのテキストが過去の文脈から生まれている以上、完全なオリジナルなど存在しない。我々は常に先人たちの肩に乗り、少しだけ景色を前に進めているに過ぎない。

AIが数秒で整理されたテキストを出力する時代において、結果としての「完成された文章」の価値は相対的に低下しつつある。それは「情報」としては有用だが、「文化」としては均質化へ向かう引力を持っている。

だからこそ今、結果ではなく「過程」に価値を置くアプローチが必要だ。ひとつの思想的種（ベーステキスト）に対して、多様な他者が自分なりの視点で差分（ディフ）を提示する。その微細な変更の履歴——「誰がどこを削り、誰がどこに言葉を足したのか」という推敲のプロセスそのものが、新しい時代の作品の形になるのではないだろうか。

このプラットフォームは、文章の「所有権」を解体し、「貢献」の軌跡を祝福するための場所だ。参加者は、ベースとなるテキストの意図を汲み取りながら、自分なりの距離を前に進める。その距離の積み重ねこそが、人間による真のオリジナリティとなる。`;

async function main() {
  // Create Main User
  const nakasako = await prisma.user.upsert({
    where: { id: 'user-nakasako' },
    update: {},
    create: {
      id: 'user-nakasako',
      name: 'T. Nakasako',
      avatarLetter: 'T',
    },
  })

  // Create Other Users
  const tanaka = await prisma.user.upsert({
    where: { id: 'user-tanaka' },
    update: {},
    create: {
      id: 'user-tanaka',
      name: 'R. Tanaka',
      avatarLetter: 'R',
    },
  })

  const watanabe = await prisma.user.upsert({
    where: { id: 'user-watanabe' },
    update: {},
    create: {
      id: 'user-watanabe',
      name: 'S. Watanabe',
      avatarLetter: 'S',
    },
  })
  
  const sato = await prisma.user.upsert({
    where: { id: 'user-sato' },
    update: {},
    create: {
      id: 'user-sato',
      name: 'Y. Sato',
      avatarLetter: 'Y',
    },
  })

  const kawahara = await prisma.user.upsert({
    where: { id: 'user-kawahara' },
    update: {},
    create: {
      id: 'user-kawahara',
      name: 'M. Kawahara',
      avatarLetter: 'M',
    },
  })

  // Create Base Post 1
  const post1 = await prisma.post.upsert({
    where: { id: 'post-1' },
    update: {},
    create: {
      id: 'post-1',
      title: 'AIと資本主義以降の「書くこと」について',
      excerpt: '文章を書くという行為は、長らく「自己表現」や「所有物」の生産として捉えられてきた。しかし、すべてのテキストが過去の...',
      content: BASE_CONTENT,
      status: 'writing',
      authorId: nakasako.id,
      contributorCount: 12,
      wordCount: 1200,
    },
  })

  // Create Proposals for Post 1
  await prisma.proposal.create({
    data: {
      postId: post1.id,
      authorId: tanaka.id,
      proposalType: 'replace',
      targetContext: 'ひとつの思想的種（ベーステキスト）に対して、多様な他者が自分なりの視点で差分（ディフ）を提示する。',
      isAdopted: false,
      upvotes: 24,
      diffsJson: JSON.stringify([
        { type: "unchanged", text: "だからこそ今、結果ではなく「過程」に価値を置くアプローチが必要だ。" },
        { type: "removed", text: "ひとつの思想的種（ベーステキスト）に対して、多様な他者が自分なりの視点で差分（ディフ）を提示する。" },
        { type: "added", text: "単一の完成品を競い合うのではなく、ひとつの思想的な種（ベーステキスト）に対し、複数の視点から継続的な差分（ディフ）を提案し続けること。" },
      ])
    }
  })

  await prisma.proposal.create({
    data: {
      postId: post1.id,
      authorId: watanabe.id,
      proposalType: 'replace',
      targetContext: 'それは「情報」としては有用だが、「文化」としては均質化へ向かう引力を持っている。',
      isAdopted: true,
      upvotes: 89,
      diffsJson: JSON.stringify([
        { type: "unchanged", text: "AIが数秒で整理されたテキストを出力する時代において、結果としての「完成された文章」の価値は相対的に低下しつつある。" },
        { type: "added", text: "それは「情報」としては有用だが、「文化」としては均質化へ向かう引力を持っている。" },
      ])
    }
  })

  // Create additional mock posts for feed
  await prisma.post.upsert({
    where: { id: 'post-2' },
    update: {},
    create: {
      id: 'post-2',
      title: '「働くこと」の再定義：労働と遊びの境界',
      excerpt: '生活を維持するための苦役として労働を捉える時代は終わりつつある。もしすべての基本的生活ニーズがベーシックインカム等で...',
      content: '生活を維持するための苦役として労働を捉える時代は終わりつつある...',
      status: 'writing',
      authorId: sato.id,
      contributorCount: 34,
      wordCount: 2500,
    },
  })

  await prisma.post.upsert({
    where: { id: 'post-3' },
    update: {},
    create: {
      id: 'post-3',
      title: '新しい都市デザインの思想：所有しない空間',
      excerpt: '私有財産としての不動産という概念が、都市の流動性を著しく阻害している。我々は共有コモンズとして機能する公共空間を...',
      content: '私有財産としての不動産という概念が、都市の流動性を著しく阻害している。我々は共有コモンズとして機能する公共空間を...',
      status: 'writing',
      authorId: kawahara.id,
      contributorCount: 8,
      wordCount: 800,
    },
  })

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
