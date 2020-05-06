import { Component, OnInit } from '@angular/core';
import {DataService} from '../../shared/services/data.service';
import { EventInfo } from '../../models/eventInfo';
import { RaceInfo } from '../../models/raceInfo';
import { Horse } from '../../models/horse';
import {Router, ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-event-control',
  templateUrl: './event-control.component.html',
  styleUrls: ['./event-control.component.css']
})
export class EventControlComponent implements OnInit {

  constructor(private dataService: DataService,  private route: ActivatedRoute, private router: Router) {
    const resolvedEvent = 'resolvedEvent';
    this.eventInfo = this.route.snapshot.data[resolvedEvent].Item;
  }
  eventInfo;
  raceInfo = new RaceInfo();
  accordianOpened = -1 ;

  formError = false;

  ngOnInit(): void {
  }


  sortRaceList(prop: number) {
    const raceNumberProp = 'raceNumber';
    return  this.eventInfo.races.sort((a, b) =>
    a[raceNumberProp] > b[raceNumberProp] ? 1 : a[raceNumberProp] === b[raceNumberProp] ? 0 : -1);
  }

  toggleAccordian(index) {
    this.accordianOpened = this.accordianOpened === index ? -1 : index;
  }

  setRaceToEdit(raceInfo){
    this.raceInfo = raceInfo;
  }

  updateRaceEvent(){
    const eventData: any = {};
    eventData.item = this.eventInfo;
    eventData.table_name = 'RN_EVENTS';
    this.dataService.putTableInfo(eventData).then(resp => {
      document.getElementById('closeUpdateRaceFormButton').click();
      location.reload();
     });
  }

  makeCurrentRace(race){
    if (confirm('Are you sure to make current race ' + name)) {
      this.eventInfo.currentRace = race;
      this.updateRaceEvent();
    }
  }

  clearCurrentRace() {
    delete this.eventInfo.currentRace;
    this.updateRaceEvent();
  }

  addHorse() {
    this.raceInfo.horses.push(new Horse());
  }

  removeHorse(index) {
    this.raceInfo.horses.splice(index, 1);
  }

  removeRace(index){
    if (confirm('Are you sure to delete ' + name)) {
      this.eventInfo.races.splice(index, 1);
      this.updateRaceEvent();
    }
  }

  navigateToPage(route) {
    this.router.navigate(['../' + route],  {relativeTo: this.route});
  }

  refreshPage(){
    location.reload();
  }


}
