import {Component, OnDestroy, OnInit} from '@angular/core';
import {ArticleInfoType} from "../../../../types/article-info.type";
import {AuthService} from "../../../core/auth/auth.service";
import {ArticleType} from "../../../../types/article.type";
import {ArticleService} from "../../../shared/services/article.service";
import {ActivatedRoute} from "@angular/router";
import {map, Subscription} from 'rxjs';
import {MatSnackBar} from "@angular/material/snack-bar";
import {CommentPostType} from "../../../../types/comment-post.type";
import {CommentService} from "../../../shared/services/comment.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {CommentsResponseType} from "../../../../types/responses/comments-response.type";
import {CommentType} from "../../../../types/comment.type";
import {CommentsActionsResponseType} from "../../../../types/responses/comments-actions-response.type";
import {CommentActionType} from "../../../../types/comment-action.type";
import {CommentActionsType} from "../../../../types/comment-actions.type";

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit, OnDestroy {
  private subscription$: Subscription = new Subscription();
  private paramsSubscription$: Subscription|null=null;
  articleFull!: ArticleType;//Переменная для хранения полной статьи
  currentURL:string='';
  recommendedArticles: Array<ArticleInfoType> = [];//Переменная для хранения рекомендованных статей
  isLoggedIn: boolean = false;
  commentText: string | null = null;//Текст комментария от пользователя в textarea
  userActions: Array<CommentActionType> | [] | null = null;//переменная с реакциями пользователя на комментарии к статье

  commentsSettings: {
    startShowed: number,
    showingStep: number
  } = {
    startShowed: 3,
    showingStep: 10
  };
  hiddenComments: number = 0;//не загруженные комменты

  constructor(private authService: AuthService,
              private activatedRoute: ActivatedRoute,
              private articleService: ArticleService,
              private commentService: CommentService,
              private _snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.getIsLoggedIn();
    this.subscription$.add(this.authService.isLogged$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    }));
    this.subscription$.add(this.activatedRoute.params.subscribe(params => {
      this.hiddenComments = 0;
      this.userActions = null;
      this.subscription$.add(this.articleService.getRelatedArticles(params['url'])
        .subscribe((recArticles: ArticleInfoType[]) => {
        this.recommendedArticles = recArticles;
      }));

      return this.paramsSubscription$ = this.articleService.getArticle(params['url'])
        .pipe(
          map((data: ArticleType) => {
            let newData: ArticleType = data;
            newData.text = newData.text.slice(newData.text.indexOf('</p>')).replace(/\\n/gm, '');
            this.hiddenComments=newData.commentsCount-newData.comments.length;
            newData = this.checkCommentsActions(newData);//Запрос действий к комментам
            return newData;
          })
        ).subscribe((data: ArticleType) => {
          this.articleFull = data;
          this.currentURL=window.location.href;
        });
    }));
  }

  addComment() {
    if (this.commentText && this.commentText.length > 0) {
      let commentObject: CommentPostType = {
        text: this.commentText,
        article: this.articleFull.id,
      };
      this.subscription$.add(
      this.commentService.addComment(commentObject).subscribe((response: DefaultResponseType) => {
        if (response) {
          if (response.error) {
            const errMessage: string = response.message ? response.message : 'Неизвестная ошибка. Коментарий не опубликован!';
            this._snackBar.open(errMessage, 'Ok');
            throw new Error(errMessage);
          }
          if (response.message && response.message.length > 0) this._snackBar.open(response.message, 'Ok');
          this.commentText = '';
          this.subscription$.add(this.commentService.getArticleComments(this.articleFull.id, 0)
            .subscribe((comments: CommentsResponseType) => {
              let newData: ArticleType = this.articleFull;
              let showedCommentsCount:number = 3;
              if (this.articleFull.comments.length > 3) {
                showedCommentsCount=comments.allCount<(this.commentsSettings.showingStep)?comments.allCount:this.commentsSettings.showingStep;
              }else{
                showedCommentsCount=comments.allCount<(this.commentsSettings.startShowed)?comments.allCount:this.commentsSettings.startShowed;
              }
              newData.commentsCount = comments.allCount;
              newData.comments = comments.comments.slice(0, showedCommentsCount);
              this.hiddenComments=newData.commentsCount-newData.comments.length;
              this.articleFull = this.refillCommentsActions(newData);
            }));
        }
      }));
    } else {
      this._snackBar.open('Нельзя опубликовать пустой комментарий!', 'Ok');
    }
  }

  showMoreComments() {
    if (!this.hiddenComments) return;
    this.subscription$.add(this.commentService.getArticleComments(this.articleFull.id, this.articleFull.comments.length)
      .subscribe((comments: CommentsResponseType) => {
        let newData: ArticleType = this.articleFull;
        newData.commentsCount = comments.allCount;
        newData.comments=[...newData.comments,...comments.comments];
        this.hiddenComments=newData.commentsCount-newData.comments.length;
        this.articleFull = this.refillCommentsActions(newData);
      }));
  }

  checkCommentsActions(newData: ArticleType): ArticleType {
    if (this.isLoggedIn && newData.commentsCount > 0) {
      this.subscription$.add(this.commentService.getArticleCommentsActions(newData.id)
        .subscribe((response: CommentsActionsResponseType | DefaultResponseType) => {
          if ((response as DefaultResponseType).error !== undefined) {
            const error = (response as DefaultResponseType).message;
            throw new Error(error);
          }
          const commentsActions: CommentsActionsResponseType = response as CommentsActionsResponseType;
          this.userActions = commentsActions;
          if (commentsActions.length > 0) {
            newData.comments.forEach((commentItem: CommentType) => {
              const commentAction: CommentActionType | undefined = commentsActions.find((actionItem: CommentActionType) => actionItem.comment === commentItem.id);
              if (commentAction) {
                commentItem.action = commentAction.action;
              }
            });
          }
        }));
    }
    return newData;
  }

  //Тут реализован механизм единственного запроса GetArticleCommentActions с сервера и сохранение результата в переменную.
  // В дальнейшем эта переменная будет актуализироваться за счёт обратной связи от дочернего компонента с карточкой коментария.
  // При увеличении списка отображаемых комментов данные будут браться из переменной.
  // Это актуально когда пользователь поставил оценки видимым комментам, а потом расширил список.
  // Вот тут-то мы и не делаем повторный запрос с сервера
  refillCommentsActions(article: ArticleType): ArticleType {
    let newData: ArticleType = article;
    if (this.userActions && this.userActions.length > 0) {
      newData.comments.forEach((commentItem: CommentType) => {
        const commentAction: CommentActionType | undefined = this.userActions!.find((actionItem: CommentActionType) => actionItem.comment === commentItem.id);
        if (commentAction) {
          commentItem.action = commentAction.action;
        }
      });
    }
    return newData
  };

  updateComment(comment: CommentType): void {
    if (this.userActions && Array.isArray(this.userActions)) {
      if (this.userActions.length === 0) {
        (this.userActions as Array<CommentActionType>).push(
          {
            comment: comment.id,
            action: comment.action as CommentActionsType,
          }
        );
      } else {
        const commentActionIndex: number = (this.userActions as Array<CommentActionType>).findIndex((actionItem: CommentActionType) => actionItem.comment === comment.id);
        if (commentActionIndex !== undefined && commentActionIndex > -1) {
          this.userActions[commentActionIndex].action = comment.action as CommentActionsType;
        } else {
          (this.userActions as Array<CommentActionType>).push(
            {
              comment: comment.id,
              action: comment.action as CommentActionsType,
            }
          );
        }
      }
    }
  };

  ngOnDestroy() {
    this.subscription$.unsubscribe();
    this.paramsSubscription$?.unsubscribe();
  }
}
