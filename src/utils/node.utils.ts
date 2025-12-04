import { FolderNode } from "@/lib/s3/folders";

export const NodeUtils = {
  insertFolderNode: (tree: FolderNode[], relativePath: string): FolderNode[] => {
    const parts = relativePath.split("/");

    function insertAtLevel(nodes: FolderNode[], idx: number, currentPath: string): FolderNode[] {
      const name = parts[idx];
      const fullPath = currentPath ? `${currentPath}/${name}` : name;

      let node = nodes.find((n) => n.path === name);

      if (!node) {
        node = {
          label: name,
          path: name,
          relativePath: fullPath,
          children: undefined,
        };
        nodes.push(node);
      }

      if (idx < parts.length - 1) {
        node.children = insertAtLevel(node.children ?? [], idx + 1, fullPath);
      }

      return nodes;
    }

    return insertAtLevel([...tree], 0, "");
  },
  findNodeChain: (tree: FolderNode[], relativePath: string): FolderNode[] => {
    const parts = relativePath.split("/").filter(Boolean);
    const chain: FolderNode[] = [];

    let currentLevel = tree;

    for (const part of parts) {
      const found = currentLevel.find((node) => node.path === part);

      if (!found) break;

      chain.push(found);
      currentLevel = found.children ?? [];
    }

    return chain;
  },
};
