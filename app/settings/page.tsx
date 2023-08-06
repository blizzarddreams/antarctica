"use client";

import { useState, useEffect } from "react";

interface User {
  id: number;
  username: string;
  description: string;
  email: string;
}

export default function Settings() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
      });
  }, []);

  const handleChange = (e) => {
    const name = e.target.name;
    console.log(name);
    const value = e.target.value;
    console.log(value);
    setUser({ ...(user as User), [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("done");
      });
  };
  return (
    <>
      {user && (
        <form action="/settings" method="POST" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              required
              onChange={handleChange}
              value={user.username}
              className="text-black"
            />

            <label htmlFor="description">Description</label>
            <input
              type="text"
              id="description"
              name="description"
              required
              onChange={handleChange}
              value={user.description}
              className="text-black"
            />

            <label htmlFor="email">E-Mail</label>
            <input
              type="text"
              id="email"
              name="email"
              required
              onChange={handleChange}
              value={user.email}
              className="text-black"
            />
            <button type="submit">Submit</button>
          </div>
        </form>
      )}
    </>
  );
}
