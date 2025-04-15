import {
  postCacheKey,
  userPostsCacheKey,
  PostCacheTTL,
} from "@/constants/cache/post";
import {
  ICreatePostDTO,
  IDeletePostDTO,
  IFindAllPostsDTO,
  IFindPostDTO,
  IFindUserPostsDTO,
  IPostEntity,
  IUpdatePostDTO,
} from "./DTO";

class PostEntity implements IPostEntity {
  constructor(
    public id: string,
    public userId: string,
    public title: string,
    public content: string
  ) {}

  private static async cachePost(post: PostEntity, repositories: any) {
    const { id } = post;

    await repositories.cache.set(
      postCacheKey(id),
      JSON.stringify(post),
      PostCacheTTL
    );
  }

  private static async resolvePostFromIndex(
    indexKey: string,
    repositories: any
  ): Promise<PostEntity | null> {
    const postId = await repositories.cache.get(indexKey);
    if (!postId) return null;

    const cachedPost = await repositories.cache.get(postCacheKey(postId));
    if (cachedPost) return JSON.parse(cachedPost) as PostEntity;

    const post = await repositories.database.find(postId);
    if (!post) return null;

    await PostEntity.cachePost(post, repositories);

    return new PostEntity(post.id, post.userId, post.title, post.content);
  }

  static async create({ id, data, repositories }: ICreatePostDTO) {
    const { userId, title, content } = data;
    const newPost = new PostEntity(id, userId, title, content);

    const post = await repositories.database.create(id, newPost);

    await PostEntity.cachePost(post, repositories);

    return post;
  }

  static async find({ id, repositories }: IFindPostDTO) {
    return await PostEntity.resolvePostFromIndex(
      postCacheKey(id),
      repositories
    );
  }

  // Don't cache this, create a find newest posts method instead and cache that
  static async findAll({ repositories }: IFindAllPostsDTO) {
    const postsData = await repositories.database.findAll();

    if (!postsData) return null;

    const posts = postsData.map(
      (post: any) =>
        new PostEntity(post.id, post.userId, post.title, post.content)
    );

    for (const post of posts) {
      const cachedPostQuery = postCacheKey(post.id);
      await repositories.cache.set(
        cachedPostQuery,
        JSON.stringify(post),
        PostCacheTTL
      );
    }

    return posts;
  }

  static async findUserPosts({ userId, repositories }: IFindUserPostsDTO) {
    const cachedPostsKey = userPostsCacheKey(userId);
    const cachedPosts = await repositories.cache.get(cachedPostsKey);

    if (cachedPosts) return JSON.parse(cachedPosts) as PostEntity[];

    const postsData = await repositories.database.findUserPosts(userId);

    if (!postsData) return null;

    await repositories.cache.set(
      cachedPostsKey,
      JSON.stringify(postsData),
      PostCacheTTL
    );

    const posts = postsData.map(
      (post: any) =>
        new PostEntity(post.id, post.userId, post.title, post.content)
    );

    return posts;
  }

  static async update({ id, data, repositories }: IUpdatePostDTO) {
    const cachedPostKey = postCacheKey(id);
    const updated = await repositories.database.update(id, data);

    const postEntity = new PostEntity(
      updated.id,
      updated.userId,
      updated.title,
      updated.content
    );

    await repositories.cache.set(
      cachedPostKey,
      JSON.stringify(postEntity),
      PostCacheTTL
    );

    return updated;
  }

  static async delete({ id, repositories }: IDeletePostDTO) {
    const cachedPostKey = postCacheKey(id);

    await repositories.cache.del(cachedPostKey);

    return await repositories.database.delete(id);
  }
}

export { PostEntity };
