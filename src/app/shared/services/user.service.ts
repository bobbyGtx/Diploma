import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {DefaultResponseType} from "../../../types/default-response.type";
import {UserInfoType} from "../../../types/user-info.type";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public userName:string='';
  public userEmail:string='';

  constructor(private http:HttpClient) { }

  getUserInfo():Observable<UserInfoType | DefaultResponseType> {
   return this.http.get<UserInfoType|DefaultResponseType>(environment.api+'users');
  }
  clearUserInfo(){
    this.userName='';
    this.userEmail='';
  }
  setUserInfo(userInfo:UserInfoType):boolean {
    let isError:boolean=false;
    if (userInfo.name && userInfo.email && userInfo.id){
      this.userName=userInfo.name;
      this.userEmail=userInfo.email;
    }else{
      isError=true;
    }
    return !isError;
  }
}
