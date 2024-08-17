import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {ArticleService} from "../../../shared/services/article.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {ArticlesResponseType} from "../../../../types/responses/articles-response.type";
import {CategoryService} from "../../../shared/services/category.service";
import {CategoryType} from "../../../../types/category.type";
import {ActiveParamsType} from "../../../../types/active-params.type";
import {debounceTime, Subscription} from "rxjs";
import {AppliedFilter} from "../../../../types/aplied-filter.type";
import {RequestActiveParamsType} from "../../../../types/request-active-params.type";

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit, OnDestroy {
  private subscription$: Subscription = new Subscription();
  articles: ArticlesResponseType | null = null;
  pages: Array<number> = [];
  categories: Array<CategoryType> = [];
  openFilter: boolean = false;
  activeParams: ActiveParamsType = {
    categories: [],
    page: 1,
  };
  //appliedFilters: AppliedFilter[] = [];
  constructor(private articleService: ArticleService,
              private categoryService: CategoryService,
              private activatedRoute: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit(): void {
    this.subscription$.add(this.categoryService.getCategories()
      .subscribe((categoriesResponse: CategoryType[]) => {
        if (categoriesResponse && Array.isArray(categoriesResponse)) {
          this.categories = categoriesResponse;
        }
        this.subscription$.add(this.activatedRoute.queryParams
          .pipe(debounceTime(500))
          .subscribe((params: Params) => {
            const activeParams: ActiveParamsType = {categories: [],page:1};
            if (params.hasOwnProperty('categories')) {
              if(Array.isArray(params['categories'])){
                params['categories'].forEach(paramItem => {
                  const searchedCategory: CategoryType|undefined = this.categories.find((categoryItem:CategoryType)=>categoryItem.url===paramItem);
                  if (searchedCategory){
                    searchedCategory.selected=true;
                    activeParams.categories.push({url:searchedCategory.url,name:searchedCategory.name});
                  }
                });
              }else{
                const searchedCategory: CategoryType|undefined = this.categories.find((categoryItem:CategoryType)=>categoryItem.url===params['categories']);
                if (searchedCategory){
                  searchedCategory.selected=true;
                  activeParams.categories=[{url:searchedCategory.url,name:searchedCategory.name}];
                }
              }
            }

            params.hasOwnProperty('page') ? activeParams.page = Number(params['page']) : activeParams.page=1;
            this.activeParams = activeParams;
            this.subscription$.add(this.articleService.getArticles(this.prepareParams())
              .subscribe((articlesResponse: ArticlesResponseType) => {
                this.articles = articlesResponse;
                this.pages = [];
                if (this.articles.pages > 1) {
                  for (let i = 1; i <= this.articles.pages; i++) {
                    this.pages.push(i);
                  }
                  if (this.activeParams.page && this.activeParams.page>this.articles.pages){
                    this.openPage(this.articles.pages);
                  }
                } else {
                  this.router.navigate(['/blog'], {
                    queryParams: this.prepareParams()
                  });
                }

              }));
          }));
      }));
  }

  @HostListener('document:click', ['$event'])
  click(event: Event) {
    if (this.openFilter && (event.target as HTMLElement).className.indexOf('filter-selector-') === -1) {
      this.openFilter = false;
    }
  }

  toggle() {
    this.openFilter = !this.openFilter;
  }

  openPrevPage() {
    if (this.activeParams.page && this.activeParams.page > 1 ) {
      this.openPage(--this.activeParams.page);
    }
  }

  openNextPage() {
    if (this.activeParams.page && this.activeParams.page < this.pages.length ) {
      this.openPage(++this.activeParams.page);
    }
  }

  openPage(page:number){
    if( page >=1 && page <= this.pages.length) {
      this.activeParams.page=page;

      this.router.navigate(['/blog'], {
        queryParams: this.prepareParams()
      });
    }
  }

  updateFilterParams(category: CategoryType) {
    category.selected = !category.selected;
    if (this.activeParams.categories && this.activeParams.categories.length > 0) {
      const existingTypeInParams: AppliedFilter | undefined = this.activeParams.categories.find((item:AppliedFilter) => item.url === category.url);
      if (existingTypeInParams && !category.selected) {
        this.activeParams.categories = this.activeParams.categories.filter((item:AppliedFilter) => item.url !== category.url)
      } else if (!existingTypeInParams && category.selected) {
        this.activeParams.categories = [...this.activeParams.categories, {url:category.url,name:category.name}];// тут глючит пуш this.activeParams.categories.push(category.url);
      }
    } else if (category.selected) {
      this.activeParams.categories = [...this.activeParams.categories, {url:category.url,name:category.name}];
    }
    if (this.activeParams.page)this.activeParams.page=1;
    this.router.navigate(['/blog'], {
      queryParams: this.prepareParams()
    });
  }

  deleteFilterParam(url: string): void {
    if (this.activeParams.categories && this.activeParams.categories.length > 0) {
      const existingTypeInParams: AppliedFilter | undefined = this.activeParams.categories.find((item:AppliedFilter) => item.url === url);
      if (existingTypeInParams) {
        this.activeParams.categories = this.activeParams.categories.filter(item => item.url !== url)
      }

      const searchedCategory: CategoryType | undefined = this.categories.find((categoryItem: CategoryType) => categoryItem.url === url);
      if (searchedCategory) {
        searchedCategory.selected = false;
      }

      if (this.activeParams.page) this.activeParams.page=1;
      this.router.navigate(['/blog'], {
        queryParams: this.prepareParams()
      }).then();
    }
  }

  prepareParams():RequestActiveParamsType{
    let reqParams:RequestActiveParamsType={categories:[]};
    if (this.activeParams.categories.length>0) {
      this.activeParams.categories.forEach((categoryItem:AppliedFilter) => {reqParams.categories.push(categoryItem.url)});
    }
    if (this.activeParams.page){
      reqParams.page = this.activeParams.page;
    }
    return reqParams
  }

  ngOnDestroy() {
    this.subscription$.unsubscribe();
  }
}
