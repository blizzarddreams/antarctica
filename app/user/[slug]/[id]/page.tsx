import { formatRelative } from "date-fns";
import Link from "next/link";
import Image from "next/image";

async function getData(id: number) {
  const res = await fetch(
    `https://d46f-2603-6010-5ff0-8940-d85a-4a7-dc89-967a.ngrok-free.app/api/post?id=${id}`,
  );
  const data = await res.json();
  return data.post;
}

export default async function Post({ params }: { params: { id: number } }) {
  const post = await getData(params.id);
  return (
    <div
      key={post.id}
      className="border border-blue-100 bg-inherit flex flex-row  h-2/6 w-full p-4 m-1 shadow-xl items-start"
    >
      <Image
        className="rounded-full mr-4 h-min"
        src={`/avatars/${post.author.avatar}`}
        alt={post.author.username}
        width={50}
        height={50}
      />
      <div className="flex flex-col break-all">
        <div className="flex flex-row items-center">
          <p className="mr-2">{post.author.displayname}</p>{" "}
          <p className="mr-2 text-zinc-400 text-sm"> @{post.author.username}</p>
          <p className="text-zinc-300 text-sm">
            {formatRelative(new Date(post.createdAt), new Date())}
          </p>
        </div>
        <p className="">{post.content}</p>
      </div>
    </div>
  );
}
