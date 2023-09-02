"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Post from "../utils/Post";
import InfiniteScroll from "react-infinite-scroll-component";

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
  replies: Post[];
  reply: Post;
  replyId?: number;
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
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const getData = () => {
    fetch(`/api/search?params=${search}&skip=${skip}`)
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts);
        setSkip(skip + 1);
        if (data.noMore) setHasMore(false);
      });
  };
  useEffect(() => {
    getData();
  }, [search]);

  return (
    <div>
      {posts && (
        <>
          <>
            <InfiniteScroll
              dataLength={posts.length}
              next={getData}
              hasMore={hasMore}
              loader={<div>Loading</div>}
            >
              {posts.map((post) => (
                <Post post={post} key={post.id} />
              ))}
            </InfiniteScroll>
          </>
        </>
      )}
    </div>
  );
}
