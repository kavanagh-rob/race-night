import { Component, OnInit, Input } from '@angular/core';
import { DataService } from '../../shared/services/data.service';


@Component({
  selector: 'app-results-video',
  templateUrl: './results-video.component.html',
  styleUrls: ['./results-video.component.css']
})
export class ResultsVideoComponent implements OnInit {

  constructor(private dataService: DataService) { }
  @Input()
  eventInfo;
  finishedRaces;

  ngOnInit(): void {
    this.finishedRaces = this.eventInfo.races.filter(
      race =>  race.result);
  }

  sortFinishedRaces(prop: any) {
    const raceNumber = 'raceNumber';
    if (! this.finishedRaces){
      return;
    }
    return this.finishedRaces.sort((a, b) =>
    a[raceNumber] < b[raceNumber] ? 1 : a[raceNumber] === b[raceNumber] ? 0 : -1);
  }
}

