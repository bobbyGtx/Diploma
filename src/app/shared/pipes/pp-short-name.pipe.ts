import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ppShortName'
})
export class PpShortNamePipe implements PipeTransform {
  private maxLength: number=12;
  private showName: boolean = true;

  transform(value: string): string {
    const startValue=value;
    if (this.showName){
      value=value.split(' ')[0];
    }
    if (value){
      if (value.length > this.maxLength){
        value=value.slice(0, this.maxLength);
      }
      return value;
    }else{
      return startValue;
    }
  }

}
