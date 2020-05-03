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
  interval: any;
  raceInfo;
  userBetsList;
  betslip: any = {};
  balanceError = false;
  stakeError = false;
  raceExpiredError = false;
  totalBetValue = 0;
  buttonClicked = false;
  placingbet = false;

  ngOnInit(): void {
    if (this.user === undefined){
      this.router.navigate(['/pageNotFound']);
    }
    this.getCurentBetsForRace();
    this.interval = setInterval(() => {
        this.refreshData();
    }, 20000);
  }



  refreshData() {
    this.dataService.getLiveRaceInfo().then(raceInfoData => {
      this.raceInfo = raceInfoData;
      this.getCurentBetsForRace();
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

  calculateCurrentOdds(betList){
    this.totalBetValue = 0;
    const raceBets = this.filterBetsForRace(betList);
    this.calculateBetTotals(raceBets);
  }

  getUserBets(betList){
    this.userBetsList = betList.filter(
      bets => bets.userId === this.user.userId);
  }

  requestBet() {
    this.balanceError = false;
    this.stakeError = false;
    this.raceExpiredError = false;
    this.betslip.result = 'PENDING';
    this.betslip.meetingId = this.raceInfo.meetingId;
    this.betslip.raceNumber = this.raceInfo.raceNumber;
    this.betslip.userId = this.user.userId;
    this.betslip.userName = this.user.name;
    this.betslip.userBalance = this.setTwoDecimals(this.user.balance);

    const stake = Number(this.betslip.stake);
    if (!stake || isNaN(stake) || stake < 1) {
      this.stakeError = true;
      return;
    }

    this.dataService.getUserById(this.user.userId).then(res => {
      this.user = res.Item;
      if ( Number(this.user.balance) < Number(this.betslip.stake)) {
        this.balanceError = true;
        return;
      }
      this.dataService.getLiveRaceInfo().then(raceInfoData => {
        this.raceInfo = raceInfoData;
        if (raceInfoData.isActive){
          this.placeBet();
        }else{
          this.raceExpiredError = true;
        }
      });
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
      this.totalBetValue = Number(this.totalBetValue) + Number(betTotalForHorse);
    });
    this.totalBetValue = this.setTwoDecimals(this.totalBetValue);
    this.getLiveToteOdds();
  }

  getLiveToteOdds() {
    const currentHorse = this.raceInfo.horses.forEach(
      horse => {
        let factoredHorseOdds = horse.totalBetsForHorse === 0 ?
        this.setTwoDecimals(this.totalBetValue) : this.setTwoDecimals(Number(this.totalBetValue) / Number(horse.totalBetsForHorse));
        if (this.raceInfo.payoutFactor && this.raceInfo.payoutFactor > 0 && this.raceInfo.payoutFactor < 1) {
          factoredHorseOdds =   this.setTwoDecimals(factoredHorseOdds * Number(this.raceInfo.payoutFactor));
        }
        horse.liveOdds = factoredHorseOdds;
        });
  }

  setSelectedHorse(horse){
    this.placingbet = false;
    this.buttonClicked = false;
    this.balanceError = false;
    this.raceExpiredError = false;
    this.stakeError = false;
    this.betslip.horseNumber = horse.number;
    this.betslip.horseName = horse.name;
  }

  placeBet() {
    if (this.placingbet){
      return;
    }
    this.placingbet = true;
    const userData: any = {};
    this.user.balance = Number(this.user.balance) - Number(this.betslip.stake);
    this.user.balance = this.setTwoDecimals(this.user.balance);
    userData.item = this.user;
    userData.table_name = 'RN_Users';

    // update user balance
    this.dataService.putTableInfo(userData).then(res => {
      const betData: any = {};
      betData.table_name = this.raceInfo.dbBetTableName;
      this.betslip.stake = this.setTwoDecimals(this.betslip.stake);
      betData.item = this.betslip;
      this.betslip.betId = uuid();
      // submit bet
      this.dataService.putTableInfo(betData).then(resp => {
        document.getElementById('closeBetFormButton').click();
        location.reload();
      });
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

  getUserImage(){
    let avator = 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Donald_Duck.svg/1200px-Donald_Duck.svg.png';
    if (this.user.avatorUrl){
      avator = this.user.avatorUrl;
    }
    return { 'background-image': 'url(' + avator + ')' };
  }

  getRaceActiveStyle(isActive){
    let actColor = '';
    if (isActive){
      actColor = 'blue';
    }
    else {
      actColor = 'red';
    }
    return { color: actColor };

  }
  getBetColor(result){
    let color = '';
    if (result === 'WIN'){
      color = 'green';
    }
    else if (result === 'LOSE'){
      color = 'red';
    }
    else {
      color = 'orange';
    }
    return { 'background-color': color };
  }

  sortBetByRace(prop: string) {
    if (! this.userBetsList){
      return;
    }
    const raceNumberProp = 'raceNumber';
    const horseNumberProp = 'horseNumber';
    const sortByHorse = this.userBetsList.sort((a, b) =>
      a[horseNumberProp] > b[horseNumberProp] ? 1 : a[horseNumberProp] === b[horseNumberProp] ? 0 : -1);

    return  sortByHorse.sort((a, b) =>
      b[raceNumberProp] - a[raceNumberProp]);
  }

  getPoolPayoutFactor(){
    if (this.raceInfo.payoutFactor && this.raceInfo.payoutFactor > 0 && this.raceInfo.payoutFactor < 1) {
     return Number(this.raceInfo.payoutFactor) * 100;
    }
    return 100;
  }

  getWinPot() {
    if (this.raceInfo.payoutFactor && this.raceInfo.payoutFactor > 0 && this.raceInfo.payoutFactor < 1) {
      return this.setTwoDecimals(Number(this.raceInfo.payoutFactor) * Number(this.totalBetValue));
     }
    return this.totalBetValue;
  }

  setTwoDecimals(input){
    return Number((Math.round(Number(input) * 100) / 100).toFixed(2));
  }
}
