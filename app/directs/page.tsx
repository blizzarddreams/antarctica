"use client";

import { PusherClient } from "@/pusher";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Fragment,
  KeyboardEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Messages from "./Messages";
import dayjs from "dayjs";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
type Direct = {
  id: number;
  createdAt: Date;
  members: User[];
  messages: DirectMessage[];
  updatedAt: string;
};

type User = {
  id: number;
  username: string;
  directs: Direct[];
  avatar: string;
  email: string;
};

type DirectMessage = {
  id: number;
  createdAt: Date;
  user: User;
  content: string;
  direct: Direct;
};

type NewDirectInputs = {
  username: string;
};

export default function Direct() {
  const [user, setUser] = useState<User>(null!);
  const [isOpen, setIsOpen] = useState(false);
  const [dialogUsername, setDialogUsername] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [currentTab, setCurrentTab] = useState("");
  const [isNewDirectOpen, setIsNewDirectOpen] = useState(false);
  const [usernames, setUsernames] = useState<string[]>([]);
  const [commandValue, setCommandValue] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null!);
  dayjs.extend(relativeTime);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NewDirectInputs>();

  useEffect(() => {
    fetch("/api/direct")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
      });
  }, []);

  const handleNewDirectOpen = () => {
    setIsNewDirectOpen(!isNewDirectOpen);
    if (isNewDirectOpen) return;
    fetch("/api/usernames").then((res) =>
      res.json().then((data) => {
        setUsernames(data.usernames);
      }),
    );
  };

  useEffect(() => {
    if (user) {
      const channel = PusherClient.subscribe(`directs-${user.username}`);
      channel.bind("new message", (data: { user: User }) => {
        setUser(data.user);
      });
    }
  }, [user]);

  const handleNewDirectSubmit = () => {
    setIsOpen(false);
    fetch("/api/direct", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: dialogUsername }),
    });
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [user, currentTab]);

  const handleNewMessage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const directId = (e.target as HTMLElement).getAttribute("data-direct-id");
    if (e.keyCode !== 13) return;
    fetch("/api/direct-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: newMessage, directId }),
    }).then(() => messageEndRef.current.scrollIntoView({ behavior: "smooth" }));
  };

  return (
    <div className="flex flex-col justify-center">
      <p className="text-4xl font-bold text-black dark:text-white">Directs</p>
      <Dialog open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
        <DialogContent>
          <input
            value={dialogUsername}
            onChange={(e) => setDialogUsername(e.target.value)}
            type="text"
            className="text-white"
          />
          <button
            className="mt-4 bg-sky-500 p-4"
            onClick={handleNewDirectSubmit}
          >
            Message
          </button>
        </DialogContent>
      </Dialog>
      {user && (
        <Tabs
          value={currentTab}
          className="flex flex-row"
          orientation="vertical"
          defaultValue={user?.directs[0]?.id.toString()}
          onValueChange={(e) => setCurrentTab(e)}
        >
          <TabsList className=" mt-4 flex min-h-full flex-col justify-start bg-transparent">
            <button
              onClick={handleNewDirectOpen}
              className="text-black dark:text-white"
            >
              New Message
            </button>
            <div className="flex w-full flex-row justify-between px-3">
              <div className="flex flex-row items-center">
                <Dialog
                  open={isNewDirectOpen}
                  onOpenChange={handleNewDirectOpen}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-black dark:text-white">
                        New Message
                      </DialogTitle>
                      <DialogDescription>
                        <form
                          onSubmit={handleSubmit(handleNewDirectSubmit)}
                          className="flex flex-col"
                        >
                          <Command>
                            <CommandInput
                              placeholder="Username"
                              {...register("username", { required: true })}
                              value={commandValue}
                            />
                            <CommandList>
                              <CommandEmpty>No users found</CommandEmpty>
                              {usernames &&
                                usernames.slice(0, 4).map((username) => (
                                  <CommandItem
                                    key={username}
                                    className="rounded-none"
                                    onSelect={(value) =>
                                      commandValue === value
                                        ? setCommandValue("")
                                        : setCommandValue(value)
                                    }
                                  >
                                    {username}
                                  </CommandItem>
                                ))}
                            </CommandList>
                          </Command>
                          {errors.username && (
                            <span>This field is required</span>
                          )}
                          <button type="submit">Submit</button>
                        </form>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {user.directs.map((direct) => (
              <div
                className="flex max-h-[100vh] w-full flex-col "
                key={direct.id}
              >
                <TabsTrigger
                  className="mx-0 mt-4 flex w-full flex-row items-center justify-start"
                  value={direct.id.toString()}
                >
                  <Image
                    src={
                      direct.members.filter(
                        (member) => member.username !== user.username,
                      )[0].avatar
                    }
                    alt="Avatar"
                    className="mx-4 rounded-full"
                    height={60}
                    width={60}
                  />
                  <div className="flex flex-col items-start justify-start">
                    <p className="text-black dark:text-white">
                      {
                        direct.members.filter(
                          (member) => member.username !== user.username,
                        )[0].username
                      }
                    </p>
                    <p className="text-xs text-slate-400">
                      {
                        direct?.messages?.filter(
                          (message) => message.user.username !== user.username,
                        )[0]?.content
                      }
                    </p>
                    <p className="text-xs text-emerald-400">
                      {dayjs(
                        direct?.messages?.filter(
                          (message) => message.user.username !== user.username,
                        )[0]?.createdAt,
                      ).fromNow()}
                    </p>
                  </div>
                </TabsTrigger>
              </div>
            ))}
          </TabsList>
          {user.directs.map((direct) => (
            <TabsContent
              value={direct.id.toString()}
              key={direct.id}
              className="max-h-[90vh] w-full"
            >
              <div className="flex h-full w-full flex-col justify-between">
                <div className="flex w-full flex-col  overflow-auto">
                  <Messages user={user} direct={direct} key={direct.id} />
                  <div ref={messageEndRef} />
                </div>
                <div>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className={"w-full text-white"}
                    placeholder="Message...."
                    data-direct-id={direct.id}
                    onKeyDown={handleNewMessage}
                  />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
