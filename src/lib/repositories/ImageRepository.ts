import { uuid } from "zod";
import s3 from "../s3";
import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const bucket = process.env.S3_BUCKET;

export const uploadImage = async (
  directory: string,
  image: File,
  acl: string
) => {
  const fileKey = `directory/${randomUUID()}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: fileKey,
    Body: image,
    ContentType: image.type,
    ACL: "public-read",
  });

  return s3.send(command);
};
