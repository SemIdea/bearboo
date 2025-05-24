import {
  ICachePostDTO,
  ICacheUserPostsDTO,
  ICreatePostDTO,
  IDeletePostDTO,
  IFindAllPostsDTO,
  IFindPostDTO,
  IFindUserPostsDTO,
  IPostEntity,
  IResolvePostFromIndexDTO,
  IUpdatePostDTO,
} from "./DTO";
import {
  postCacheKey,
  userPostsCacheKey,
  PostCacheTTL,
} from "@/constants/cache/post";

class PostEntity implements IPostEntity {
  constructor(
    public id: string,
    public userId: string,
    public title: string,
    public content: string
  ) {}

  private static async cachePost({ post, repositories }: ICachePostDTO) {
    const { id } = post;

    await repositories.cache.mset(
      [postCacheKey(id)],
      [JSON.stringify(post)],
      PostCacheTTL
    );
  }

  private static async cacheUserPosts({
    userId,
    posts,
    repositories,
  }: ICacheUserPostsDTO) {
    await repositories.cache.mset(
      [
        userPostsCacheKey(userId),
        ...posts.map((post) => postCacheKey(post.id)),
      ],
      [
        posts.map((post) => post.id).join(","),
        ...posts.map((post) => JSON.stringify(post)),
      ]
    );
  }

  private static async resolvePostFromIndex({
    indexKey,
    indexKeyCaller,
    findOnDatabase,
    repositories,
  }: IResolvePostFromIndexDTO) {
    const lookupCacheKey = indexKeyCaller(indexKey);
    const cachedIndexValue = await repositories.cache.get(lookupCacheKey);

    if (cachedIndexValue) {
      try {
        const maybePost = JSON.parse(cachedIndexValue) as PostEntity;

        if (maybePost.id) return maybePost;
      } catch (error) {
        const fallbackCacheKey = postCacheKey(cachedIndexValue);
        const fallbackCachePost =
          await repositories.cache.get(fallbackCacheKey);

        if (fallbackCachePost)
          return JSON.parse(fallbackCachePost) as PostEntity;
      }
    }

    const postFromDb = await findOnDatabase(indexKey);
    if (!postFromDb) return null;

    await PostEntity.cachePost({
      post: postFromDb,
      repositories,
    });

    return postFromDb;
  }

  static async create({ id, data, repositories }: ICreatePostDTO) {
    const { userId, title, content } = data;
    const newPost = new PostEntity(id, userId, title, content);

    const post = await repositories.database.create(id, newPost);

    await PostEntity.cachePost({
      post,
      repositories,
    });

    return post;
  }

  static async find({ id, repositories }: IFindPostDTO) {
    return await PostEntity.resolvePostFromIndex({
      indexKey: id,
      indexKeyCaller: postCacheKey,
      findOnDatabase: repositories.database.find,
      repositories,
    });
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
    const cachedPosts = await repositories.cache.get(userPostsCacheKey(userId));

    if (cachedPosts) return JSON.parse(cachedPosts) as PostEntity[];

    const postsData = await repositories.database.findUserPosts(userId);

    if (!postsData) return null;

    await PostEntity.cacheUserPosts({
      userId,
      posts: postsData,
      repositories,
    });

    return postsData as PostEntity[];
  }

  static async update({ id, data, repositories }: IUpdatePostDTO) {
    const updated = await repositories.database.update(id, data);

    const postEntity = new PostEntity(
      updated.id,
      updated.userId,
      updated.title,
      updated.content
    );

    await PostEntity.cachePost({
      post: postEntity,
      repositories,
    });

    return updated;
  }

  static async delete({ id, repositories }: IDeletePostDTO) {
    await repositories.cache.mdel([postCacheKey(id)]);

    return await repositories.database.delete(id);
  }
}

export { PostEntity };
