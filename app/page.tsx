"use client";

import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import bg from "../public/henrique-setim-XuD9vHw6yeY-unsplash.jpg";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  if (session) {
    return router.push("/dashboard");
  }
  return (
    <main className="flex min-h-screen flex-col items-center  justify-center p-24 ">
      <Image
        src={bg}
        placeholder="blur"
        quality={100}
        fill
        sizes="100vw"
        alt="antarctica bg"
        className="object-cover"
      />
      <div className="z-10 flex flex-col items-center justify-center">
        <p className="bg-gradient-to-r from-sky-500 to-slate-700 bg-clip-text text-7xl font-bold text-transparent drop-shadow">
          antarctica
        </p>
        <p className=" text-xl font-bold text-slate-800/80 drop-shadow-2xl">
          A Twitter/Bluesky clone
        </p>
        {!session && (
          <div className="flex flex-row">
            <button
              className="m-1 rounded-xl bg-sky-500 p-4"
              onClick={() => signIn()}
            >
              Sign in
            </button>
            <Link href="/explore">
              <button className="m-1 rounded-xl bg-sky-500 p-4">Explore</button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
