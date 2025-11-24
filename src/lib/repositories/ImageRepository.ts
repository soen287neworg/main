import s3 from "../s3";
import { randomUUID } from "crypto";
import { ObjectCannedACL, PutObjectCommand } from "@aws-sdk/client-s3";

const bucket = process.env.S3_BUCKET;

export const uploadImage = async (
  directory: string,
  image: File,
  acl?: ObjectCannedACL
) => {
  const fileKey = `${directory}/${randomUUID()}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: fileKey,
    Body: image,
    ContentType: image.type,
    ACL: acl || "public-read",
  });

  return s3.send(command);
};
