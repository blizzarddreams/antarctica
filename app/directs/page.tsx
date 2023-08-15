"use client";

import { PusherClient } from "@/pusher";
import { Dialog, Tab, Transition } from "@headlessui/react";
import Image from "next/image";
import { Fragment, useEffect, useState } from "react";

interface Direct {
  id: number;
  createdAt: string;
  members: User[];
  messages: DirectMessage[];
}

interface User {
  id: number;
  username: string;
  directs: Direct[];
  avatar: string;
}

interface DirectMessage {
  id: number;
  createdAt: string;
  user: User;
  content: string;
  direct: Direct;
}

export default function Direct() {
  const [user, setUser] = useState<User>(null!);
  const [isOpen, setIsOpen] = useState(false);
  const [dialogUsername, setDialogUsername] = useState("");
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    fetch("/api/direct")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        console.log(data.user);
      });
  }, []);

  useEffect(() => {
    if (user) {
      const channel = PusherClient.subscribe(`directs-${user.username}`);
      channel.bind("new message", (data) => {
        setUser(data.user);
      });
    }
  }, []);

  const classNames = (...classes) => {
    return classes.filter(Boolean).join(" ");
  };

  const handleNewDirectSubmit = (e) => {
    setIsOpen(false);
    fetch("/api/direct", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: dialogUsername }),
    })
      .then((res) => res.json())
      .then((data) => console.log(data));
  };

  const handleNewMessage = (e) => {
    const directId = e.target.getAttribute("data-direct-id");
    fetch("/api/direct-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: newMessage, directId }),
    })
      .then((res) => res.json())
      .then((data) => console.log(data));
  };

  return (
    <div className="flex justify-center flex-col">
      <p className="text-4xl">Directs</p>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="flex flex-col justify-center w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-950 p-6 text-left align-middle shadow-xl transition-all">
                  <input
                    value={dialogUsername}
                    onChange={(e) => setDialogUsername(e.target.value)}
                    type="text"
                    className="text-black"
                  />

                  <button
                    className="bg-sky-500 mt-4 p-4"
                    onClick={handleNewDirectSubmit}
                  >
                    Message
                  </button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      {user && (
        <div className="w-full px-2 py-16 flex flex-row">
          <Tab.Group vertical={true}>
            <Tab.List className="flex flex-col rounded-xl p-1 w-2/6 h-full">
              <button
                onClick={() => setIsOpen(true)}
                className="w-full rounded-lg py-2.5 text-sm font-medium bg-white shadow text-blue-700"
              >
                new direct
              </button>

              {user.directs.map((direct) => (
                <Tab
                  key={direct.id}
                  className={({ selected }) =>
                    classNames(
                      "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 p-4",
                      selected
                        ? "bg-white shadow"
                        : "text-blue-100 hover:bg-white/[0.12] hover:text-white",
                    )
                  }
                >
                  {
                    direct.members.filter(
                      (member) => member.username !== user.username,
                    )[0].username
                  }
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="w-full">
              {user.directs.map((direct) => (
                <div key={direct.id}>
                  <Tab.Panel
                    key={direct.id}
                    className="rounded-xl bg-white h-full self-end"
                  >
                    <div>
                      {direct.messages.map((message) => (
                        <div
                          key={message.id}
                          className="flex flex-row w-full grid"
                        >
                          {message.user.username === user.username ? (
                            <div className="flex justify-self-end bg-indigo-900 m-1 px-4 rounded-tl-lg rounded-tr-lg rounded-bl-lg p-1 text-white">
                              {message.content}
                            </div>
                          ) : (
                            <div className="flex justify-self-start bg-indigo-500 m-1 px-4 rounded-tl-lg rounded-tr-lg rounded-br-lg p-1 text-white ">
                              {message.content}
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="grid grid-cols-12 content-end self-end">
                        <input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="text-black col-span-10"
                        />
                        <button
                          data-direct-id={direct.id}
                          onClick={handleNewMessage}
                          className="bg-sky-500 col-span-2"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </Tab.Panel>
                </div>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      )}
    </div>
  );
}
