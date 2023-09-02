import Post from "@/app/utils/Post";
import { notFound } from "next/navigation";

interface User {
  id: number;
  username: string;
  description: string;
  email: string;
  displayname: string;
  avatar: string;
  banner: string;
  posts: Post[];
}

interface Post {
  author: User;
  id: number;
  createdAt: string;
  content: string;
  likes: Like[];
  reposts: Repost[];
  isRepost?: boolean;
  postCreatedAt?: string;
  repostAuthor?: User;
  image?: string;
  replies: Post[];
}

interface Like {
  author: User;
  post: Post;
}

interface Repost {
  author: User;
  post: Post;
}
async function getData(id: number) {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/post?id=${id}`, {
    method: "GET",
  });
  const data = await res.json();
  return data.post;
}

export async function generateMetadata({ params }: { params: { id: number } }) {
  const post: Post = await getData(params.id);
  console.log("post");
  console.log(post);
  if (!post) return notFound();
  const title = `${
    post.author.displayname ? post.author.displayname : post.author.username
  } (@${post.author.username}) / antarctica`;
  return {
    title: title,
    description: post.content,
    openGraph: {
      url: `${process.env.NEXTAUTH_URL}/@${post.author.username}`,
      images: [`${process.env.NEXTAUTH_URL}/avatars/${post.author.avatar}`],
      type: "website",
      title: title,
      siteName: "antarctica",
      description: post.content,
    },
    twitter: {
      title: title,
      description: post.content,
      images: [`${process.env.NEXTAUTH_URL}/avatars/${post.author.avatar}`],
      siteName: "antarctica",
      card: "summary",
      creator: "@arcaninebellies",
      creatorId: "1292500579604996096",
    },
  };
}
export default async function ViewPost({ params }: { params: { id: number } }) {
  const post: Post = await getData(params.id);
  return (
    <div>
      {post && (
        <>
          <Post post={post} />
          {post.replies &&
            post.replies.map((reply) => <Post key={reply.id} post={reply} />)}
        </>
      )}
    </div>
  );
}
