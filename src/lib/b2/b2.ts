import { S3Client } from "@aws-sdk/client-s3";

export const b2 = new S3Client({
  region: "auto",
  endpoint: process.env.B2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.B2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.B2_SECRET_KEY!,
  },
});
