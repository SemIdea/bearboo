import MDEditor from "@uiw/react-md-editor";

const MDView = ({ source }: { source: string }) => {
  return (
    <MDEditor.Markdown
      className="markdown markdown-viewer w-[800px]"
      source={source}
    />
  );
};

export { MDView };
