"use client";

import { useEffect, useState } from "react";
import Post from "@/app/utils/Post";
import { useSession } from "next-auth/react";
import InfiniteScroll from "react-infinite-scroll-component";
import { PusherClient } from "@/pusher";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

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
  followers: Follow[];
  following: Follow[];
};

type Follow = {
  id: number;
  follower: User;
  following: User;
};

type Post = {
  author: User;
  id: number;
  createdAt: string;
  content: string;
  likes: Like[];
  reposts: Repost[];
  image?: string;
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

export default function UserPage({ params }: { params: { slug: string } }) {
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [user, setUser] = useState<User>(null!);
  const [skip, setSkip] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const { data: session } = useSession();
  const [tab, setTab] = useState<string>("posts");

  const getData = () => {
    if (hasMore) {
      fetch(`/api/profile?username=${params.slug}&skip=${skip}`)
        .then((res) => res.json())
        .then((data) => {
          setUser({
            ...data.user,
            posts: [...user.posts.concat(data.user.posts)],
          });
          setSkip(skip + 1);
          if (data.noMore) setHasMore(false);

          if (session) {
            fetch(`/api/follow?id=${data.user.id}`)
              .then((res) => res.json())
              .then((data) => {
                setIsFollowing(data.following);
              });
          }
        });
    }
  };
  useEffect(() => {
    fetch(`/api/profile?username=${params.slug}&skip=${skip}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) return notFound();
        setUser(data.user);
        if (session) {
          fetch(`/api/follow?id=${data.user.id}`)
            .then((res) => res.json())
            .then((data) => {
              setIsFollowing(data.following);
            });
        }
      });
  }, [params.slug, session, skip]);

  useEffect(() => {
    if (user) {
      const channel = PusherClient.subscribe(`profile-${user.username}`);
      channel.bind("new message", (data: { post: Post }) => {
        const posts = user.posts;
        posts.unshift(data.post);
        setUser({ ...user, posts: posts });
      });
      channel.bind("delete message", (data: { post: Post }) => {
        setUser({
          ...user,
          posts: user.posts.filter((post) => post.id !== data.post.id),
        });
      });
    }
  }, [user]);

  const followUser = () => {
    if (user) {
      fetch("/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ following: user.id }),
      })
        .then((res) => res.json())
        .then((data) => setIsFollowing(data.following));
    }
  };

  return (
    <div>
      {user && (
        <div>
          <div className="flex flex-col">
            <header
              className={`h-32 w-full bg-cover bg-center md:h-52 `}
              style={{
                backgroundImage: `url('${user.banner}')`,
              }}
            ></header>
            <div className="w-100 my-1 flex flex-row items-center">
              <Image
                src={user.avatar}
                alt={user.username}
                width={100}
                height={100}
                className="absolute top-20 m-2 rounded-full border-2 border-solid border-slate-950 md:top-40"
              />
              <div className="my-20 flex w-full flex-col justify-center md:my-10">
                <div className="flex flex-row justify-between">
                  <p className="ml-4 text-2xl text-black dark:text-white md:ml-0">
                    {user.displayname ? user.displayname : user.username}
                  </p>
                  <div
                    onClick={followUser}
                    className="mr-4  cursor-pointer md:mr-0"
                  >
                    {session && session?.user?.email !== user.email && (
                      <>
                        {isFollowing ? (
                          <div
                            onMouseOver={(e) =>
                              ((e.target as HTMLElement).textContent =
                                "Unfollow")
                            }
                            onMouseLeave={(e) =>
                              ((e.target as HTMLElement).textContent =
                                "Following")
                            }
                            className="flex w-24 items-center justify-center rounded-full border-2 border-white px-4 py-1 text-white hover:border-rose-400 hover:text-rose-400"
                          >
                            Following
                          </div>
                        ) : (
                          <div className="flex w-24 items-center justify-center rounded-full border-2 bg-white px-4 py-1 text-black">
                            Follow
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <p className="ml-4 text-lg text-slate-700  dark:text-slate-500 md:ml-0">
                  @{user.username}
                </p>
                <div className="ml-4 flex  flex-row text-black dark:text-white md:ml-0">
                  <p>
                    {user.followers.length}{" "}
                    <span className=" text-slate-700 dark:text-slate-500">
                      Followers
                    </span>{" "}
                  </p>
                  <p>
                    {user.following.length}{" "}
                    <span className=" text-slate-700 dark:text-slate-500">
                      Following
                    </span>{" "}
                  </p>
                </div>

                <p className="mb-4 ml-4  text-lg md:ml-0">{user.description}</p>
                <Tabs className="w-full" defaultValue="posts">
                  <TabsList className="grid w-full grid-cols-3 gap-0 text-black dark:text-white">
                    <TabsTrigger
                      className="cursor-pointer text-center text-lg data-[state=active]:bg-slate-400 dark:data-[state=active]:bg-slate-900"
                      value="posts"
                    >
                      Posts
                    </TabsTrigger>
                    <TabsTrigger
                      className="cursor-pointer text-center text-lg data-[state=active]:bg-slate-400 dark:data-[state=active]:bg-slate-900"
                      value="media"
                    >
                      Media
                    </TabsTrigger>
                    <TabsTrigger
                      className="cursor-pointer text-center text-lg data-[state=active]:bg-slate-400 dark:data-[state=active]:bg-slate-900"
                      value="replies"
                    >
                      Posts & Replies
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="posts">
                    <div className="w-full">
                      <InfiniteScroll
                        dataLength={user.posts.length}
                        next={getData}
                        hasMore={hasMore}
                        loader={<div>Loading</div>}
                      >
                        {user.posts
                          .filter((post) => post.replyId === null)
                          .map((post) => (
                            <Post post={post} key={post.id} />
                          ))}
                      </InfiniteScroll>
                    </div>
                  </TabsContent>
                  <TabsContent value="media">
                    <div className="w-full">
                      <InfiniteScroll
                        dataLength={user.posts.length}
                        next={getData}
                        hasMore={hasMore}
                        loader={<div>Loading</div>}
                      >
                        {user.posts
                          .filter((post) => post.image !== null)
                          .map((post) => (
                            <Post post={post} key={post.id} />
                          ))}
                      </InfiniteScroll>
                    </div>
                  </TabsContent>
                  <TabsContent value="replies">
                    <div className="w-full">
                      <InfiniteScroll
                        dataLength={user.posts.length}
                        next={getData}
                        hasMore={hasMore}
                        loader={<div>Loading</div>}
                      >
                        {user.posts.map((post) => (
                          <Post post={post} key={post.id} />
                        ))}
                      </InfiniteScroll>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
