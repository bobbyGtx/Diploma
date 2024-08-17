import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AuthService} from "../../../core/auth/auth.service";
import {UserLoginType} from "../../../../types/user-login.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {LoginResponseType} from "../../../../types/responses/login-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {Router} from "@angular/router";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private subscription$: Subscription = new Subscription();
  showPwd:boolean=false;
  passwordIncorrect:boolean=false;
  userNotFound:boolean=false;
  loginForm = this.fb.group({
    userEmail: ['', [Validators.required, Validators.pattern(/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu)]],
    userPassword: ['', Validators.required],
    rememberMe: [false],
  });

  get userEmail() {
    return this.loginForm.get('userEmail');
  }
  get userPassword() {
    return this.loginForm.get('userPassword');
  }
  constructor(private fb: FormBuilder,
              private _snackBar: MatSnackBar,
              private authService: AuthService,
              private router: Router,) { }

  ngOnInit(): void {}

  login(){
    if (this.loginForm.valid && this.loginForm.value.userEmail && this.loginForm.value.userPassword) {
      const loginData:UserLoginType={
        email: this.loginForm.value.userEmail,
        password: this.loginForm.value.userPassword,
        rememberMe: Boolean(this.loginForm.value.rememberMe),
      }
      this.subscription$.add(this.authService.login(loginData).subscribe({
        next: (data:DefaultResponseType|LoginResponseType) => {
          let error=null;
          if ((data as DefaultResponseType).error!==undefined){
            error=(data as DefaultResponseType).message;
          }
          const loginResponse:LoginResponseType = data as LoginResponseType;
          if (!error){
            if (!loginResponse.accessToken || !loginResponse.refreshToken || !loginResponse.userId){
              error="С сервера пришли не полные данные."
            }
          }
          if (error){
            this._snackBar.open(error,'Ok');
            throw new Error(error);
          }
          this.authService.setTokens(loginResponse.accessToken, loginResponse.refreshToken,Boolean(this.loginForm.value.rememberMe));
          this._snackBar.open('Вы вошли в систему!','Ok');
          this.router.navigate(['/']).then;
        },
        error:(errorResponse:HttpErrorResponse)=>{
          if (errorResponse.error && errorResponse.error.message){
            //Если есть ошибка - выводим это пользователю
            if (errorResponse.status===401){
              if(errorResponse.error.message==='Неправильный E-mail или пароль'){
                this.showRedBorder(true);
              }else if(errorResponse.error.message==='Пользователь не найден'){
                this.showRedBorder();
              }
              this._snackBar.open(errorResponse.error.message,'Ok');
            }else{
              this._snackBar.open(errorResponse.error.message, 'Ok');
            }
          }else{
            this._snackBar.open('Ошибка авторизации','Ok');
          }//Если сообщения нет - выводим это
        }//Обработка кода ответа 400 либо 500 например. Если в ответе 200 приходит флаг ошибки - то это обрабатывается в next
      }));
    }
  }
  showPassword(element:HTMLInputElement){
    this.showPwd=!this.showPwd;
    if (this.showPwd){
      element.type='text';
    }else{
      element.type='password';
    }
  }

  showRedBorder(isPassword:boolean=false){
    isPassword?this.passwordIncorrect=true:this.userNotFound=true;
    const f=setTimeout(()=>{
      this.passwordIncorrect=false;
      this.userNotFound=false;
      clearTimeout(f);
    },3000);

  }

  ngOnDestroy() {
    this.subscription$.unsubscribe();
  }
}
