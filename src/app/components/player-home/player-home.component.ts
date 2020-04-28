import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DataService} from '../../shared/services/data.service';
import {Router} from '@angular/router';
import { v1 as uuid } from 'uuid';

@Component({
  selector: 'app-player-home',
  templateUrl: './player-home.component.html',
  styleUrls: ['./player-home.component.css']
})
export class PlayerHomeComponent implements OnInit {

  constructor(private route: ActivatedRoute, private dataService: DataService, private router: Router) {
    const resloveLiveRace = 'resloveLiveRace';
    const resolvedUserKey = 'resolvedPlayer';
    this.user = this.route.snapshot.data[resolvedUserKey].Item;
    this.raceInfo = this.route.snapshot.data[resloveLiveRace];
  }
  user;
  raceInfo;
  userBetsList;
  betslip: any = {};
  balanceError = false;
  stakeError = false;
  raceExpiredError = false;
  totalBetValue = 0;

  requestBet() {
    this.balanceError = false;
    this.stakeError = false;
    this.raceExpiredError = false;
    this.betslip.meetingId = this.raceInfo.meetingId;
    this.betslip.raceNumber = this.raceInfo.raceNumber;
    this.betslip.userId = this.user.userId;
    this.betslip.userName = this.user.name;
    this.betslip.userBalance = this.user.balance;

    if (this.betslip.stake < 1) {
      this.stakeError = true;
      return;
    }

    this.dataService.getUserById(this.user.userId).then(res => {
      this.user = res.Item;
      if ( this.user.balance < this.betslip.stake ) {
        this.balanceError = true;
        return;
      }
      this.dataService.getLiveRaceInfo().then(raceInfoData => {
        if (raceInfoData.isActive){
          this.placeBet();
        }else{
          this.raceExpiredError = true;
        }
      });
    });
  }

  getCurentBetsForRace() {
    const betsQueryData: any = {};
    betsQueryData.table_name = this.raceInfo.dbBetTableName;
    this.dataService.queryBets(betsQueryData).then(res => {
      this.calculateCurrentOdds(res.Items);
      this.getUserBets(res.Items);
    });
  }

  getUserBets(betList){
    this.userBetsList = betList.filter(
      bets => bets.userId === this.user.userId);
  }
  calculateCurrentOdds(betList){
    this.totalBetValue = 0;
    const raceBets = this.filterBetsForRace(betList);
    this.calculateBetTotals(raceBets);
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

  calculateBetTotals(raceBets) {
    this.raceInfo.horses.forEach(horse => {
      let betTotalForHorse = 0;
      const betsForHorse = raceBets.filter(
        bets => bets.horseNumber === horse.number);
      betsForHorse.forEach(betForHorse => {
          betTotalForHorse = betTotalForHorse + Number(betForHorse.stake);
        });
      horse.totalBetsForHorse = betTotalForHorse;
      this.totalBetValue =  Number(this.totalBetValue) + Number(betTotalForHorse);
      console.log(this.totalBetValue);
    });
    this.getLiveToteOdds();
  }

  getLiveToteOdds() {
    const currentHorse = this.raceInfo.horses.forEach(
      horse => {
        horse.liveOdds = horse.totalBetsForHorse === 0 ?
        this.totalBetValue : (Math.round(this.totalBetValue / Number(horse.totalBetsForHorse) * 100) / 100).toFixed(2);
          });
  }

  setSelectedHorse(horse){
    this.balanceError = false;
    this.raceExpiredError = false;
    this.stakeError = false;
    this.betslip.horseNumber = horse.number;
    this.betslip.horseName = horse.name;
  }

  placeBet() {
    const userData: any = {};
    this.user.balance = this.user.balance - this.betslip.stake;
    userData.item = this.user;
    userData.table_name = 'RN_Users';

    // update user balance
    this.dataService.putTableInfo(userData).then(res => {
      const betData: any = {};
      betData.table_name = this.raceInfo.dbBetTableName;
      betData.item = this.betslip;
      this.betslip.betId = uuid();
      // submit bet
      this.dataService.putTableInfo(betData).then(resp => {
        document.getElementById('closeBetFormButton').click();
        location.reload();
      });
    });
  }

  ngOnInit(): void {
    if (this.user === undefined){
      this.router.navigate(['/pageNotFound']);
    }
    this.getCurentBetsForRace();
  }

}
