"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Post from "../utils/Post";

interface User {
  id: number;
  email: string;
  username: string;
  displayname: string;
  description: string;
  avatar: string;
  banner: string;
  posts: Post[];
}

interface Post {
  id: number;
  author: User;
  content: string;
  createdAt: string;
  isRepost: boolean;
  postCreatedAt: string;
  likes: Like[];
  reposts: Repost[];
}

interface Like {
  author: User;
  post: Post;
}

interface Repost {
  author: User;
  post: Post;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>(null!);
  useEffect(() => {
    if (session) {
      fetch("/api/dashboard")
        .then((res) => res.json())
        .then((data) => {
          setPosts(data.posts);
        });
    }
  }, [session]);
  return (
    <>
      {posts && (
        <>
          {posts.map((post, i) => (
            <Post post={post} key={i} />
          ))}
        </>
      )}
    </>
  );
}
