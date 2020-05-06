import { Component, OnInit } from '@angular/core';
import {DataService} from '../../shared/services/data.service';
import { EventInfo } from '../../models/eventInfo';
import { RaceInfo } from '../../models/raceInfo';
import { Horse } from '../../models/horse';
import {Router, ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css']
})
export class CreateEventComponent implements OnInit {

  constructor(private dataService: DataService, private router: Router) { }
  eventInfo: EventInfo;
  stakeError = false;

  ngOnInit(): void {
    this.eventInfo = new EventInfo();
  }

  submitEvent(){
    const eventData: any = {};
    eventData.item = this.eventInfo;
    eventData.table_name = 'RN_EVENTS';
    this.dataService.putTableInfo(eventData).then(resp => {
      document.getElementById('closeCreateEventFormButton').click();
      location.reload();
     });

  }



}
