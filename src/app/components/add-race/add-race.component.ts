import { Component, OnInit, Input  } from '@angular/core';
import { EventInfo } from '../../models/eventInfo';
import { RaceInfo } from '../../models/raceInfo';
import { Horse } from '../../models/horse';
import {DataService} from '../../shared/services/data.service';

@Component({
  selector: 'app-add-race',
  templateUrl: './add-race.component.html',
  styleUrls: ['./add-race.component.css']
})
export class AddRaceComponent implements OnInit {

  constructor(private dataService: DataService) { }
  @Input()
  eventInfo: EventInfo;

  raceInfo;

  formError = false;

  ngOnInit(): void {
    this.raceInfo = new RaceInfo();
  }

  addRaceToEvent() {
    this.eventInfo.races.push(this.raceInfo);
    const eventData: any = {};
    eventData.item = this.eventInfo;
    eventData.table_name = 'RN_EVENTS';
    this.dataService.putTableInfo(eventData).then(resp => {
      document.getElementById('closeAddRaceFormButton').click();
      location.reload();
     });
  }

  addHorse() {
    this.raceInfo.horses.push(new Horse());
  }

  removeHorse(index) {
    this.raceInfo.horses.splice(index, 1);
  }

}
