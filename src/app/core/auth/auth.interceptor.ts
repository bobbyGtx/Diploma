import {Injectable} from "@angular/core";
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {AuthService} from "./auth.service";
import {LoaderService} from "../../shared/services/loader.service";
import {Router} from "@angular/router";
import {catchError, finalize, Observable, switchMap, throwError} from "rxjs";
import {DefaultResponseType} from "../../../types/default-response.type";
import {LoginResponseType} from "../../../types/responses/login-response.type";
import {environment} from "../../../environments/environment";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService,
              private loaderService: LoaderService,
              private router: Router) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (environment.showLoader) this.loaderService.show();
    const tokens = this.authService.getTokens();
    if (tokens && tokens.accessToken) {
      const authReq = req.clone({
        headers: req.headers.set('x-auth', tokens.accessToken),
      });

      return next.handle(authReq)
        .pipe(
          catchError(error => {
            if ((error.status === 401 || error.status === 500) && !authReq.url.includes('login') && !authReq.url.includes('refresh')) {
              return this.handle401Error(authReq, next);
            }
            return throwError(() => error);
          }),
          finalize(() => this.loaderService.hide())
        );
    }
    return next.handle(req)
      .pipe(finalize(() => this.loaderService.hide()));
  }

  handle401Error(req: HttpRequest<any>, next: HttpHandler) {
    return this.authService.refresh()
      .pipe(
        switchMap((result: DefaultResponseType | LoginResponseType) => {
          let error: string = '';
          if ((result as DefaultResponseType).error !== undefined) {
            error = (result as DefaultResponseType).message;
          }
          const refreshResult = result as LoginResponseType;
          if (!refreshResult.accessToken || !refreshResult.refreshToken || !refreshResult.userId) {
            error = 'Ошибка авторизации';
          }
          if (error) {
            return throwError(() => new Error(error));//Мы должны в observable использовать такую генерацию ошибок. Она возвращает ошибку Observable
          }
          this.authService.setTokens(refreshResult.accessToken, refreshResult.refreshToken);
          const authReq = req.clone({
            headers: req.headers.set('x-auth', refreshResult.accessToken),
          });//Клонируем запрос и помещаем туда новый токен
          return next.handle(authReq);//Возвращаем новый запрос
        }),
        catchError(error => {
          this.authService.removeTokens();
          this.router.navigate(['/']);
          return throwError(() => error);
        })
      );
  }
}
