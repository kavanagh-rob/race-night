import { Component, OnInit } from '@angular/core';
import {DataService} from '../../shared/services/data.service';
import { v1 as uuid } from 'uuid';
import { EventInfo } from '../../models/eventInfo';
import { ActivatedRoute, Router } from '@angular/router';
import { Route } from '@angular/compiler/src/core';

@Component({
  selector: 'app-race-result',
  templateUrl: './admin-race-result.component.html',
  styleUrls: ['./admin-race-result.component.css']
})
export class AdminRaceResultComponent implements OnInit {

  constructor(private dataService: DataService,  private route: ActivatedRoute, private router: Router) {
    const resolvedEvent = 'resolvedEvent';
    this.eventInfo = this.route.snapshot.data[resolvedEvent].Item;
  }
  eventInfo;

  liveRaceInfo: any = [{horses: [] }];
  totalBetValue = 0;
  raceResult: any = {};
  raceActiveError = false;
  resultsForCurrentRace;
  existingResultError = false;

  ngOnInit(): void {
    this.getLiveRaceInfo();
  }

  getLiveRaceInfo(){
      this.liveRaceInfo = this.eventInfo ? this.eventInfo.currentRace : null;
      this.getSubmittedResults();
      this.getCurentBetsForRace();
  }

  navigateToPage(route) {
    this.router.navigate(['../../' + route],  {relativeTo: this.route});
  }

  navigateToLiveResultsPage(route) {
    this.router.navigate(['../' + route],  {relativeTo: this.route});
  }

  getSubmittedResults() {
    const resultsRequestData: any = {};
    resultsRequestData.table_name = this.eventInfo.dbResultTableName;
    this.dataService.scanTableInfo(resultsRequestData).then(raceInfoData => {
      if (raceInfoData && raceInfoData.Items){
        this.resultsForCurrentRace = raceInfoData.Items.filter(
          result => result.raceInfo.raceNumber === this.liveRaceInfo.raceNumber);
        if (this.resultsForCurrentRace.length > 0){
            this.existingResultError = true;
        }
      }
    });
  }

  highlightRaceWinner(horseNumber){
    if (this.resultsForCurrentRace && this.resultsForCurrentRace[0]){
      return horseNumber === this.resultsForCurrentRace[0].winningHorseNumber ? {'background-color': 'green'} : '';
    }
    return '';
  }

  getCurentBetsForRace() {
    const betsQueryData: any = {};
    betsQueryData.table_name = this.eventInfo.dbBetTableName;
    this.dataService.queryBets(betsQueryData).then(res => {
      this.calculateCurrentOdds(res.Items);
    });
  }

  calculateCurrentOdds(betList){
    this.totalBetValue = 0;
    const raceBets = this.filterBetsForRace(betList);
    this.calculateBetTotals(raceBets);
  }

  calculateBetTotals(raceBets) {
    this.liveRaceInfo.horses.forEach(horse => {
      let betTotalForHorse = 0;
      const betsForHorse = raceBets.filter(
        bets => bets.horseNumber === horse.horseNumber);
      betsForHorse.forEach(betForHorse => {
          betTotalForHorse = betTotalForHorse + Number(betForHorse.stake);
        });
      horse.totalBetsForHorse = betTotalForHorse;
      this.totalBetValue = Number(this.totalBetValue) + Number(betTotalForHorse);
    });
    this.totalBetValue = this.setTwoDecimals(this.totalBetValue);
    this.getLiveToteOdds();
  }

  getLiveToteOdds() {
    const currentHorse = this.liveRaceInfo.horses.forEach(
      horse => {
        let factoredHorseOdds = horse.totalBetsForHorse === 0 ?
        this.setTwoDecimals(this.totalBetValue) : this.setTwoDecimals(Number(this.totalBetValue) / Number(horse.totalBetsForHorse));
        if (this.liveRaceInfo.payoutFactor  && this.liveRaceInfo.payoutFactor > 0 && this.liveRaceInfo.payoutFactor < 1){
          factoredHorseOdds =  this.setTwoDecimals(factoredHorseOdds * Number(this.liveRaceInfo.payoutFactor));
        }
        horse.liveOdds = factoredHorseOdds;
      });
  }

  filterBetsForRace(betList) {
    return betList.filter(
      betData => {
        if (betData.meetingId !== this.liveRaceInfo.meetingId || betData.raceNumber !== this.liveRaceInfo.raceNumber) {
          return false;
        }
        return true;
    });
  }

  setTwoDecimals(input){
    return Number((Math.round(Number(input) * 100) / 100).toFixed(2));
  }

  setRaceWinner(horse) {
    this.raceActiveError = false;
    if (this.liveRaceInfo.isActive){
      this.raceActiveError = true;
    }
    this.raceResult.resultId = uuid();
    this.raceResult.eventId = this.eventInfo.eventInfoId;
    this.raceResult.winningHorseNumber = horse.horseNumber;
    this.raceResult.winningHorseName = horse.name;
    this.raceResult.winningHorseOdds = horse.liveOdds;
    this.raceResult.raceInfo = this.liveRaceInfo;
  }

  submitRaceResults() {
    this.raceActiveError = false;
    if (this.liveRaceInfo.isActive){
      this.raceActiveError = true;
    } else{
      const resultData: any = {};
      resultData.table_name = this.eventInfo.dbResultTableName;
      resultData.item = this.raceResult;

      this.dataService.putTableInfo(resultData).then(resp => {
        document.getElementById('setResultForm').click();
        location.reload();
      });
    }
  }

}
