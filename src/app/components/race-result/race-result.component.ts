import { Component, OnInit } from '@angular/core';
import {DataService} from '../../shared/services/data.service';
import { v1 as uuid } from 'uuid';

@Component({
  selector: 'app-race-result',
  templateUrl: './race-result.component.html',
  styleUrls: ['./race-result.component.css']
})
export class RaceResultComponent implements OnInit {

  constructor(private dataService: DataService) { }
  raceInfo: any = [{horses: [] }];
  totalBetValue = 0;
  raceResult: any = {};
  raceActiveError = false;
  resultsForCurrentRace;
  existingResultError = false;

  ngOnInit(): void {
    this.getRaceInfo();
  }

  getRaceInfo(){
    this.dataService.getLiveRaceInfo().then(raceInfoData => {
      this.raceInfo = raceInfoData;
      this.getSubmittedResults();
      this.getCurentBetsForRace();
    });
  }

  getSubmittedResults() {
    const resultsRequestData: any = {};
    resultsRequestData.table_name = this.raceInfo.dbResultTableName;
    this.dataService.scanTableInfo(resultsRequestData).then(raceInfoData => {
      if (raceInfoData && raceInfoData.Items){
        this.resultsForCurrentRace = raceInfoData.Items.filter(
          result => result.raceInfo.raceNumber === this.raceInfo.raceNumber);
        if (this.resultsForCurrentRace.length > 0){
            this.existingResultError = true;
        }
      }
    });
  }

  getCurentBetsForRace() {
    const betsQueryData: any = {};
    betsQueryData.table_name = this.raceInfo.dbBetTableName;
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
    this.raceInfo.horses.forEach(horse => {
      let betTotalForHorse = 0;
      const betsForHorse = raceBets.filter(
        bets => bets.horseNumber === horse.number);
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
    const currentHorse = this.raceInfo.horses.forEach(
      horse => {
        horse.liveOdds = horse.totalBetsForHorse === 0 ?
        this.setTwoDecimals(this.totalBetValue) : this.setTwoDecimals(Number(this.totalBetValue) / Number(horse.totalBetsForHorse));
          });
  }

  filterBetsForRace(betList) {
    return betList.filter(
      betData => {
        if (betData.meetingId !== this.raceInfo.meetingId || betData.raceNumber !== this.raceInfo.raceNumber) {
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
    if (this.raceInfo.isActive){
      this.raceActiveError = true;
    }
    this.raceResult.resultId = uuid();
    this.raceResult.winningHorseNumber = horse.number;
    this.raceResult.winningHorseName = horse.name;
    this.raceResult.winningHorseOdds = horse.liveOdds;
    this.raceResult.raceInfo = this.raceInfo;
  }

  submitRaceResults() {
    this.raceActiveError = false;
    if (this.raceInfo.isActive){
      this.raceActiveError = true;
    }
    const resultData: any = {};
    resultData.table_name = this.raceInfo.dbResultTableName;
    resultData.item = this.raceResult;

    this.dataService.putTableInfo(resultData).then(resp => {
    });
  }




}
