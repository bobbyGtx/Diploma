import { Injectable } from '@angular/core';
import {UserSignupType} from "../../../types/user-signup.type";
import {Observable, Subject, throwError} from "rxjs";
import {DefaultResponseType} from "../../../types/default-response.type";
import {HttpClient} from "@angular/common/http";
import {LoginResponseType} from "../../../types/responses/login-response.type";
import {environment} from "../../../environments/environment";
import {UserLoginType} from "../../../types/user-login.type";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public isLogged$: Subject<boolean> = new Subject<boolean>();
  private isLogged: boolean = false;//Переменная для хранения статуса логина

  private rememberMe: boolean = false;
  public accessTokenKey: string = 'accToken';
  public refreshTokenKey: string = 'refrToken';
  public userIdKey: string = 'usrId';

  constructor(private http: HttpClient) {
    if (localStorage.getItem(this.accessTokenKey)){
      if (localStorage.getItem(this.refreshTokenKey)&&localStorage.getItem(this.userIdKey)){
        this.isLogged=true;
        this.rememberMe=true;
      }else{
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.userIdKey);
      }
    }else if(sessionStorage.getItem(this.accessTokenKey)){
      if (sessionStorage.getItem(this.refreshTokenKey)&&sessionStorage.getItem(this.userIdKey)){
        this.isLogged=true;
        this.rememberMe=false;
      }else{
        sessionStorage.removeItem(this.accessTokenKey);
        sessionStorage.removeItem(this.refreshTokenKey);
        sessionStorage.removeItem(this.userIdKey);
      }
    }
  }

  public getIsLoggedIn():boolean{
    return this.isLogged;
  }

  signup(params:UserSignupType):Observable<DefaultResponseType | LoginResponseType>{
    return this.http.post<DefaultResponseType | LoginResponseType>(environment.api+'signup',params)
  }
  login(params:UserLoginType):Observable<DefaultResponseType | LoginResponseType>{
    return this.http.post<DefaultResponseType | LoginResponseType>(environment.api+'login',params)
  }
  logout(): Observable<DefaultResponseType> {
    const tokens=this.getTokens();
    if (tokens && tokens.refreshToken){
      return this.http.post<DefaultResponseType>(environment.api + 'logout', {
        refreshToken:tokens.refreshToken
      });
    }
    throw throwError(()=>'Не получается найти токен');
  }
  public setTokens(accessToken: string, refreshToken: string, rememberMe?:boolean):void{
    let remember:boolean=false;
    if (rememberMe===undefined){
      remember=this.rememberMe;
    }else if(rememberMe){
      remember=true;
      this.rememberMe=true;
    }
    else {
      remember=false;
      this.rememberMe=false
    }
    if (remember){
      localStorage.setItem(this.accessTokenKey, accessToken);
      localStorage.setItem(this.refreshTokenKey, refreshToken);
      this.rememberMe=true;
    }else{
      sessionStorage.setItem(this.accessTokenKey, accessToken);
      sessionStorage.setItem(this.refreshTokenKey, refreshToken);
      this.rememberMe=false;
    }
    this.isLogged = true;
    this.isLogged$.next(true);
  }

  public getTokens(): { accessToken: string | null, refreshToken: string | null } {
    if (this.rememberMe){
      return {
        accessToken: localStorage.getItem(this.accessTokenKey),
        refreshToken: localStorage.getItem(this.refreshTokenKey)
      }
    }else{
      return {
        accessToken: sessionStorage.getItem(this.accessTokenKey),
        refreshToken: sessionStorage.getItem(this.refreshTokenKey)
      }
    }

  }

  public refresh():Observable<DefaultResponseType|LoginResponseType> {
    const tokens=this.getTokens();
    if (tokens && tokens.refreshToken){
      return this.http.post<DefaultResponseType|LoginResponseType>(environment.api + 'refresh', {
        refreshToken:tokens.refreshToken
      });
    }
    throw throwError(()=>'Can not usr token');
  }

  public removeTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    sessionStorage.removeItem(this.accessTokenKey);
    sessionStorage.removeItem(this.refreshTokenKey);
    this.isLogged = false;
    this.isLogged$.next(false);//Инфо о пользователе чистится через хедер компонент
  }

  set userId(id: string | null) {
    if (id) {
      this.rememberMe?localStorage.setItem(this.userIdKey, id):sessionStorage.setItem(this.userIdKey, id);
    } else {
      this.rememberMe?localStorage.removeItem(this.userIdKey):sessionStorage.removeItem(this.userIdKey);
    }
  }

  public setLogoffState():void{
    this.isLogged = false;
    this.isLogged$.next(false);
  }
}
