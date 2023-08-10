"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Search() {
  const router = useRouter();
  const [text, setText] = useState("");
  const handleSubmit = (e) => {
    if (e.key === "Enter") {
      return router.push(`/search?params=${text}`);
    }
  };
  return (
    <div>
      <input
        type="text"
        placeholder="Search"
        value={text}
        onKeyDown={handleSubmit}
        onChange={(e) => setText(e.target.value)}
        className="mt-10 bg-slate-800 border-slate-800 text-white  focus:border-transparent focus:outline-transparent focus:ring-transparent rounded-lg "
      ></input>
    </div>
  );
}
