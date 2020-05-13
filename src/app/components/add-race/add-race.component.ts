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

  duplicateRaceError = false;
  duplicateHorseError = false;

  ngOnInit(): void {
    this.raceInfo = new RaceInfo();
  }

  addRaceToEvent() {
    this.duplicateRaceError = false;
    this.duplicateHorseError = false;
    const eventsRequestData: any = {};
    eventsRequestData.primary_key = 'eventInfoId';
    eventsRequestData.primary_key_value = this.eventInfo.eventInfoId;
    eventsRequestData.table_name = 'RN_EVENTS';
    this.dataService.scanTableInfo(eventsRequestData).then(eventResp => {
      this.eventInfo = eventResp.Item;
      if (!this.eventInfo || this.hasDuplicateRace()) {
        this.duplicateRaceError = true;
        return;
      }
      if ( this.hasDuplicateHorses()) {
        this.duplicateRaceError = true;
        return;
      }
      this.eventInfo.races.push(this.raceInfo);
      const eventData: any = {};
      eventData.item = this.eventInfo;
      eventData.table_name = 'RN_EVENTS';
      this.dataService.putTableInfo(eventData).then(resp => {
        document.getElementById('closeAddRaceFormButton').click();
        location.reload();
       });
    });
  }

  hasDuplicateRace() {
    return this.eventInfo.races.filter(race => race.raceNumber === this.raceInfo.raceNumber).length > 0;
  }
  hasDuplicateHorses(){
    const horseList = new Set();
    const hasDuplicates = this.raceInfo.horses.some(horse =>
      horseList.size === horseList.add(horse.horseNumber).size);
    return hasDuplicates;
  }

  addHorse() {
    this.raceInfo.horses.push(new Horse());
  }

  removeHorse(index) {
    this.raceInfo.horses.splice(index, 1);
  }

}
