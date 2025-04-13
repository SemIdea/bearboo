import { Posts } from "./index.client";

const PostFeed = () => (
  <div>
    <h2>
      <b>Posts</b>
    </h2>
    <Posts max={20} />
  </div>
);

export { PostFeed };
