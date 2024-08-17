import {Component, Input, OnInit} from '@angular/core';
import {ArticleInfoType} from "../../../../types/article-info.type";
import {Router} from "@angular/router";

@Component({
  selector: 'article-card',
  templateUrl: './article-card.component.html',
  styleUrls: ['./article-card.component.scss']
})
export class ArticleCardComponent implements OnInit {

  @Input() article!: ArticleInfoType;
  constructor(private router: Router) { }

  ngOnInit(): void {
  }

}
