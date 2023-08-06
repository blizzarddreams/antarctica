"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <main className="flex min-h-screen flex-col items-center  justify-center p-24  bg-cyan-700">
      <p className="text-7xl">Macaw</p>
      <p>Twitter clone</p>
      {session ? (
        <p>
          Signed in <button onClick={() => signOut()}>Sign out </button>
        </p>
      ) : (
        <p>
          Not signed in. Sign in{" "}
          <button onClick={() => signIn()}>Sign in</button>
        </p>
      )}
    </main>
  );
}
