import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3 } from "./s3";

export interface FolderNode {
  label: string;
  path: string;
  children?: FolderNode[];
}

export async function listFolders(folder: string = ""): Promise<string[]> {
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

export async function listAllFolderTree(prefix: string = ""): Promise<FolderNode[]> {
  const bucket = process.env.B2_BUCKET_NAME!;

  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: prefix,
    Delimiter: "/",
  });

  const result = await s3.send(command);

  const folders = result.CommonPrefixes ?? [];

  return Promise.all(
    folders.map(async (f) => {
      const fullPath = f.Prefix!;
      const name = fullPath.slice(prefix.length).replace("/", "");

      return {
        label: name.replace(/\/$/, ""),
        path: fullPath.replace(/\/$/, ""),
        children: await listAllFolderTree(fullPath),
      };
    })
  );
}
