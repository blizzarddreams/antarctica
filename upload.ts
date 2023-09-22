import { v4 as uuidv4 } from "uuid";
import { put } from "@vercel/blob";

export default async function upload(image: Buffer, folder: string) {
  const uuid = uuidv4();

  const blob = await put(`${folder}/${uuid}.png`, image, {
    contentType: "image/png",
    access: "public",
  });

  return blob.url;
}
