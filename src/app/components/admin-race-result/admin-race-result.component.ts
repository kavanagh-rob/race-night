import { Component, OnInit } from '@angular/core';
import {DataService} from '../../shared/services/data.service';
import { v1 as uuid } from 'uuid';
import { EventInfo } from '../../models/eventInfo';
import { ActivatedRoute, Router } from '@angular/router';
import { Route } from '@angular/compiler/src/core';
import { Result } from '../../models/result';

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
  raceResult: Result;
  raceActiveError = false;
  raceResultError = false;
  existingResultError = false;

  ngOnInit(): void {
    const eventsRequestData: any = {};
    eventsRequestData.primary_key = 'eventInfoId';
    eventsRequestData.primary_key_value = this.eventInfo.eventInfoId;
    eventsRequestData.table_name = 'RN_EVENTS';
    this.dataService.scanTableInfo(eventsRequestData).then(eventResp => {
      this.eventInfo = eventResp.Item;
      this.getLiveRaceInfo();
    });
  }

  getLiveRaceInfo(){
      this.liveRaceInfo = this.eventInfo ? this.eventInfo.currentRace : null;
      this.raceResult = this.liveRaceInfo  ? this.liveRaceInfo.result : null;
      if (this.raceResult) {
        this.existingResultError = true;
      }
      this.getBets();
  }

  navigateToPage(route) {
    this.router.navigate(['../../' + route],  {relativeTo: this.route});
  }

  navigateToLiveResultsPage(route) {
    this.router.navigate(['../' + route],  {relativeTo: this.route});
  }

  highlightRaceWinner(horseNumber){
    if (this.raceResult && this.raceResult.raceNumber === this.eventInfo.currentRace.raceNumber){
      return horseNumber === this.raceResult.winningHorse.horseNumber ? {'background-color': 'green'} : '';
    }
    return '';
  }

  getBets() {
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
        if (betData.eventId !== this.eventInfo.eventInfoId || betData.raceNumber !== this.liveRaceInfo.raceNumber) {
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
    this.raceResultError = false;
    if (this.liveRaceInfo.isActive){
      this.raceActiveError = true;
    }
    this.raceResult = new Result(horse, this.liveRaceInfo.raceNumber, this.totalBetValue,
      this.liveRaceInfo.payoutFactor, null, this.liveRaceInfo.horses );
    this.liveRaceInfo.result = this.raceResult;
  }

  submitRaceResults() {
    this.raceActiveError = false;
    this.raceResultError = false;
    if (this.liveRaceInfo.isActive){
      this.raceActiveError = true;
    } else {
      const eventsRequestData: any = {};
      const eventIdProp = 'eventInfoId';
      eventsRequestData.primary_key = eventIdProp;
      eventsRequestData.primary_key_value = this.eventInfo.eventInfoId;
      eventsRequestData.table_name = 'RN_EVENTS';
      this.dataService.scanTableInfo(eventsRequestData).then(eventResp => {
        this.eventInfo = eventResp.Item;
        if ( !this.eventInfo.currentRace || this.raceResult.raceNumber !== this.eventInfo.currentRace.raceNumber){
          this.raceResultError = true;
          return;
        }
        this.updateEventWithRaceResult();
        const eventData: any = {};
        eventData.item = this.eventInfo;
        eventData.table_name = 'RN_EVENTS';
        this.dataService.putTableInfo(eventData).then(resp => {
          document.getElementById('setResultForm').click();
          location.reload();
        });
      });

    }
  }

  updateEventWithRaceResult(){
    const currentRace = this.getCurrentRace();
    currentRace.result = this.raceResult;
    this.eventInfo.currentRace = currentRace;
  }

  getCurrentRace(){
    return this.eventInfo.races.filter(
        race => race.raceNumber === this.liveRaceInfo.raceNumber)[0];
  }
}
