import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router) {
    const resolvedEvents = 'resolvedEvents';
    this.eventInfoList = this.route.snapshot.data[resolvedEvents].Items;
   }
   eventInfoList;

  ngOnInit(): void {

  }

  sortEvents(prop: string) {
    const dateProp = 'date';
    return this.eventInfoList.sort((a, b) => {
      return this.getTime(a[dateProp]) - this.getTime(b[dateProp]);
    });
  }

  private getTime(date?: Date) {
    return date != null ? date.getTime() : 0;
  }

  navigateToEvent(eventId) {
    this.router.navigateByUrl('/event-home/' + eventId);
  }

}
