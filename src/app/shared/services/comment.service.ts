import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {CommentPostType} from "../../../types/comment-post.type";
import {DefaultResponseType} from "../../../types/default-response.type";
import {CommentsResponseType} from "../../../types/responses/comments-response.type";
import {CommentsActionsResponseType} from "../../../types/responses/comments-actions-response.type";
import {CommentActionsType} from "../../../types/comment-actions.type";

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private http: HttpClient) {
  }

  addComment(comment: CommentPostType): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(environment.api + 'comments', comment);
  }

  applyAction(commentId:string,action:CommentActionsType):Observable<DefaultResponseType>{
    return this.http.post<DefaultResponseType>(environment.api+'comments/'+commentId+'/apply-action',{action:action});
  }

  getArticleComments(articleId: string, offset: number): Observable<CommentsResponseType> {
    const params: {
      article: string,
      offset: number
    } = {
      article: articleId,
      offset: offset
    };
    return this.http.get<CommentsResponseType>(environment.api + 'comments', {params});
  }
  getArticleCommentsActions(articleId: string):Observable<CommentsActionsResponseType | DefaultResponseType>{
    return this.http.get<CommentsActionsResponseType | DefaultResponseType>(environment.api+'comments/article-comment-actions?articleId='+articleId);
  }

}
