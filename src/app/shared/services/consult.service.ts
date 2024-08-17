import { Injectable } from '@angular/core';
import {Observable, Subject} from "rxjs";
import {OrderType} from "../../../types/order.type";
import {DefaultResponseType} from "../../../types/default-response.type";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {ServiceListType} from "../../../types/service-list.type";

@Injectable({
  providedIn: 'root'
})
export class ConsultService {
  isModalShowed$:Subject<boolean | ServiceListType>=new Subject<boolean | ServiceListType>;

  constructor(private http: HttpClient) { }

  show(service:ServiceListType|boolean=true){
      this.isModalShowed$.next(service);
  }

  hide(){
    this.isModalShowed$.next(false);
  }

  createOrder(params:OrderType):Observable<DefaultResponseType>{
    return this.http.post<DefaultResponseType>(environment.api+'requests',params);
  }
}
