"use client";

import { Dialog } from "@headlessui/react";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const openDialog = (e) => {
    setIsOpen(true);
  };

  const closeDialog = (e) => {
    setIsOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onClose={closeDialog}>
        <Dialog.Panel>
          <Dialog.Title>Hi</Dialog.Title>
          <Dialog.Description>fewagewagewagewagewagrewagewa</Dialog.Description>
        </Dialog.Panel>
        <button onClick={closeDialog}>NVM</button>
      </Dialog>
      <div className="flex flex-col">
        <button onClick={openDialog}>New Post</button> <button>Test</button>
      </div>
    </>
  );
}
