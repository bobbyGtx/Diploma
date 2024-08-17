import { Component, OnInit } from '@angular/core';
import {ConsultService} from "../../services/consult.service";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  constructor(private consultService: ConsultService) { }

  ngOnInit(): void {
  }
  showRecall(){
    this.consultService.show();
  }
}
