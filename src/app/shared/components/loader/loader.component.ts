import {Component, OnDestroy, OnInit} from '@angular/core';
import {LoaderService} from "../../services/loader.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit, OnDestroy {

  private subscription$: Subscription = new Subscription();
  isShowed: boolean = false;
  constructor(private loaderService: LoaderService) { }

  ngOnInit(): void {
    this.subscription$.add(this.loaderService.isShowed$.subscribe((isShowed: boolean) => this.isShowed = isShowed));
  }
  ngOnDestroy() {
    this.subscription$.unsubscribe();
  }
}
