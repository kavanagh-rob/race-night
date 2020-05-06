import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { DataService } from '../services/data.service';

@Injectable()
export class EventsResolver implements Resolve<any> {

  constructor(private dataService: DataService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const eventsRequestData: any = {};
    eventsRequestData.table_name = 'RN_EVENTS';
    const eventIdProp = 'eventInfoId';
    if (route.params[eventIdProp]) {
      eventsRequestData.primary_key = eventIdProp;
      eventsRequestData.primary_key_value = route.params[eventIdProp];
    }
    return this.dataService.scanTableInfo(eventsRequestData);
  }
}
