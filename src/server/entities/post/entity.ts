import { IPostEntity } from "./DTO";

class PostEntity implements IPostEntity {
  constructor(
    public id: string,
    public userId: string,
    public title: string,
    public content: string,
  ) {}

  //   static async create({
  //       id, data, repositoires
  //   })
}

export { PostEntity };
