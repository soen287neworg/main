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

  // Convert Web File to Buffer for AWS SDK compatibility
  const arrayBuffer = await image.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: fileKey,
    Body: buffer,
    ContentType: image.type,
    ACL: acl,
  });

  await s3.send(command);

  // Return the file key for URL construction
  return fileKey;
};
