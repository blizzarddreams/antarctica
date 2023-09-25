import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthContext from "./session";
import Navbar from "./utils/Navbar";
import Search from "./utils/Search";
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "@/components/ui/theme-provider";

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
          <ThemeProvider attribute="class">
            <div className="hidden md:block">
              <div className="grid min-h-screen grid-cols-12 flex-col justify-center  bg-slate-100 dark:bg-slate-950">
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
            <div className="relative h-screen md:hidden ">
              <div className="h-full bg-slate-100 dark:bg-slate-950">
                {children}
                <Navbar />
              </div>

              <ToastContainer position="bottom-left" />
            </div>{" "}
          </ThemeProvider>
        </body>
      </AuthContext>
    </html>
  );
}
