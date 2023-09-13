"use client";

import React, { useState, useEffect, useRef } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import { CameraIcon } from "@heroicons/react/24/outline";
import "cropperjs/dist/cropper.css";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
                    className="bg-sky-500 mt-4 p-4"
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
                      className="bg-sky-500 mt-4 p-4"
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
                    className={`w-full h-52 bg-cover bg-center cursor-pointer relative`}
                    style={{ backgroundImage: `url(${cropperBanner})` }}
                  >
                    <CameraIcon className="w-6 h-6  absolute bottom-0 right-0 bg-slate-950 rounded-full m-4 p-1 border-none" />
                  </header>
                ) : (
                  <header
                    className={`w-full h-52 bg-cover bg-center cursor-pointer relative`}
                    style={{
                      backgroundImage: `url('https://cdn.notblizzard.dev/antarctica/banners/${user.banner}.png')})`,
                    }}
                  >
                    <CameraIcon className="w-6 h-6  absolute bottom-0 right-0 bg-slate-950 rounded-full m-4 p-1 border-none" />
                  </header>
                )}
              </label>
              <input
                type="file"
                name="banner"
                id="banner"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleBannerChange}
                className="hidden file:bg-gray-800 file:text-white file:border file:border-none w-full border border-gray-700 cursor-pointer bg-gray-50 dark:bg-gray-700"
              />
              <div className="my-10 flex flex-row items-center w-100">
                <label htmlFor="profile">
                  {cropperProfile && !profileIsOpen ? (
                    <>
                      <Image
                        src={cropperProfile}
                        alt="a"
                        width={100}
                        height={100}
                        className="m-2 border-slate-950 absolute top-40 rounded-full border-solid border-2 cursor-pointer"
                      />
                      <div className="relative">
                        <CameraIcon className="w-6 h-6 -top-10 absolute bg-slate-950 rounded-full m-4 p-1 border-none" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Image
                        src={`https://cdn.notblizzard.dev/antarctica/avatars/${user.banner}.png`}
                        alt={user.username}
                        width={100}
                        height={100}
                        className="m-2 border-slate-950 absolute top-40 rounded-full border-solid border-2 cursor-pointer"
                      />
                      <div className="relative">
                        <CameraIcon className="w-6 h-6 -top-10 absolute bg-slate-950 rounded-full m-4 p-1 border-none" />
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
                  className="file:bg-gray-800 hidden file:text-white file:border file:border-none block w-full border border-gray-700 cursor-pointer bg-gray-50 dark:bg-gray-700"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="username" className="mt-4">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  onChange={handleChange}
                  value={user.username}
                  className="bg-slate-800 border-slate-800 text-white  focus:border-transparent focus:outline-transparent focus:ring-transparent"
                />
                {error && <p className="text-rose-400">{error}</p>}
                <label htmlFor="description" className="mt-4">
                  Display Name
                </label>
                <input
                  type="text"
                  id="displayname"
                  name="displayname"
                  onChange={handleChange}
                  value={user.displayname}
                  className="bg-slate-800 border-slate-800 text-white  focus:border-transparent focus:outline-transparent focus:ring-transparent"
                />

                <label htmlFor="description" className="mt-4">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  onChange={handleChange}
                  value={user.description}
                  className="bg-slate-800 border-slate-800 text-white  focus:border-transparent focus:outline-transparent focus:ring-transparent"
                />

                <button type="submit" className=" bg-slate-800 p-4 my-1">
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
