import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {ServiceListType} from "../../../../types/service-list.type";
import {ConsultService} from "../../services/consult.service";
import {OrderType} from "../../../../types/order.type";
import {OrderTypes} from "../../../../types/order-types.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {HttpErrorResponse} from "@angular/common/http";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {UserService} from "../../services/user.service";
import {AuthService} from "../../../core/auth/auth.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-consult-form',
  templateUrl: './consult-form.component.html',
  styleUrls: ['./consult-form.component.scss'],
})
export class ConsultFormComponent implements OnInit, OnDestroy {
  private subscription$: Subscription = new Subscription();
  isShowed: boolean = false;
  recall: boolean = false;//Форма обратной связи
  requestAccepted: boolean = false;//Запрос принят бэкэндом
  requestFailed: boolean = false;//Ошибка запроса
  isLoggedIn: boolean = false;
  servicesList = [
    {
      val: ServiceListType.siteCreation,
      text: 'Создание сайтов'
    },
    {
      val: ServiceListType.promotion,
      text: 'Продвижение'
    },
    {
      val: ServiceListType.pr,
      text: 'Реклама'
    },
    {
      val: ServiceListType.copywriting,
      text: 'Копирайтинг'
    },
  ];
  selectedService: ServiceListType = ServiceListType.siteCreation;
  consultForm = this.fb.group({
    serviceName: [this.selectedService],
    userName: ['', Validators.required],
    userPhone: ['', [Validators.required, Validators.pattern(/^\+\d\s\(\d{3}\)\s\d{3}\s\d{2}\s\d{2}$|^\+[0-9]{11}$/)]],
  });

  get userName() {
    return this.consultForm.get('userName');
  }

  get userPhone() {
    return this.consultForm.get('userPhone');
  }

  constructor(private fb: FormBuilder,
              private consultService: ConsultService,
              private _snackBar: MatSnackBar,
              private userService: UserService,
              private authService: AuthService,) {}

  ngOnInit(): void {
    this.subscription$.add(
      this.consultService.isModalShowed$.subscribe((isShowed: boolean|ServiceListType) => {
        if (isShowed){
          if (isShowed===true){
            this.recall=true;
          }
          if (typeof isShowed !== "boolean"){
            this.recall=false;
            this.selectedService=isShowed as ServiceListType;
            this.consultForm.patchValue({serviceName:this.selectedService});
          }
          if (this.authService.getIsLoggedIn()){
            this.isLoggedIn=true;
            this.consultForm.patchValue({userName:this.userService.userName});
          }else{
            this.isLoggedIn=false;
            this.consultForm.patchValue({userName:''});
            this.consultForm.patchValue({userPhone:''});
          }

          if (this.consultForm.invalid){
            this.consultForm.patchValue({userPhone:''});
            this.consultForm.markAsUntouched();
            this.consultForm.markAsPristine();
          }
          this.isShowed=true;

        }else{
          this.isShowed=false;
        }
      }));
  }

  createRequest() {
    if (this.consultForm.valid && this.consultForm.value.userName && this.consultForm.value.userPhone) {
      const paramsObject: OrderType = {
        name: this.consultForm.value.userName,
        phone: this.consultForm.value.userPhone,
        type: this.recall ? OrderTypes.consultation : OrderTypes.order
      }//Формируем обязательные поля

      if (paramsObject.type === OrderTypes.order) {
        const selectedService = this.servicesList.find(item => item.val === this.selectedService);
        if (selectedService) {
          paramsObject.service = selectedService.text;
        } else {
          console.error('Критическая ошибка! В списке услуг не найдено соответствий для: ' + this.selectedService, this.servicesList);
          this._snackBar.open('Ошибка! Обратитесь в поддержку.', 'Ok');
          return;
        }
      }
      this.consultService.createOrder(paramsObject).subscribe({
        next: (data: DefaultResponseType) => {
          if (data.error) {
            const error = data.message;
            throw new Error(error);
          }
          this.requestAccepted = true;
        },
        error: (errorResponse: HttpErrorResponse) => {
          if (errorResponse.error && errorResponse.error.message) {
            this._snackBar.open(errorResponse.error.message, 'Ok');
          } else {
            this._snackBar.open('Ошибка заказа!', 'Ok');
          }
        }
      });
    }
  }

  closeModal() {
    this.consultService.hide();
    this.requestAccepted=false;
    this.requestFailed=false;
  }

  flyphone(event: KeyboardEvent) {
    if (this.consultForm.value.userPhone!.length>=18) {
      if (event.key !== 'Delete' && event.key !== 'Backspace' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        event.preventDefault();
      }
    }
      if (event.key.match(/\d/) || event.key === '+') {
        let tel: string = this.consultForm.value.userPhone!;
        switch (tel.length) {
          case 0:
            if (event.key !== '+') tel = '+';
            break;
          case 2:
            tel=tel+' (';
            break;
          case 7:
            tel=tel+') ';
            break;
          case 12:
            tel=tel+' ';
            break;
          case 15:
            tel=tel+' ';
            break;
        }
        this.consultForm.patchValue({userPhone: String(tel)});
      }
  }

  ngOnDestroy() {
    this.subscription$.unsubscribe();
  }
}
