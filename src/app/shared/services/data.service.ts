import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) {}

  extractData(res: any) {
    const body = res.data;
    return body || {};
  }
  handleErrorPromise(error: Response | any) {
    console.error(error.message || error);
  }

  getUserById(userId) {
    return this.http.get(`${environment.apiUrl}/users/` + userId)
      .toPromise()
      .then(this.extractData)
      .catch(this.handleErrorPromise);
  }

  getAllUsers() {
    return this.http.get(`${environment.apiUrl}/users`)
      .toPromise()
      .then(this.extractData)
      .catch(this.handleErrorPromise);
  }

  getEventInfo(eventId) {
    const eventsRequestData: any = {};
    eventsRequestData.table_name = 'RN_EVENTS';
    const eventIdProp = 'eventInfoId';
    eventsRequestData.primary_key = eventIdProp;
    eventsRequestData.primary_key_value = eventId;
    return this.http.post(`${environment.apiUrl}/tableinfo`, eventsRequestData)
      .toPromise()
      .then(this.extractData)
      .catch(this.handleErrorPromise);
  }

  putTableInfo(data: any) {
    return this.http.put(`${environment.apiUrl}/tableinfo`, data)
      .toPromise()
      .then(this.extractData)
      .catch(this.handleErrorPromise);
  }

  scanTableInfo(data: any) {
    return this.http.post(`${environment.apiUrl}/tableinfo`, data)
      .toPromise()
      .then(this.extractData)
      .catch(this.handleErrorPromise);
  }

  queryBets(data: any){
    return this.http.post(`${environment.apiUrl}/bets`, data)
    .toPromise()
    .then(this.extractData)
    .catch(this.handleErrorPromise);
  }

}
