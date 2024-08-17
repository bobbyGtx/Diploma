import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ArticleInfoType} from "../../../types/article-info.type";
import {environment} from "../../../environments/environment";
import {ArticleType} from "../../../types/article.type";
import {ArticlesResponseType} from "../../../types/responses/articles-response.type";
import {RequestActiveParamsType} from "../../../types/request-active-params.type";

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  constructor(private http: HttpClient) { }

  getPopularArticles():Observable<ArticleInfoType[]>{
    return this.http.get<ArticleInfoType[]>(environment.api+'articles/top');
  }
  getRelatedArticles(baseArticleUrl:string):Observable<ArticleInfoType[]>{
    return this.http.get<ArticleInfoType[]>(environment.api+'articles/related/'+baseArticleUrl);
  }
  getArticle(url:string):Observable<ArticleType>{
    return this.http.get<ArticleType>(environment.api+'articles/'+url);
  }

  getArticles(params:RequestActiveParamsType):Observable<ArticlesResponseType>{
    return this.http.get<ArticlesResponseType>(environment.api+'articles',{params});
  }

}
