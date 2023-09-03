"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { ArrowPathRoundedSquareIcon } from "@heroicons/react/20/solid";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import InfiniteScroll from "react-infinite-scroll-component";
import { NotificationType } from "@prisma/client";

interface User {
  id: number;
  username: string;
  displayname: string;
  avatar: string;
}

interface Notification {
  id: number;
  type: NotificationType;
  from: User;
  to: User;
  read: boolean;
  post: {
    id: number;
  };
}

export default function Notification() {
  const [notifications, setNotifications] = useState<Notification[]>([]!);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const getData = () => {
    fetch(`/api/notifications?skip=${skip}`)
      .then((res) => res.json())
      .then((data) => {
        setNotifications([...notifications.concat(data.notifications)]);
        setSkip(skip + 1);
        if (data.noMore) setHasMore(false);
      });
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
              <UserPlusIcon className="h-10 w-10" />
            </div>
            <div className="col-span-11 flex flex-row items-center">
              <Link
                href={`/@${notification.from.username}`}
                className="flex flex-row justify-center items-center"
              >
                <Image
                  src={`/avatars/${notification.from.avatar}`}
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
              <StarIcon className="h-10 w-10" />
            </div>
            <div className="col-span-11 flex flex-row items-center">
              <Link
                href={`/@${notification.from.username}`}
                className="flex flex-row justify-center items-center"
              >
                <Image
                  src={`/avatars/${notification.from.avatar}`}
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
              <ArrowPathRoundedSquareIcon className="h-10 w-10" />
            </div>
            <div className="col-span-11 flex flex-row items-center">
              <Link
                href={`/@${notification.from.username}`}
                className="flex flex-row justify-center items-center"
              >
                <Image
                  src={`/avatars/${notification.from.avatar}`}
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
    <div>
      {notifications && (
        <div>
          <p className="font-bold text-4xl">Notifications</p>
          <div className="divide-y">
            <InfiniteScroll
              dataLength={notifications.length}
              next={getData}
              hasMore={hasMore}
              loader={<div>Loading</div>}
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
