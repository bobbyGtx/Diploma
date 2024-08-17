import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from "../../../core/auth/auth.service";
import {UserService} from "../../services/user.service";
import {UserInfoType} from "../../../../types/user-info.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {HttpErrorResponse} from "@angular/common/http";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private subscription$: Subscription = new Subscription();
  isLoggedIn:boolean=false;
  userName:string='';
  constructor(private authService:AuthService, private userService:UserService,private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.subscription$.add(this.authService.isLogged$
      .subscribe(isLoggedIn => {
      this.isLoggedIn=isLoggedIn;
      if (this.isLoggedIn){
        if (this.userService.userName!==''){
          this.userName=this.userService.userName;
        }else{
          this.getUserData();
        }
      }else{
        this.userService.clearUserInfo();
        this.userName='';
      }
    }));
    this.isLoggedIn = this.authService.getIsLoggedIn();
    if (this.isLoggedIn){
      if (this.userService.userName!==''){
        this.userName=this.userService.userName;
      }else{
        this.getUserData();
      }
    }
  }
  logout(){
    this.subscription$.add(
      this.authService.logout()
        .subscribe({
          next: () => {
            this.authService.removeTokens();
            this.authService.userId=null;
            this._snackBar.open('Вы успешно вышли из системы!', 'ok');
          },
          error:()=>{
            this.authService.removeTokens();
            this.authService.userId=null;
            this._snackBar.open('Вы вышли из системы с ошибкой!', 'ok');
          }
        })
    );
    this.authService.removeTokens();
  }
  getUserData(){
    this.subscription$.add(
      this.userService.getUserInfo()
        .subscribe({
          next:(data:UserInfoType|DefaultResponseType)=>{
            if ((data as DefaultResponseType).error !== undefined) {
              const error = (data as DefaultResponseType).message;
              throw new Error(error);
            }
            const userInfo:UserInfoType = data as UserInfoType;
            if (this.userService.setUserInfo(userInfo)){
              this.userName=this.userService.userName;
              this.authService.userId=userInfo.id;
            }else{
              this._snackBar.open('Ошибка данных пользователя. Вы были разлогинены!','ok')
              this.logout();
            }
          },
          error:(errorResponse:HttpErrorResponse)=>{
            if (errorResponse.error && errorResponse.error.message){
              //Если есть ошибка - выводим это пользователю
              this._snackBar.open(errorResponse.error.message,'Ok');
            }else{
              if (errorResponse.status===0){
                this._snackBar.open('Ошибка. Сервер не отвечает','Ok');
                this.authService.setLogoffState();
              }else{
                this._snackBar.open('Ошибка. Сервисы могут работать не корректно!','Ok');
              }
            }//Если сообщения нет - выводим это
          }
        })
    );
  }

  ngOnDestroy() {
    this.subscription$.unsubscribe();
  }
}
