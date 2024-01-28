"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import Post from "../utils/Post";
import InfiniteScroll from "react-infinite-scroll-component";
import { PusherClient } from "@/pusher";
import { ScaleLoader } from "react-spinners";
type User = {
  id: number;
  email: string;
  username: string;
  displayname: string;
  description: string;
  avatar: string;
  banner: string;
  posts: Post[];
};

type Post = {
  id: number;
  author: User;
  content: string;
  createdAt: string;
  isRepost: boolean;
  postCreatedAt: string;
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

export default function Dashboard() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]!);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const getData = useCallback(() => {
    if (session && hasMore) {
      fetch(`/api/dashboard?skip=${skip}`)
        .then((res) => res.json())
        .then((data) => {
          setPosts([...posts.concat(data.posts)]);
          setSkip(skip + 1);
          if (data.noMore) setHasMore(false);
        });
    }
  }, [session, skip, posts, hasMore]);

  useEffect(() => {
    getData();
  }, [getData]);

  useEffect(() => {
    if (session?.user?.email) {
      const channel = PusherClient.subscribe(`dashboard-${session.user.email}`);
      channel.bind("new message", (data: { post: Post }) => {
        setPosts([...[data.post].concat(posts)]);
      });
      channel.bind("delete message", (data: { post: Post }) => {
        setPosts([...posts.filter((post) => post.id !== data.post.id)]);
      });
    }
  }, [session, posts]);

  return (
    <>
      {posts && (
        <div className="mt-10 flex flex-col items-center justify-center">
          <p className="text-4xl font-bold">Dashboard</p>
          <InfiniteScroll
            dataLength={posts.length}
            next={getData}
            hasMore={hasMore}
            loader={
              <div className="flex w-full flex-row justify-center">
                <ScaleLoader color="#36d7b7" />{" "}
              </div>
            }
            endMessage={
              <div className="flex w-full flex-row justify-center">
                <p>You've reached the end of the road!</p>
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
