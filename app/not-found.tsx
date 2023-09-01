import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex justify-center flex-col items-center h-full w-full">
      <p className="text-9xl text-transparent bg-gradient-to-r from-sky-500 to-slate-700 bg-clip-text">
        404
      </p>
      <Link className="text-4xl" href="/">
        Return to home
      </Link>
    </div>
  );
}
