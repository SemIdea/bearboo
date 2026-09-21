"use client";

import MDEditor from "@uiw/react-md-editor";

const MdView = ({ source }: { source: string }) => {
	return (
		<MDEditor.Markdown
			className="markdown markdown-viewer w-full max-w-none"
			source={source}
		/>
	);
};

export { MdView };
