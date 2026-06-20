import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

type StatusGroup = 'subscription' | 'payment' | 'activity' | 'resident';

@Pipe({ name: 'statusTranslate', standalone: true, pure: false })
export class StatusTranslatePipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(value: string, group: StatusGroup): string {
    const key = `status.${group}.${value}`;
    const translated = this.translate.instant(key);
    return translated !== key ? translated : value;
  }
}
