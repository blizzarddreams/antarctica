"use client";

import { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
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

export default function Explore() {
  const [posts, setPosts] = useState<Post[]>([]!);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const getData = useCallback(() => {
    fetch(`/api/explore?skip=${skip}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setPosts([...posts.concat(data.posts)]);
        setSkip(skip + 1);
        if (data.noMore) setHasMore(false);
      });
  }, [posts, skip]);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <>
      {posts && (
        <>
          <p className="font-bold text-4xl">Explore</p>
          <InfiniteScroll
            dataLength={posts.length}
            next={getData}
            hasMore={hasMore}
            loader={<div>Loading</div>}
          >
            {posts.map((post, i) => (
              <Post post={post} key={i} />
            ))}
          </InfiniteScroll>
        </>
      )}
    </>
  );
}
