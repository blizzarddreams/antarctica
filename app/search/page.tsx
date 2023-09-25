"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Post from "../utils/Post";
import InfiniteScroll from "react-infinite-scroll-component";
import { ScaleLoader } from "react-spinners";
import { Input } from "@/components/ui/input";

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
  const [search, setSearch] = useState<string>("");
  const params = searchParams.get("params")!;
  const router = useRouter();
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const getData = useCallback(() => {
    if (hasMore && params) {
      fetch(`/api/search?params=${params}&skip=${skip}`)
        .then((res) => res.json())
        .then((data) => {
          setPosts(data.posts);
          setSkip(skip + 1);
          if (data.noMore) setHasMore(false);
        });
    }
  }, [hasMore, params, skip]);

  useEffect(() => {
    getData();
  }, [params, getData]);

  const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      router.push(`/search?params=${search}`);
    }
  };

  return (
    <div className="mt-10 flex w-full flex-col items-center justify-center">
      <p className="text-4xl font-bold">Search</p>

      <Input
        value={search}
        onKeyDown={handleSubmit}
        onChange={(e) => setSearch(e.target.value)}
        className="my-4"
      />

      {posts && (
        <>
          <>
            <InfiniteScroll
              dataLength={posts.length}
              className="w-full"
              next={getData}
              hasMore={hasMore}
              loader={
                <div className="flex w-full flex-row justify-center">
                  <ScaleLoader color="#36d7b7" />{" "}
                </div>
              }
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
