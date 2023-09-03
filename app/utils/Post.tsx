"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";
import {
  PencilSquareIcon,
  StarIcon as StarIconOutline,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { ArrowPathRoundedSquareIcon } from "@heroicons/react/24/solid";
import { CameraIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { FaTrash } from "react-icons/fa";
import {
  BsFillBookmarkPlusFill,
  BsFillBookmarkDashFill,
  BsFillReplyAllFill,
} from "react-icons/bs";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CldImage } from "next-cloudinary";
import { format } from "path";

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

export default function Post({ post }: { post: Post }) {
  dayjs.extend(relativeTime);
  const { data: session } = useSession();
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [isOpenReply, setIsOpenReply] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [preview, setPreview] = useState("");
  const [image, setImage] = useState("");
  const [text, setText] = useState("");

  // check if liked, reposted, and bookmarked
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
      fetch(`/api/bookmark?post_id=${post.id}`)
        .then((res) => res.json())
        .then((data) => {
          setBookmarked(data.bookmarked);
        });
    }
  }, [session, post.id]);

  const handleImageChange = (e) => {
    setPreview(URL.createObjectURL(e.target.files[0]));
    setImage(e.target.files[0]);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length > 280) {
      e.preventDefault();
      setText(text.slice(0, 280));
      return false;
    }
    setText(e.target.value);
  };

  const makePost = () => {
    const form = new FormData();
    if (image) form.append("image", image);
    form.append("post", text);
    form.append("reply", post.id.toString());
    setIsOpenReply(false);
    fetch("/api/post", {
      method: "POST",
      body: form,
    })
      .then((res) => res.json())
      .then((data) => {
        setText("");
        setIsOpenReply(false);
      });
  };

  const handleDelete = () => {
    fetch(`/api/post/`, {
      method: "DELETE",
      body: JSON.stringify({ id: post.id }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setIsOpenDelete(false);
      });
  };

  const toggleBookmark = () => {
    fetch(`/api/bookmark`, {
      method: "POST",
      body: JSON.stringify({ id: post.id }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setBookmarked(data.bookmarked));
  };

  const toggleLike = (e: React.MouseEvent<SVGSVGElement>) => {
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

  const toggleRepost = (e: React.MouseEvent<SVGSVGElement>) => {
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

  const stopLink = (e) => {
    if (
      e.target.tagName === "svg" ||
      e.target.tagName === "path" ||
      e.target.tagName === "BUTTON" ||
      e.target.tagName === "SPAN" ||
      e.target.tagName === "IMG"
    ) {
      e.preventDefault();
    }
  };

  return (
    <>
      <div key={post.id}>
        <Link
          href={`/@${post.author.username}/${post.id}`}
          onClick={stopLink}
          className="border border-slate-800 p-8 flex flex-col items-center"
        >
          <div className="h-full w-full items-center grid grid-cols-12">
            <div className="flex flex-col col-span-1 justify-center items-center">
              <CldImage
                className="rounded-full mr-4"
                src={post.author.avatar}
                alt={post.author.username}
                width={50}
                height={50}
              />
            </div>
            <div className="flex flex-col col-span-11">
              {post.isRepost && (
                <div className="flex flex-row w-full">
                  <p className="text-emerald-400 text-xs">
                    Reposted by{" "}
                    <Link href={`/@${post.repostAuthor?.username}`}>
                      {post.repostAuthor?.username}
                    </Link>
                  </p>
                </div>
              )}

              <div className="flex flex-row items-center">
                <div className="flex justify-between w-full items-center">
                  <div>
                    <HoverCard>
                      <HoverCardTrigger className="flex flex-row items-center">
                        <Link
                          href={`/@${post.author.username}`}
                          className="flex flex-row items-center justify-center"
                        >
                          <p className="mr-2">
                            {post.author.displayname
                              ? post.author.displayname
                              : post.author.username}
                          </p>{" "}
                          <p className="mr-2 text-zinc-400 text-sm">
                            {" "}
                            @{post.author.username}
                          </p>
                        </Link>
                        {post.isRepost ? (
                          <p className="text-zinc-300 text-sm">
                            {dayjs().to(dayjs(new Date(post.postCreatedAt!)))}
                          </p>
                        ) : (
                          <p className="text-emerald-400 text-sm">
                            {dayjs().to(dayjs(new Date(post.createdAt!)))}
                          </p>
                        )}
                      </HoverCardTrigger>

                      <HoverCardContent className="bg-black">
                        <div className="flex flex-col">
                          <div className="flex flex-row">
                            <CldImage
                              className="rounded-full mr-4"
                              src={post.author.avatar}
                              alt={post.author.username}
                              width={50}
                              height={50}
                            />
                            <div className="flex flex-col">
                              <p className="mr-2">
                                {post.author.displayname
                                  ? post.author.displayname
                                  : post.author.username}
                              </p>{" "}
                              <p className="mr-2 text-zinc-400 text-sm">
                                {" "}
                                @{post.author.username}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-row">{}</div>
                          <p className="text-white">
                            {post.author.description}
                          </p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                    {post.replyId && post.reply && (
                      <div className="mr-2 text-zinc-400 text-sm flex flex-row">
                        {" "}
                        <BsFillReplyAllFill className="h-5 w-5 mx-1" />
                        Reply to{" "}
                        <Link href={`/@${post.reply.author.username}`}>
                          {` ${post.reply.author.username}`}
                        </Link>
                      </div>
                    )}
                  </div>
                  <Dialog
                    open={isOpenDelete}
                    onOpenChange={() => setIsOpenDelete(!isOpenDelete)}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <BiDotsHorizontalRounded
                          className="w-4 h-4 text-zinc-300"
                          id="dropdownMenu"
                        />
                      </DropdownMenuTrigger>

                      <DropdownMenuContent className="bg-slate-950">
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          onClick={toggleBookmark}
                        >
                          {session &&
                            session.user?.email === post.author.email && (
                              <>
                                {bookmarked ? (
                                  <>
                                    <BsFillBookmarkDashFill className="h-4 w-4 mr-2 text-white" />
                                    <span className="text-white">
                                      Unbookmark Post
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <BsFillBookmarkPlusFill className="h-4 w-4 mr-2 text-white" />
                                    <span className="text-white">
                                      Bookmark Post
                                    </span>
                                  </>
                                )}
                              </>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          {session &&
                            session.user?.email === post.author.email && (
                              <>
                                <DialogTrigger>
                                  <div className="flex flex-row items-center">
                                    <FaTrash className="h-4 w-4 mr-2 text-white" />
                                    <span className="text-white">
                                      Delete Post
                                    </span>
                                  </div>
                                </DialogTrigger>
                                <DialogContent className="bg-slate-950">
                                  Are you sure you want to delete this?
                                  <button
                                    onClick={handleDelete}
                                    className="bg-rose-400 p-4 rounded-xl"
                                    type="button"
                                  >
                                    Yes
                                  </button>
                                </DialogContent>
                              </>
                            )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Dialog>
                </div>
              </div>
              <p className="break-all">{post.content}</p>
              {post.image && (
                <Dialog>
                  <DialogTrigger>
                    <CldImage
                      src={post.image}
                      alt={post.author.username}
                      width={100}
                      height={100}
                    />
                  </DialogTrigger>
                  <DialogContent>
                    <CldImage
                      src={post.image}
                      alt={post.author.username}
                      width={1000}
                      height={1000}
                    />
                  </DialogContent>
                </Dialog>
              )}
              <div className="flex flex-row">
                {session && (
                  <>
                    <div className="flex flex-row items-center mx-4">
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
                    <div className="flex flex-row items-center mx-4">
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
                    <Dialog
                      open={isOpenReply}
                      onOpenChange={() => setIsOpenReply(!isOpenReply)}
                    >
                      <DialogTrigger className="w-full">
                        <div onClick={(e) => setIsOpenReply(!isOpenReply)}>
                          <BsFillReplyAllFill className="h-5 w-5 mx-4" />
                        </div>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-950">
                        <div className="mt-2 w-full">
                          <textarea
                            id="content"
                            name="content"
                            rows={4}
                            value={text}
                            onChange={handleTextChange}
                            placeholder="What is happening? reply"
                            className="resize-none w-full border-none focus:border-none bg-slate-800 text-white outline-none focus:outline-none focus:ring-0"
                          />
                        </div>

                        <div className="mt-4 flex flex-col w-full justify-center items-center">
                          {text.replaceAll(" ", "").length === 0 ? (
                            <button
                              type="button"
                              className=" bg-slate-800/70 p-4 my-1 w-full m-4"
                              onClick={makePost}
                              disabled
                            >
                              Post
                            </button>
                          ) : (
                            <button
                              type="button"
                              className=" bg-slate-800 p-4 my-1 w-full m-4"
                              onClick={makePost}
                            >
                              Post
                            </button>
                          )}
                          {280 - text.length > 20 ? (
                            <p className="text-teal-400">
                              {" "}
                              {280 - text.length}
                            </p>
                          ) : (
                            <p className="text-rose-400">
                              {" "}
                              {280 - text.length}
                            </p>
                          )}
                          <label htmlFor="image">
                            <CameraIcon className="h-7 w-7" />
                          </label>
                          <input
                            type="file"
                            name="image"
                            id="image"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleImageChange}
                            className="hidden file:bg-gray-800 file:text-white file:border file:border-none w-full border border-gray-700 cursor-pointer bg-gray-50 dark:bg-gray-700"
                          />
                          {preview && (
                            <Image
                              src={preview}
                              alt={"lol"}
                              height={100}
                              width={100}
                            />
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
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
