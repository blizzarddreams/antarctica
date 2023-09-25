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

type Bookmark = {
  post: Post;
  user: User;
};

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]!);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [skip, setSkip] = useState(0);

  const getData = useCallback(() => {
    if (hasMore) {
      fetch(`/api/bookmark/all?skip=${skip}`)
        .then((res) => res.json())
        .then((data) => {
          setBookmarks([...bookmarks.concat(data.bookmarks)]);
          if (data.noMore) setHasMore(false);
          setSkip(skip + 1);
        });
    }
  }, [bookmarks, skip, hasMore]);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <div className="mt-10 flex flex-col items-center justify-center">
      <p className="text-4xl font-bold">Bookmarks</p>
      <InfiniteScroll
        dataLength={bookmarks.length}
        next={getData}
        hasMore={hasMore}
        loader={
          <div className="flex w-full flex-row justify-center">
            <ScaleLoader color="#36d7b7" />{" "}
          </div>
        }
      >
        {bookmarks.map((bookmark, i) => (
          <Post post={bookmark.post} key={i} />
        ))}
      </InfiniteScroll>
    </div>
  );
}
