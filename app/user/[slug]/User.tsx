"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Post from "@/app/utils/Post";
import { useSession } from "next-auth/react";
import InfiniteScroll from "react-infinite-scroll-component";
import { PusherClient } from "@/pusher";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CldImage } from "next-cloudinary";
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
  followers: Follow[];
  following: Follow[];
}

interface Follow {
  id: number;
  follower: User;
  following: User;
}

interface Post {
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
}

interface Like {
  author: User;
  post: Post;
}

interface Repost {
  author: User;
  post: Post;
}

export default function UserPage({ params }: { params: { slug: string } }) {
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [user, setUser] = useState<User>(null!);
  const [skip, setSkip] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const { data: session } = useSession();
  const [tab, setTab] = useState<string>("posts");

  const getData = () => {
    fetch(`/api/profile?username=${params.slug}&skip=${skip}`)
      .then((res) => res.json())
      .then((data) => {
        setUser({
          ...data.user,
          posts: [...user.posts.concat(data.user.posts)],
        });
        console.log(data.user.posts);
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
      channel.bind("delete message", (data) => {
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
              className={`w-full h-32 md:h-52 bg-cover bg-center `}
              style={{ backgroundImage: `url('${user.banner}')` }}
            ></header>
            <div className="my-1 flex flex-row items-center w-100">
              <CldImage
                src={user.avatar}
                alt={user.username}
                width={100}
                height={100}
                className="m-2 border-slate-950 absolute top-20 md:top-40 rounded-full border-solid border-2"
              />
              <div className="flex w-full my-20 md:my-10 justify-center flex-col">
                <div className="flex flex-row justify-between">
                  <p className="text-2xl ml-4 md:ml-0">
                    {user.displayname ? user.displayname : user.username}
                  </p>
                  <div
                    onClick={followUser}
                    className="cursor-pointer  mr-4 md:mr-0"
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
                            className="flex justify-center items-center border-white border-2 w-24 text-white px-4 py-1 rounded-full hover:border-rose-400 hover:text-rose-400"
                          >
                            Following
                          </div>
                        ) : (
                          <div className="flex justify-center items-center w-24 bg-white text-black border-2 px-4 py-1 rounded-full">
                            Follow
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <p className="text-lg text-slate-500  ml-4 md:ml-0">
                  @{user.username}
                </p>
                <div className="flex flex-row  ml-4 md:ml-0">
                  <p>
                    {user.followers.length}{" "}
                    <span className=" text-slate-500">Followers</span>{" "}
                  </p>
                  <p>
                    {user.following.length}{" "}
                    <span className=" text-slate-500">Following</span>{" "}
                  </p>
                </div>

                <p className="text-lg mb-4  ml-4 md:ml-0">{user.description}</p>
                <Tabs className="w-full">
                  <TabsList className="grid w-full grid-cols-3 gap-0">
                    <TabsTrigger
                      className="text-center cursor-pointer text-lg data-[state=active]:bg-slate-900"
                      value="posts"
                    >
                      Posts
                    </TabsTrigger>
                    <TabsTrigger
                      className="text-center cursor-pointer text-lg data-[state=active]:bg-slate-900"
                      value="media"
                    >
                      Media
                    </TabsTrigger>
                    <TabsTrigger
                      className="text-center cursor-pointer text-lg data-[state=active]:bg-slate-900"
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
