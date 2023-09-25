"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { BsFillReplyAllFill } from "react-icons/bs";
import Image from "next/image";
import InfiniteScroll from "react-infinite-scroll-component";
import { NotificationType } from "@prisma/client";
import { ScaleLoader } from "react-spinners";
import { BiUserCircle } from "react-icons/bi";

type User = {
  id: number;
  username: string;
  displayname: string;
  avatar: string;
};

type Notification = {
  id: number;
  type: NotificationType;
  from: User;
  to: User;
  read: boolean;
  post: {
    id: number;
  };
};

export default function Notification() {
  const [notifications, setNotifications] = useState<Notification[]>([]!);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const getData = () => {
    if (hasMore) {
      fetch(`/api/notifications?skip=${skip}`)
        .then((res) => res.json())
        .then((data) => {
          setNotifications([...notifications.concat(data.notifications)]);
          setSkip(skip + 1);
          if (data.noMore) setHasMore(false);
        });
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const getNotificationType = (notification: Notification) => {
    switch (notification.type) {
      case "FOLLOW":
        return (
          <div className="grid grid-cols-12">
            <div className="col-span-1">
              <BiUserCircle className="h-10 w-10" />
            </div>
            <div className="col-span-11 flex flex-row items-center">
              <Link
                href={`/@${notification.from.username}`}
                className="flex flex-row items-center justify-center"
              >
                <Image
                  src={notification.from.avatar}
                  height={20}
                  width={20}
                  alt={notification.from.username}
                  className="rounded-full"
                />
                {notification.from.username}
              </Link>
              followed you
            </div>
          </div>
        );
      case "LIKE":
        return (
          <div className="grid grid-cols-12">
            <div className="col-span-1">
              <AiFillStar className="h-10 w-10" />
            </div>
            <div className="col-span-11 flex flex-row items-center">
              <Link
                href={`/@${notification.from.username}`}
                className="flex flex-row items-center justify-center"
              >
                <Image
                  src={notification.from.avatar}
                  height={20}
                  width={20}
                  alt={notification.from.username}
                  className="rounded-full"
                />
                {notification.from.username}
              </Link>
              liked your
              <Link
                href={`/@${notification.to.username}/${notification?.post?.id}`}
              >
                post
              </Link>
            </div>
          </div>
        );
      case "REPOST":
        return (
          <div className="grid grid-cols-12">
            <div className="col-span-1">
              <BsFillReplyAllFill className="h-10 w-10" />
            </div>
            <div className="col-span-11 flex flex-row items-center">
              <Link
                href={`/@${notification.from.username}`}
                className="flex flex-row items-center justify-center"
              >
                <Image
                  src={notification.from.avatar}
                  height={20}
                  width={20}
                  alt={notification.from.username}
                  className="rounded-full"
                />
                {notification.from.username}
              </Link>
              reposted your
              <Link
                href={`/@${notification.to.username}/${notification?.post?.id}`}
              >
                {" "}
                post
              </Link>
            </div>
          </div>
        );
    }
  };
  return (
    <div className="mt-10 flex flex-col items-center justify-center">
      <p className="text-4xl font-bold">Notifications</p>
      {notifications.length > 0 && (
        <div>
          <div className="divide-y">
            <InfiniteScroll
              dataLength={notifications.length}
              next={getData}
              hasMore={hasMore}
              loader={
                <div className="flex w-full flex-row justify-center">
                  <ScaleLoader color="#36d7b7" />{" "}
                </div>
              }
              className="divide-y"
            >
              {notifications.map((notification) => (
                <div className="p-4" key={notification.id}>
                  {getNotificationType(notification)}
                </div>
              ))}
            </InfiniteScroll>
          </div>
        </div>
      )}
    </div>
  );
}
