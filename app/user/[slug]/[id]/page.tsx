import Post from "@/app/utils/Post";
import { getCldImageUrl } from "next-cloudinary";
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
  reply: Post;
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
  console.log(data);
  return data.post;
}

export async function generateMetadata({ params }: { params: { id: number } }) {
  const post: Post = await getData(params.id);
  if (!post) return notFound();
  const title = `${
    post.author.displayname ? post.author.displayname : post.author.username
  } (@${post.author.username}) / antarctica`;
  if (post.image) {
    return {
      title: title,
      description: post.content,
      openGraph: {
        url: `${process.env.NEXTAUTH_URL}/@${post.author.username}`,
        images: [
          `${getCldImageUrl({
            width: 1000,
            height: 1000,
            src: post.image,
          })}`,
        ],
        title: title,
        siteName: "antarctica",
        description: post.content,
        card: "summary_large_image",
      },
      twitter: {
        title: title,
        description: post.content,
        images: [
          `${getCldImageUrl({
            width: 1000,
            height: 1000,
            src: post.image,
          })}`,
        ],
        siteName: "antarctica",
        card: "summary_large_image",
        creator: "@arcaninebellies",
        creatorId: "1292500579604996096",
      },
    };
  } else {
    return {
      title: title,
      description: post.content,
      openGraph: {
        url: `${process.env.NEXTAUTH_URL}/@${post.author.username}`,
        images: [
          `${getCldImageUrl({
            width: 100,
            height: 100,
            src: post.author.avatar,
          })}`,
        ],
        type: "website",
        title: title,
        siteName: "antarctica",
        description: post.content,
      },
      twitter: {
        title: title,
        description: post.content,
        images: [
          `${getCldImageUrl({
            width: 100,
            height: 100,
            src: post.author.avatar,
          })}`,
        ],
        siteName: "antarctica",
        card: "summary",
        creator: "@arcaninebellies",
        creatorId: "1292500579604996096",
      },
    };
  }
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
