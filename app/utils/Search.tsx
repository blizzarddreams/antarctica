"use client";

import { Input } from "@/components/ui/input";
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
        <Input
          type="text"
          placeholder="Search"
          value={text}
          onKeyDown={handleSubmit}
          onChange={(e) => setText(e.target.value)}
          className="my-1 mt-10 w-5/6 rounded-lg focus:border-transparent focus:outline-transparent focus:ring-transparent "
        />
      )}
    </div>
  );
}
