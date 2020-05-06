import { Component, OnInit } from '@angular/core';
import { DataService } from '../../shared/services/data.service';
import { ActivatedRoute,  Router } from '@angular/router';

@Component({
  selector: 'app-admin-race-control',
  templateUrl: './admin-race-control.component.html',
  styleUrls: ['./admin-race-control.component.css']
})
export class AdminRaceControlComponent implements OnInit {

  constructor(private dataService: DataService,  private route: ActivatedRoute,  private router: Router) {
    const resolvedEvent = 'resolvedEvent';
    this.eventInfo = this.route.snapshot.data[resolvedEvent].Item;
  }
  eventInfo;

  ngOnInit(): void {

  }

  navigateToPage(route) {
    this.router.navigate(['../../' + route],  {relativeTo: this.route});
  }

  navigateToLiveResultsPage(route) {
    this.router.navigate(['../' + route],  {relativeTo: this.route});
  }

}
