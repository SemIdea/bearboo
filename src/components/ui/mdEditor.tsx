"use client";

import { MDEditorProps, PreviewType } from "@uiw/react-md-editor";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false
});

const MdEditor = ({
  preview,
  value,
  onChange
}: {
  preview: PreviewType;
  value?: MDEditorProps["value"];
  onChange?: MDEditorProps["onChange"];
}) => {
  return (
    <MDEditor
      className="markdown markdown-editor"
      preview={preview}
      value={value}
      onChange={onChange}
    />
  );
};

export { MdEditor };
