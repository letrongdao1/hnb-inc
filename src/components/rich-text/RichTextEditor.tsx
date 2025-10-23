"use client";

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import { AlignCenterIcon } from "../tiptap-icons/align-center-icon";
import { AlignLeftIcon } from "../tiptap-icons/align-left-icon";
import { AlignRightIcon } from "../tiptap-icons/align-right-icon";
import { ListTodoIcon } from "../tiptap-icons/list-todo-icon";
import { ListIcon } from "../tiptap-icons/list-icon";
import { UnderlineIcon } from "../tiptap-icons/underline-icon";
import { BoldIcon } from "../tiptap-icons/bold-icon";
import { ItalicIcon } from "../tiptap-icons/italic-icon";
import { AlignJustifyIcon } from "../tiptap-icons/align-justify-icon";

export default function RichTextEditor({
  setContent,
  placeholder,
}: {
  setContent: React.Dispatch<React.SetStateAction<string>>;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Placeholder.configure({
        placeholder: placeholder,
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    editorProps: {
      attributes: {
        spellcheck: "false",
        autocorrect: "off",
        autocomplete: "off",
        autocapitalize: "off",
        class:
          "w-full border p-3 rounded min-h-[20em] max-h-[30em] overflow-auto focus:outline-none",
      },
    },
    content: "",
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <div className="w-full rounded-lg border bg-inherit p-3 text-inherit shadow-sm">
      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap gap-1 border-b pb-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={toolbarBtn(editor.isActive("bold"))}
        >
          <BoldIcon />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={toolbarBtn(editor.isActive("italic"))}
        >
          <ItalicIcon />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={toolbarBtn(editor.isActive("underline"))}
        >
          <UnderlineIcon />
        </button>

        <div className="w-4" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={toolbarBtn(editor.isActive("bulletList"))}
        >
          <ListIcon />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={toolbarBtn(editor.isActive("taskList"))}
        >
          <ListTodoIcon />
        </button>

        <div className="w-4" />

        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={toolbarBtn(editor.isActive({ textAlign: "left" }))}
        >
          <AlignLeftIcon />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={toolbarBtn(editor.isActive({ textAlign: "center" }))}
        >
          <AlignCenterIcon />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={toolbarBtn(editor.isActive({ textAlign: "right" }))}
        >
          <AlignRightIcon />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={toolbarBtn(editor.isActive({ textAlign: "justify" }))}
        >
          <AlignJustifyIcon />
        </button>
      </div>

      <EditorContent
        editor={editor}
        className="prose min-h-[150px] max-w-none focus:outline-none"
      />
    </div>
  );
}

// Tailwind utility for toolbar buttons
function toolbarBtn(active: boolean) {
  return `
    px-2 py-1 text-sm rounded-md border duration-200 transition-all opacity-50
    ${active ? "text-md ring-1 opacity-100" : "hover:brightness-80"}
  `;
}
