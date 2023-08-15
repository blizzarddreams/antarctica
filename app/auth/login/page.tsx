"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function Login() {
  const { data: session, status } = useSession();

  if (session) {
    return (
      <p>
        Signed in <button onClick={() => signOut()}>Sign out </button>
      </p>
    );
  } else {
    return (
      <p>
        Not signed in. Sign in <button onClick={() => signIn()}>Sign in</button>
      </p>
    );
  }
}
