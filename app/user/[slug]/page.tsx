"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Post from "@/app/utils/Post";
import { useSession } from "next-auth/react";
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
}

interface Like {
  author: User;
  post: Post;
}

interface Repost {
  author: User;
  post: Post;
}

export default function User({ params }: { params: { slug: string } }) {
  const [user, setUser] = useState<User>(null!);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const { data: session } = useSession();
  const [skip, setSkip] = useState(0);

  const getData = () => {
    fetch(`/api/profile?username=${params.slug}&skip=${skip}`)
      .then((res) => res.json())
      .then((data) => {
        setUser({
          ...data.user,
          posts: [...user.posts.concat(data.user.posts)],
        });
        setSkip(skip + 1);

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
        setUser(data.user);

        if (session) {
          fetch(`/api/follow?id=${data.user.id}`)
            .then((res) => res.json())
            .then((data) => {
              setIsFollowing(data.following);
            });
        }
      });
  }, [params.slug, session]);

  const followUser = (e) => {
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
              className={`w-full h-52 bg-cover bg-center `}
              style={{ backgroundImage: `url('/banners/${user.banner}')` }}
            ></header>
            <div className="my-1 flex flex-row items-center w-100">
              <Image
                src={`/avatars/${user.avatar}`}
                alt={user.username}
                width={100}
                height={100}
                className="m-2 border-slate-950 absolute top-40 rounded-full border-solid border-2 "
              />
              <div className="flex w-full my-10 justify-center flex-col">
                <div className="flex flex-row justify-between">
                  <p className="text-2xl">
                    {user.displayname ? user.displayname : user.username}
                  </p>
                  <div onClick={followUser} className="cursor-pointer">
                    {session?.user?.email !== user.email && (
                      <>
                        {isFollowing ? (
                          <div
                            onMouseOver={(e) =>
                              (e.target.textContent = "Unfollow")
                            }
                            onMouseLeave={(e) =>
                              (e.target.textContent = "Following")
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
                <p className="text-lg text-slate-500">@{user.username}</p>

                <p className="text-lg">{user.description}</p>

                <div className="w-full">
                  {user.posts.length > 0 ? (
                    <>
                      <InfiniteScroll
                        dataLength={user.posts.length}
                        next={getData}
                        hasMore={true}
                        loader={<div>Loading</div>}
                      >
                        {user.posts.map((post) => (
                          <Post post={post} key={post.id} />
                        ))}
                      </InfiniteScroll>
                    </>
                  ) : (
                    <p className="text-4xl">No Posts</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
