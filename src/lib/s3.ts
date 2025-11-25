import {
  ListBucketsCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";

const S3_URL = process.env.S3_API_URL;
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY;
const S3_SECRET_ACCESS_KEY = process.env.S3_ACCESS_SECRET;

const s3 = new S3Client({
  region: "auto",
  endpoint: S3_URL!,
  credentials: {
    accessKeyId: S3_ACCESS_KEY!,
    secretAccessKey: S3_SECRET_ACCESS_KEY!,
  },
  // requestStreamBufferSize: 32 * 1024,
});

export default s3;
