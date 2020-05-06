import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { DataService } from '../services/data.service';
import { from } from 'rxjs';

@Injectable()
export class UserEventResolver implements Resolve<any> {

  constructor(private dataService: DataService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const userKey = 'userId';

    return this.dataService.getUserById(route.params[userKey]).then(userRes =>
      this.dataService.getEventInfo(userRes.Item.eventId));
    }
  }
