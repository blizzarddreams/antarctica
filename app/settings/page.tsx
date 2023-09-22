"use client";

import React, { useState, useEffect, useRef } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import { CameraIcon } from "@heroicons/react/24/outline";
import "cropperjs/dist/cropper.css";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type User = {
  id: number;
  username: string;
  description: string;
  displayname: string;
  avatar: string;
  newAvatar: string;
  banner: string;
  newBanner: string;
};

export default function Settings() {
  const [user, setUser] = useState<User | null>(null);
  const [imageProfile, setImageProfile] = useState("");
  const [cropperProfile, setCropperProfile] = useState<string>(null!);
  const cropperRefProfile = useRef<ReactCropperElement>(null);
  const [imageBanner, setImageBanner] = useState<string>(null!);
  const [cropperBanner, setCropperBanner] = useState<string>(null!);
  const cropperRefBanner = useRef<ReactCropperElement>(null);
  const [profileIsOpen, setProfileIsOpen] = useState(false);
  const [bannerIsOpen, setBannerIsOpen] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
      });
  }, []);

  const onCropProfile = () => {
    const cropper = cropperRefProfile.current?.cropper;
    if (typeof cropper !== "undefined") {
      setCropperProfile(cropper?.getCroppedCanvas().toDataURL());
    }
  };

  const onCropBanner = () => {
    const cropper = cropperRefBanner.current?.cropper;
    if (typeof cropper !== "undefined") {
      setCropperBanner(cropper?.getCroppedCanvas().toDataURL());
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setUser({ ...(user as User), [name]: value });
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProfileIsOpen(true);
      setImageProfile(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setBannerIsOpen(true);
      setImageBanner(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData();
    if (cropperProfile) form.append("avatar", cropperProfile);
    if (cropperBanner) form.append("banner", cropperBanner);
    if (user?.username) form.append("username", user.username);
    if (user?.displayname) form.append("displayname", user.displayname);
    if (user?.description) form.append("description", user.description);
    fetch("/api/user", {
      method: "POST",
      body: form,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.errorMessage);
        } else {
          setError("");
        }
        router.push(`/@${data.user.username}`);
      });
  };

  return (
    <div>
      {user && (
        <div>
          {imageProfile && (
            <>
              <Dialog
                onOpenChange={() => setProfileIsOpen(!profileIsOpen)}
                open={profileIsOpen}
              >
                <DialogContent>
                  <Cropper
                    src={imageProfile}
                    crop={onCropProfile}
                    ref={cropperRefProfile}
                    initialAspectRatio={1 / 1}
                    aspectRatio={1 / 1}
                    movable={false}
                    rotatable={false}
                    scalable={false}
                  />
                  <button
                    className="mt-4 bg-sky-200 p-4 dark:bg-sky-500"
                    onClick={() => setProfileIsOpen(!profileIsOpen)}
                  >
                    Save
                  </button>
                </DialogContent>
              </Dialog>
            </>
          )}

          {imageBanner && (
            <>
              <>
                <Dialog
                  onOpenChange={() => setBannerIsOpen(!bannerIsOpen)}
                  open={bannerIsOpen}
                >
                  <DialogContent>
                    <Cropper
                      src={imageBanner}
                      crop={onCropBanner}
                      ref={cropperRefBanner}
                      initialAspectRatio={21 / 9}
                      aspectRatio={29 / 9}
                      movable={false}
                      rotatable={false}
                      scalable={false}
                    />
                    <button
                      className="mt-4  bg-sky-200 p-4 dark:bg-sky-500"
                      onClick={() => setBannerIsOpen(!bannerIsOpen)}
                    >
                      Save
                    </button>
                  </DialogContent>
                </Dialog>
              </>
            </>
          )}

          <form action="/settings" method="POST" onSubmit={handleSubmit}>
            <div className="">
              <label htmlFor="banner">
                {cropperBanner && !bannerIsOpen ? (
                  <header
                    className={`relative h-52 w-full cursor-pointer bg-cover bg-center`}
                    style={{ backgroundImage: `url(${cropperBanner})` }}
                  >
                    <CameraIcon className="absolute bottom-0  right-0 m-4 h-6 w-6 rounded-full border-none bg-slate-950 p-1" />
                  </header>
                ) : (
                  <header
                    className={`relative h-52 w-full cursor-pointer bg-cover bg-center`}
                    style={{
                      backgroundImage: `url('${user.banner}')})`,
                    }}
                  >
                    <CameraIcon className="absolute bottom-0  right-0 m-4 h-6 w-6 rounded-full border-none bg-slate-950 p-1" />
                  </header>
                )}
              </label>
              <input
                type="file"
                name="banner"
                id="banner"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleBannerChange}
                className="hidden w-full cursor-pointer border border-gray-700 bg-gray-50 file:border file:border-none file:bg-gray-800 file:text-white dark:bg-gray-700"
              />
              <div className="w-100 my-10 flex flex-row items-center">
                <label htmlFor="profile">
                  {cropperProfile && !profileIsOpen ? (
                    <>
                      <Image
                        src={cropperProfile}
                        alt="a"
                        width={100}
                        height={100}
                        className="absolute top-40 m-2 cursor-pointer rounded-full border-2 border-solid border-slate-950"
                      />
                      <div className="relative">
                        <CameraIcon className="absolute -top-10 m-4 h-6 w-6 rounded-full border-none bg-slate-950 p-1" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Image
                        src={user.banner}
                        alt={user.username}
                        width={100}
                        height={100}
                        className="absolute top-40 m-2 cursor-pointer rounded-full border-2 border-solid border-slate-950"
                      />
                      <div className="relative">
                        <CameraIcon className="absolute -top-10 m-4 h-6 w-6 rounded-full border-none bg-slate-950 p-1" />
                      </div>
                    </>
                  )}
                </label>
                <input
                  id="profile"
                  type="file"
                  name="profile"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleProfileChange}
                  className="hidden w-full cursor-pointer border border-gray-700 bg-gray-50 file:border file:border-none file:bg-gray-800 file:text-white dark:bg-gray-700"
                />
              </div>

              <div className="flex flex-col">
                <Label
                  htmlFor="username"
                  className="mt-4 text-black dark:text-white"
                >
                  Username
                </Label>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  required
                  onChange={handleChange}
                  value={user.username}
                  className="border-slate-800 bg-slate-400 text-black focus:border-transparent focus:outline-transparent  focus:ring-transparent dark:bg-slate-800 dark:text-white"
                />
                {error && <p className="text-rose-400">{error}</p>}
                <Label
                  htmlFor="description"
                  className="mt-4 text-black dark:text-white"
                >
                  Display Name
                </Label>
                <Input
                  type="text"
                  id="displayname"
                  name="displayname"
                  onChange={handleChange}
                  value={user.displayname}
                  className="border-slate-800 bg-slate-400 text-black focus:border-transparent focus:outline-transparent  focus:ring-transparent dark:bg-slate-800 dark:text-white"
                />

                <Label
                  htmlFor="description"
                  className="mt-4 text-black dark:text-white"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  onChange={handleChange}
                  value={user.description}
                  className="border-slate-800 bg-slate-400 text-black focus:border-transparent focus:outline-transparent  focus:ring-transparent dark:bg-slate-800 dark:text-white"
                />

                <button type="submit" className=" my-1 bg-slate-800 p-4">
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
