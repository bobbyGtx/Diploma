import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import {UserSignupType} from "../../../../types/user-signup.type";
import {AuthService} from "../../../core/auth/auth.service";
import {HttpErrorResponse} from "@angular/common/http";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {LoginResponseType} from "../../../../types/responses/login-response.type";
import {Router} from "@angular/router";
import {UserService} from "../../../shared/services/user.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, OnDestroy {
  private subscription$: Subscription = new Subscription();
  userExist: boolean = false;
  showPwd: boolean = false;
  signUpForm = this.fb.group({
    userName: ['', [Validators.required, Validators.pattern(/^[А-Я][а-я]*(?:\s[А-Я][а-я]*)*$/)]],
    userEmail: ['', [Validators.required, Validators.pattern(/^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu)]],
    userPassword: ['', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z\-!$%^&*()_+|~=`{}\\[\]:\\\/;<>?,.@#]{8,}$/)]],
    userAgree: ['', Validators.required],
  });

  get userName() {
    return this.signUpForm.get('userName');
  }

  get userEmail() {
    return this.signUpForm.get('userEmail');
  }

  get userPassword() {
    return this.signUpForm.get('userPassword');
  }

  constructor(private fb: FormBuilder,
              private _snackBar: MatSnackBar,
              private authService: AuthService,
              private userService: UserService,
              private router: Router) {
  }

  ngOnInit(): void {

  }

  signUp() {
    if (this.signUpForm.valid && this.userName?.value && this.userEmail?.value && this.userPassword?.value) {
      const signupData: UserSignupType = {
        name: this.userName.value,
        email: this.userEmail.value,
        password: this.userPassword.value,
      }
      this.subscription$.add(
      this.authService.signup(signupData).subscribe({
        next: (data: DefaultResponseType | LoginResponseType) => {
          let error = null;
          if ((data as DefaultResponseType).error !== undefined) {
            error = (data as DefaultResponseType).message;
          }

          const loginResponse: LoginResponseType = data as LoginResponseType;
          if (!loginResponse.accessToken || !loginResponse.refreshToken || !loginResponse.userId) {
            error = 'Ошибка регистрации';//С сервера пришли не корректные данные
          }
          if (error) {
            this._snackBar.open(error, 'Ok');
            throw new Error(error);
          }//Если ошибка есть - выводим её и завершаем функцию
          this.userService.userName = this.userName!.value as string;
          this.userService.userEmail = this.userEmail!.value as string;
          this.authService.setTokens(loginResponse.accessToken, loginResponse.refreshToken, false);
          this.authService.userId = loginResponse.userId; //Если сюда присвоим null - то из localstorage userId удалится
          this._snackBar.open('Вы успешно зарегистрировались', 'Ok');
          this.router.navigate(['/']).then();
        },
        error: (errorResponse: HttpErrorResponse) => {

          if (errorResponse.error && errorResponse.error.message) {
            if (errorResponse.error.message === 'Пользователь с таким E-mail уже существует') {
              this.showRedBorder();
              this._snackBar.open(errorResponse.error.message, 'Ok');
            } else {
              //Если есть ошибка - выводим это пользователю
              this._snackBar.open(errorResponse.error.message, 'Ok');
            }
          } else {
            this._snackBar.open('Ошибка регистрации', 'Ok');
          }//Если сообщения нет - выводим это
        }
      }));
    }
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  showPassword(element: HTMLInputElement) {
    this.showPwd = !this.showPwd;
    if (this.showPwd) {
      element.type = 'text';
    } else {
      element.type = 'password';
    }
  }

  showRedBorder() {
    this.userExist = true;
    const f = setTimeout(() => {
      this.userExist = false;
      clearTimeout(f);
    }, 3000);
  }

  ngOnDestroy() {
    this.subscription$.unsubscribe();
  }
}

