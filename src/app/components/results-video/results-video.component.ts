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

  raceResults = [];

  ngOnInit(): void {
    this.getSubmittedResults();
  }

  getSubmittedResults() {
    const resultsRequestData: any = {};
    resultsRequestData.table_name = this.eventInfo.dbResultTableName;
    this.dataService.scanTableInfo(resultsRequestData).then(resultsData => {
      if (resultsData && resultsData.Items){
        this.raceResults = resultsData.Items.filter(
          result => result.eventId === this.eventInfo.eventInfoId);
      }
    });
  }

  sortResultsByRace(prop: any) {
    const raceInfo = 'raceInfo';
    const raceNumber = 'raceNumber';
    if (! this.raceResults){
      return;
    }
    return this.raceResults.sort((a, b) =>
    a[raceInfo][raceNumber] < b[raceInfo][raceNumber] ? 1 : a[raceInfo][raceNumber] === b[raceInfo][raceNumber] ? 0 : -1);
  }

}

