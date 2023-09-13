"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Post from "../utils/Post";
import InfiniteScroll from "react-infinite-scroll-component";

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

export default function Search() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>(null!);
  const search = searchParams.get("params")!.replace("#", "%23");

  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const getData = useCallback(() => {
    if (hasMore) {
      console.log(search);
      fetch(`/api/search?params=${search}&skip=${skip}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("ok!");
          setPosts(data.posts);
          setSkip(skip + 1);
          if (data.noMore) setHasMore(false);
        });
    }
  }, [hasMore, search, skip]);

  useEffect(() => {
    getData();
  }, [search, getData]);

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
