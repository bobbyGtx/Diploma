import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './components/loader/loader.component';
import { ConsultFormComponent } from './components/consult-form/consult-form.component';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {ReactiveFormsModule} from "@angular/forms";
import { ConditionsComponent } from './components/conditions/conditions.component';
import { ArticleCardComponent } from './components/article-card/article-card.component';
import {RouterModule} from "@angular/router";
import { CommentCardComponent } from './components/comment-card/comment-card.component';
import { PpShortNamePipe } from './pipes/pp-short-name.pipe';


@NgModule({
  declarations: [LoaderComponent, ConsultFormComponent, ConditionsComponent, ArticleCardComponent, CommentCardComponent, PpShortNamePipe],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    RouterModule
  ],
    exports: [LoaderComponent, ConsultFormComponent, ConditionsComponent, ArticleCardComponent, CommentCardComponent, PpShortNamePipe]
})
export class SharedModule { }
