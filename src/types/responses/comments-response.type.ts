import {CommentType} from "../comment.type";

export type CommentsResponseType = {
  allCount: number,
  comments: CommentType[]|[]
}
