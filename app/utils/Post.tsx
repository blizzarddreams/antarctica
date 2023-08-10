"use client";

import { formatRelative } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { ArrowPathRoundedSquareIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
  description: string;
  email: string;
  displayname: string;
  avatar: string;
  banner: string;
  posts: Post[];
}

interface Post {
  author: User;
  id: number;
  createdAt: string;
  content: string;
  likes: Like[];
  reposts: Repost[];
  isRepost?: boolean;
  postCreatedAt?: string;
  repostAuthor?: User;
}

interface Like {
  author: User;
  post: Post;
}

interface Repost {
  author: User;
  post: Post;
}

export default function Post({ post }: { post: Post }) {
  const session = useSession();
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);

  // check if liked
  useEffect(() => {
    if (session) {
      fetch(`/api/like?post_id=${post.id}`)
        .then((res) => res.json())
        .then((data) => {
          setLiked(data.liked);
        });
      fetch(`/api/repost?post_id=${post.id}`)
        .then((res) => res.json())
        .then((data) => {
          setReposted(data.reposted);
        });
    }
  }, [session, post.id]);

  const toggleLike = (e) => {
    e.preventDefault();
    fetch(`/api/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: post.id }),
    })
      .then((res) => res.json())
      .then((data) => setLiked(data.liked));
  };

  const toggleRepost = (e) => {
    e.preventDefault();
    fetch(`/api/repost`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: post.id }),
    })
      .then((res) => res.json())
      .then((data) => setReposted(data.reposted));
  };

  return (
    <>
      <div key={post.id}>
        <Link
          href={`/@${post.author.username}/${post.id}`}
          className="border border-slate-800 p-4 shadow-xl h-full w-full flex flex-col items-start"
        >
          <div className="flex flex-row h-full w-full items-center">
            <div>
              <Image
                className="rounded-full mr-4 h-min"
                src={`/avatars/${post.author.avatar}`}
                alt={post.author.username}
                width={50}
                height={50}
              />
            </div>
            <div className="flex flex-col break-all">
              {post.isRepost && (
                <div className="flex flex-row w-full">
                  <p className="text-emerald-400 text-xs">
                    Reposted by {post.repostAuthor?.username}
                  </p>
                </div>
              )}
              <div className="flex flex-row items-center">
                <p className="mr-2">
                  {post.author.displayname
                    ? post.author.displayname
                    : post.author.username}
                </p>{" "}
                <p className="mr-2 text-zinc-400 text-sm">
                  {" "}
                  @{post.author.username}
                </p>
                {post.isRepost ? (
                  <p className="text-zinc-300 text-sm">
                    {formatRelative(new Date(post.postCreatedAt!), new Date())}
                  </p>
                ) : (
                  <p className="text-zinc-300 text-sm">
                    {formatRelative(new Date(post.createdAt), new Date())}
                  </p>
                )}
              </div>
              <p className="">{post.content}</p>
              <div className="flex flex-row">
                {session && (
                  <>
                    <div className="flex flex-row items-center">
                      {liked ? (
                        <StarIconSolid
                          onClick={toggleLike}
                          className="h-5 w-5"
                        />
                      ) : (
                        <StarIconOutline
                          onClick={toggleLike}
                          className="h-5 w-5"
                        />
                      )}
                      <p>{post.likes.length}</p>
                    </div>
                    <div className="flex flex-row items-center">
                      {reposted ? (
                        <ArrowPathRoundedSquareIcon
                          onClick={toggleRepost}
                          className="h-5 w-5 text-emerald-400"
                        />
                      ) : (
                        <ArrowPathRoundedSquareIcon
                          onClick={toggleRepost}
                          className="h-5 w-5"
                        />
                      )}
                      <p>{post.reposts.length}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}
