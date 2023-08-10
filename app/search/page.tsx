"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Post from "../utils/Post";

interface User {
  id: number;
  username: string;
  description: string;
  email: string;
  displayname: string;
  avatar: string;
  banner: string;
  posts: Post[];
  likes: Like[];
  reposts: Repost[];
}

interface Post {
  author: User;
  id: number;
  createdAt: string;
  content: string;
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

export default function Search() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>(null!);
  const search = searchParams.get("params");

  useEffect(() => {
    fetch(`/api/search?params=${search}`)
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts);
      });
  }, [search]);

  return (
    <div>
      {posts && (
        <>
          <>
            {posts.map((post) => (
              <Post post={post} key={post.id} />
            ))}
          </>
        </>
      )}
    </div>
  );
}
