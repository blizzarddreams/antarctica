"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import Post from "../utils/Post";
import InfiniteScroll from "react-infinite-scroll-component";
import { PusherClient } from "@/pusher";
import Image from "next/image";
import { CameraIcon } from "@heroicons/react/24/outline";
interface User {
  id: number;
  email: string;
  username: string;
  displayname: string;
  description: string;
  avatar: string;
  banner: string;
  posts: Post[];
}

interface Post {
  id: number;
  author: User;
  content: string;
  createdAt: string;
  isRepost: boolean;
  postCreatedAt: string;
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

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]!);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [image, setImage] = useState("");
  const [post, setPost] = useState("");
  const [preview, setPreview] = useState("");

  const handleImageChange = (e) => {
    setPreview(URL.createObjectURL(e.target.files[0]));
    setImage(e.target.files[0]);
  };

  const makePost = async () => {
    const form = new FormData();
    if (image) form.append("image", image);
    form.append("post", post);
    fetch("/api/post", {
      method: "POST",
      body: form,
    })
      .then((res) => res.json())
      .then((data) => {
        setPost("");
      });
  };

  const getData = useCallback(() => {
    if (session) {
      fetch(`/api/dashboard?skip=${skip}`)
        .then((res) => res.json())
        .then((data) => {
          setPosts([...posts.concat(data.posts)]);
          setSkip(skip + 1);
          if (data.noMore) setHasMore(false);
        });
    }
  }, [session, skip, posts]);

  useEffect(() => {
    getData();
  }, [getData]);

  useEffect(() => {
    if (session?.user?.email) {
      const channel = PusherClient.subscribe(`dashboard-${session.user.email}`);
      channel.bind("new message", (data) => {
        setPosts([...[data.post].concat(posts)]);
      });
    }
  }, [session]);
  return (
    <>
      {posts && (
        <>
          <div className="mt-2 w-full">
            <textarea
              id="content"
              name="content"
              rows={4}
              value={post}
              onChange={(e) => setPost(e.target.value)}
              placeholder="What is happening?"
              className="resize-none w-full border-none focus:border-none bg-slate-800 text-white outline-none focus:outline-none focus:ring-0"
            />
          </div>

          <div className="mt-4 flex flex-row w-full items-center">
            {post.replaceAll(" ", "").length === 0 ? (
              <button
                type="button"
                className=" bg-slate-800/70 p-4 my-1 w-full mr-4"
                onClick={makePost}
                disabled
              >
                Post
              </button>
            ) : (
              <button
                type="button"
                className=" bg-slate-800 p-4 my-1 w-full mr-4"
                onClick={makePost}
              >
                Post
              </button>
            )}
            {280 - post.length > 20 ? (
              <p className="text-teal-400"> {280 - post.length}</p>
            ) : (
              <p className="text-rose-400"> {280 - post.length}</p>
            )}
            <label htmlFor="image">
              <CameraIcon className="h-10 w-10" />
            </label>
            <input
              type="file"
              name="image"
              id="image"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleImageChange}
              className="hidden file:bg-gray-800 file:text-white file:border file:border-none block w-full border border-gray-700 cursor-pointer bg-gray-50 dark:bg-gray-700"
            />
            {preview && (
              <Image src={preview} alt={"lol"} height={100} width={100} />
            )}
          </div>
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
