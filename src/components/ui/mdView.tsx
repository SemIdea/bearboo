"use client";

import MDEditor from "@uiw/react-md-editor";

const MdView = ({ source }: { source: string }) => {
  return (
    <MDEditor.Markdown
      className="markdown markdown-viewer w-[800px]"
      source={source}
    />
  );
};

export { MdView };
