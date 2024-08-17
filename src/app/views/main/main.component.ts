import {Component, OnDestroy, OnInit} from '@angular/core';
import {ServiceListType} from "../../../types/service-list.type";
import {ConsultService} from "../../shared/services/consult.service";
import {OwlOptions} from "ngx-owl-carousel-o";
import {ArticleInfoType} from "../../../types/article-info.type";
import {ArticleService} from "../../shared/services/article.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit,OnDestroy {
  private subscription$: Subscription = new Subscription();
  customOptionsBanner: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    margin:24,
    dots: true,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      }
    },
    nav: false
  };
  customOptionsFeedback: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    margin:24,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1,
        dots: true
      },
      800: {
        items: 2
      },
      1240: {
        items: 3
      },
    },
    nav: false
  };
  feedbackItems:{
    name:string,
    image:string,
    message:string,
  }[]=[{
    name:'Станислав',
    image:'avatar1.png',
    message:'Спасибо огромное АйтиШторму за прекрасный блог с полезными статьями! Именно они и побудили меня углубиться в тему SMM и начать свою карьеру.'
  },
    {
      name:'Алёна',
      image:'avatar2.png',
      message:'Обратилась в АйтиШторм за помощью копирайтера. Ни разу ещё не пожалела! Ребята действительно вкладывают душу в то, что делают, и каждый текст, который я получаю, с нетерпением хочется выложить в сеть.'
    },
    {
      name:'Мария',
      image:'avatar3.png',
      message:'Команда АйтиШторма за такой короткий промежуток времени сделала невозможное: от простой фирмы по услуге продвижения выросла в мощный блог о важности личного бренда. Класс!'
    },
  ];//Переменная для фидбэка
  advantagesItems:{
    number:string,
    boldText:string,
    text:string,
  }[]=[
    {
    number:'1',
      boldText:'Мастерски вовлекаем аудиториюв процесс.',
      text:'Мы увеличиваем процент вовлечённости за короткий промежуток времени.'
  },
    {
      number:'2',
      boldText:'Разрабатываем бомбическую визуальную концепцию.',
      text:'Наши специалисты знают как создать уникальный образ вашего проекта.'
    },
    {
      number:'3',
      boldText:'Создаём мощные воронки с помощью текстов.',
      text:'Наши копирайтеры создают не только вкусные текста, но и классные воронки.'
    },
    {
      number:'4',
      boldText:'Помогаем продавать больше.',
      text:'Мы не только помогаем разработать стратегию по продажам, но также корректируем её под нужды заказчика.'
    },
  ];//Наши преимущества
  popularArticles:Array<ArticleInfoType>=[];

  constructor(private consultService: ConsultService,private articleService: ArticleService,  private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.subscription$.add(
    this.articleService.getPopularArticles()
      .subscribe((articles:ArticleInfoType[]) =>{
        if(articles && Array.isArray(articles) && articles.length>0){
          this.popularArticles = articles
        }else{
          this._snackBar.open('Проблемы с запросами на сервер. Могут наблюдаться сбои в сервисах!','Ok');
          this.popularArticles=[
            {
              id:'668d9c742714db5d95f9d69b',
              title:'6 сайтов для повышения  продуктивности',
              description:'Хотите проводить время в сети с пользой? Наша подборка из шести полезных, но малоизвестных сайтов увеличит вашу продуктивность, поможет успевать больше в течение дня и всегда быть на шаг впереди!',
              image:'image1.jpg',
              date:'2024-07-09T20:24:20.468Z',
              category:'Фриланс',
              url:'6_saitov_dlya_povisheniya__produktivnosti',
            },
            {
              id:'668d9c742714db5d95f9d69c',
              title:'Как произвести впечатление на нового клиента?',
              description:'Поиск новых клиентов — это сложная задача не только для новичков, но и для опытных специалистов. Мы расскажем, как справиться с волнением, завоевать доверие клиента и произвести на него потрясающее первое впечатление.',
              image:'image2.jpg',
              date:'2024-07-09T20:24:20.468Z',
              category:'Таргет',
              url:'kak_proizvesti_vpechatlenie_na_novogo_klienta',
            },
            {
              id:'668d9c742714db5d95f9d69d',
              title:'Как бороться с конкуренцией на фрилансе?',
              description:'Конкуренция — это часть нашей жизни. Мы боремся за место работы, за победу на конкурсе и даже за возможность купить последний круассан в любимом кафе. Фриланс не исключение.',
              image:'image3.jpg',
              date:'2024-07-09T20:24:20.468Z',
              category:'Фриланс',
              url:'kak_borotsya_s_konkurentsiei_na_frilanse',
            },
            {
              id:'668d9c742714db5d95f9d69e',
              title:'SMM-специалисты: кто они?',
              description:'Профессия SММ-менеджера набирает все большую популярность. В эпоху интернета уже не только новости – приобретение товаров и услуг уходит в онлайн, а просмотр любимых сайтов становится ежедневной рутиной.',
              image:'image4.jpg',
              date:'2024-07-09T20:24:20.468Z',
              category:'SMM',
              url:'smmspetsialisti_kto_oni',
            },
          ];
        }
      }));
  }
  serviceSelectShow(serviceType:ServiceListType): void {
    this.consultService.show(serviceType);
  }

  ngOnDestroy() {
    this.subscription$.unsubscribe();
  }
  protected readonly ServiceListType = ServiceListType;
}
