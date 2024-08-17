import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {CommentType} from "../../../../types/comment.type";
import {CommentService} from "../../services/comment.service";
import {CommentActionsType} from "../../../../types/comment-actions.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {HttpErrorResponse} from "@angular/common/http";
import {Subscription} from "rxjs";

@Component({
  selector: 'comment-card',
  templateUrl: './comment-card.component.html',
  styleUrls: ['./comment-card.component.scss']
})
export class CommentCardComponent implements OnInit, OnDestroy {
  private subscription$: Subscription = new Subscription();

  @Input() comment!: CommentType;
  @Output() onReactionChange:EventEmitter<CommentType>=new EventEmitter<CommentType>();

  constructor(private commentService: CommentService, private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
  }

  protected readonly CommentActionsType = CommentActionsType;

  applyAction(actionsType: CommentActionsType): void {
    this.subscription$.add(    this.commentService.applyAction(this.comment.id, actionsType)
      .subscribe({
          next: (response: DefaultResponseType) => {
            if(response.error){
              let errorMessage:string='Произошла ошибка!';
              if (response.message) errorMessage=response.message;
              this._snackBar.open('response.message', 'Ok');
              throw new Error(errorMessage);
            }
            this.calculateAction(actionsType,response.message);
            this.onReactionChange.emit(this.comment);
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.error.message) {
              if ( actionsType===CommentActionsType.violate && errorResponse.error.message === 'Это действие уже применено к комментарию') {
                this._snackBar.open('Жалоба уже отправлена!', 'Ok')
              } else {
                this._snackBar.open(errorResponse.error.message, 'Ok')
              }
            } else {
              this._snackBar.open('Произошла ошибка!', 'Ok')
            }
          }
        }
      ));
  }

  calculateAction(actionType: CommentActionsType,message:string):void{
    if (actionType===CommentActionsType.violate ) {
      if (message && message==='Успешное действие!'){
        this._snackBar.open('Жалоба отправлена.', 'Ok');
      }else{
        this._snackBar.open(message, 'Ok');
      }
    }else{
      if (message==='Успешное действие!'){
        if(this.comment.action===actionType){
          this._snackBar.open('Ваш голос отменен!', 'Ok');
          delete this.comment.action;
          if(actionType===CommentActionsType.like) this.comment.likesCount--; else this.comment.dislikesCount--;
        }else{
          this._snackBar.open('Ваш голос учтен!', 'Ok');
          if(actionType===CommentActionsType.like){
            this.comment.likesCount++;
            if(this.comment.action===CommentActionsType.dislike) this.comment.dislikesCount--;
          } else {
            this.comment.dislikesCount++;
            if(this.comment.action===CommentActionsType.like) this.comment.likesCount--;
          }
          this.comment.action=actionType;
        }
      }else{
        this._snackBar.open(message, 'Ok');
      }
    }
  }

  ngOnDestroy() {
    this.subscription$.unsubscribe();
  }
}
