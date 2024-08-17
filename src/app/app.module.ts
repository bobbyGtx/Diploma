import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {LayoutComponent} from "./shared/layout/layout.component";
import {HeaderComponent} from "./shared/layout/header/header.component";
import {FooterComponent} from "./shared/layout/footer/footer.component";
import { MainComponent } from './views/main/main.component';
import {SharedModule} from "./shared/shared.module";
import {MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule} from "@angular/material/snack-bar";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {CarouselModule} from "ngx-owl-carousel-o";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {MatMenuModule} from "@angular/material/menu";
import {AuthInterceptor} from "./core/auth/auth.interceptor";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    HeaderComponent,
    FooterComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    SharedModule,
    MatSnackBarModule,
    BrowserAnimationsModule,
    HttpClientModule,
    CarouselModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    AppRoutingModule
  ],
  providers: [{provide:MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration:4500}},
    {provide:HTTP_INTERCEPTORS,useClass:AuthInterceptor,multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
