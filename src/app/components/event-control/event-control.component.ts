import { Component, OnInit } from '@angular/core';
import {DataService} from '../../shared/services/data.service';
import { EventInfo } from '../../models/eventInfo';
import { Horse } from '../../models/horse';
import { v1 as uuid } from 'uuid';

@Component({
  selector: 'app-event-control',
  templateUrl: './event-control.component.html',
  styleUrls: ['./event-control.component.css']
})
export class EventControlComponent implements OnInit {

  constructor(private dataService: DataService) { }
  meeting: EventInfo[];
  eventInfo: EventInfo = new EventInfo();
  formError = false;
  numberOfHorses: number;

  ngOnInit(): void {
  }

  addEventToMeeting() {
    this.eventInfo.eventNumber = this.meeting.length;
    this.meeting.push(this.eventInfo);
  }

  submitEvent(){
    // document.getElementById('closeCreateEventFormButton').click();
  }

  addHorse() {
    this.eventInfo.horses.push(new Horse());
  }

  removeHorse() {
    this.eventInfo.horses.splice(-1, 1);
  }

  newEventForm() {
    // this.eventInfo = new EventInfo();
  }

  cloneEventForm() {
    this.eventInfo = JSON.parse(JSON.stringify(this.eventInfo.eventId));
    this.eventInfo.eventId = uuid();
  }

}
