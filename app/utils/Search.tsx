"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Search() {
  const router = useRouter();
  const [text, setText] = useState("");
  const { data: session } = useSession();

  const handleSubmit = (e) => {
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
          className="mt-10 w-full bg-slate-800 border-slate-800 text-white  focus:border-transparent focus:outline-transparent focus:ring-transparent rounded-lg "
        ></input>
      )}
    </div>
  );
}
