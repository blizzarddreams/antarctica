"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Search() {
  const router = useRouter();
  const [text, setText] = useState("");
  const { data: session } = useSession();

  const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      return router.push(`/search?params=${text.replace("#", "%23")}`);
    }
  };
  return (
    <div>
      {session && (
        <input
          type="text"
          placeholder="Search"
          value={text}
          onKeyDown={handleSubmit}
          onChange={(e) => setText(e.target.value)}
          className="mt-10 w-full rounded-lg border-slate-800 bg-slate-200 text-white  focus:border-transparent focus:outline-transparent focus:ring-transparent dark:bg-slate-800 "
        ></input>
      )}
    </div>
  );
}
