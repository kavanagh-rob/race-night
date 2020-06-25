import { Component, OnInit, Input } from '@angular/core';
import { DataService } from '../../shared/services/data.service';

@Component({
  selector: 'app-live-race-card',
  templateUrl: './live-race-card.component.html',
  styleUrls: ['./live-race-card.component.css']
})
export class LiveRaceCardComponent implements OnInit {

  constructor(private dataService: DataService) { }

  @Input()
  eventInfo;

  ngOnInit(): void {
  }

  activateCurrentRace(){
    this.eventInfo.currentRace.isActive = true;
    this.updateRaceEvent();
  }
  suspendCurrentRace(){
    this.eventInfo.currentRace.isActive = false;
    this.updateRaceEvent();
  }


  updateRaceEvent(){
    const eventData: any = {};
    eventData.item = this.eventInfo;
    eventData.table_name = 'RN_EVENTS';
    this.dataService.putTableInfo(eventData).then(resp => {
      document.getElementById('closeSetCurrentRaceCardFormButton').click();
      location.reload();
     });
  }

}
