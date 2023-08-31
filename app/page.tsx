"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <main className="flex min-h-screen flex-col items-center  justify-center p-24 ">
      <p className="text-7xl text-transparent bg-gradient-to-r from-sky-500 to-slate-700 bg-clip-text">
        antarctica
      </p>
      <p className="text-xl  bg-gradient-to-r from-sky-500 to-slate-700 bg-clip-text text-transparent">
        A Twitter/Bluesky clone
      </p>
      {!session && (
        <>
          <button
            className="bg-gradient-to-r from-sky-500 to-slate-700 rounded-xl p-4"
            onClick={() => signIn()}
          >
            Sign in
          </button>
          <Link href="/explore">
            <button className="bg-gradient-to-r from-sky-500 to-slate-700 rounded-xl p-4">
              Explore
            </button>
          </Link>
        </>
      )}
    </main>
  );
}
