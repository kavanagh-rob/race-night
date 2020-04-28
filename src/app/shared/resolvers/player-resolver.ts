import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { DataService } from '../services/data.service';

@Injectable()
export class PlayerResolver implements Resolve<any> {

  constructor(private dataService: DataService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const userKey = 'userId';
    return this.dataService.getUserById(route.params[userKey]);
  }
}
