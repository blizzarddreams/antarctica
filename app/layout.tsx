import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthContext from "./session";
import Navbar from "./utils/Navbar";
import Search from "./utils/Search";
import { ToastContainer } from "react-toastify";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "antarctica",
  description: "Twitter/Bluesky clone",
};

export default function RootLayout({
  children,
  ...props
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <AuthContext>
        <body className={inter.className}>
          <div className="hidden lg:block">
            <div className="grid grid-cols-12 gap-4 p-4 flex min-h-screen flex-col justify-center p-24  bg-slate-950">
              <div className="col-span-2">
                <Navbar />
              </div>
              <div className="col-span-8">{children}</div>
              <div className="col-span-2">
                <Search />
              </div>
              <ToastContainer position="bottom-left" />
            </div>
          </div>
        </body>
      </AuthContext>
    </html>
  );
}
