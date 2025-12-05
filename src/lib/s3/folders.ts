import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3 } from "./s3";

export interface FolderNode {
  label: string;
  path: string;
  relativePath?: string;
  children?: FolderNode[];
}

export async function listAllFolders(folder: string = ""): Promise<string[]> {
  const bucket = process.env.B2_BUCKET_NAME!;

  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: Boolean(folder) ? (folder.endsWith("/") ? folder : folder + "/") : "",
    Delimiter: "/",
  });

  const result = await s3.send(command);

  const folders = (result.CommonPrefixes ?? []).map((p) => p.Prefix!);

  return folders;
}
