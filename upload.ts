import cloudinary from "./cloudinary";
import streamifier from "streamifier";

export default async function upload(arrayBuffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folder },
      async (err, result) => {
        console.log(result);
        return resolve(result.secure_url);
      },
    );
    streamifier.createReadStream(Buffer.from(arrayBuffer)).pipe(stream);
  });
}
