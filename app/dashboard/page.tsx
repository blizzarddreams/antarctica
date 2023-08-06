"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface User {
  id: number;
  email: string;
  username: string;
  displayname: string;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    if (session) {
      fetch("/api/user")
        .then((res) => res.json())
        .then((data) => {
          setUser(data.user);
          console.log(data.user);
        });
    }
  }, [session]);
  return (
    <>
      {user && (
        <main className="flex min-h-screen flex-col items-center  justify-center p-24  bg-cyan-700">
          <p>Hello {user?.username}</p>
        </main>
      )}
    </>
  );
}
