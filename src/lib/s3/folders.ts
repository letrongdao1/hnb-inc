import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3 } from "./s3";

export interface FolderNode {
  label: string;
  path: string;
  relativePath?: string;
  children?: FolderNode[];
}

export async function listAllFolders(bucket: string, prefix = ""): Promise<string[]> {
  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: prefix,
    Delimiter: "/",
  });

  const result = await s3.send(command);

  const folders = (result.CommonPrefixes ?? []).map((p) => p.Prefix!);

  let allFolders: string[] = [...folders];

  for (const folder of folders) {
    const subFolders = await listAllFolders(bucket, folder);
    allFolders = allFolders.concat(subFolders);
  }

  return allFolders;
}

export function buildFolderTree(folders: string[], rootFolder = ""): FolderNode[] {
  const tree: FolderNode[] = [];
  const map: Record<string, FolderNode> = {};

  folders.forEach((fullPath) => {
    const cleanedPath = fullPath.replace(/\/$/, "");
    const parts = cleanedPath.split("/");

    let currentPath = "";
    let parent: FolderNode[] = tree;

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!map[currentPath]) {
        const relativePath = rootFolder ? currentPath.replace(`${rootFolder}/`, "") : currentPath;

        const node: FolderNode = {
          label: part,
          path: part,
          relativePath,
          children: [],
        };

        map[currentPath] = node;
        parent.push(node);
      }

      parent = map[currentPath].children!;
    });
  });

  function cleanChildren(nodes: FolderNode[]) {
    nodes.forEach((n) => {
      if (n.children?.length === 0) delete n.children;
      else if (n.children) cleanChildren(n.children);
    });
  }

  cleanChildren(tree);
  return tree;
}
