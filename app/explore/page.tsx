"use client";

import { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Post from "../utils/Post";
import { ScaleLoader } from "react-spinners";

type User = {
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
};

type Post = {
  author: User;
  id: number;
  createdAt: string;
  content: string;
  likes: Like[];
  reposts: Repost[];
  replies: Post[];
  reply: Post;
  replyId?: number;
};

type Like = {
  author: User;
  post: Post;
};

type Repost = {
  author: User;
  post: Post;
};

export default function Explore() {
  const [posts, setPosts] = useState<Post[]>([]!);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const getData = useCallback(() => {
    if (hasMore) {
      fetch(`/api/explore?skip=${skip}`)
        .then((res) => res.json())
        .then((data) => {
          setPosts([...posts.concat(data.posts)]);
          setSkip(skip + 1);
          if (data.noMore) setHasMore(false);
        });
    }
  }, [posts, skip, hasMore]);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <>
      {posts.length && (
        <div className="mt-10 flex flex-col items-center justify-center">
          <p className="text-4xl font-bold">Explore</p>
          <InfiniteScroll
            dataLength={posts.length}
            next={getData}
            hasMore={hasMore}
            loader={
              <div className="flex w-full flex-row justify-center">
                <ScaleLoader color="#36d7b7" />{" "}
              </div>
            }
          >
            {posts.map((post, i) => (
              <Post post={post} key={i} />
            ))}
          </InfiniteScroll>
        </div>
      )}
    </>
  );
}
