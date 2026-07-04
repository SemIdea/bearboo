import { createDomain, DomainInput } from "@/server/createDomain";
import { CreatePostInput } from "../schema";

const domain_createPost = createDomain(
  async ({
    ctx,
    input
  }: DomainInput<CreatePostInput & { userId: string }>) => {
    const postId = ctx.helpers.uid.generate();

    return ctx.repositories.post.create(postId, input);
  }
);

export { domain_createPost };
