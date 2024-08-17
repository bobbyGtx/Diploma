import {ArticleInfoType} from "../article-info.type";

export type ArticlesResponseType = {
  count: number,
  pages: number,
  items: Array<ArticleInfoType>|[]
}
