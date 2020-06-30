import { Component, OnInit, Input } from '@angular/core';
import { RouletteBet } from '../../models/rouletteBet';
import {ActivatedRoute} from '@angular/router';
import {DataService} from '../../shared/services/data.service';
import {Router} from '@angular/router';
import { v1 as uuid } from 'uuid';
import { User } from '../../models/user';
import { EventInfo } from '../../models/eventInfo';

@Component({
  selector: 'app-roulette-bet',
  templateUrl: './roulette-bet.component.html',
  styleUrls: ['./roulette-bet.component.css']
})
export class RouletteBetComponent implements OnInit {
  @Input()
  eventInfo;
  existingBetslipForGame;
  inProgressBetsForSpin: RouletteBet[] = [];
  masterChips = [ 0.5, 1, 2, 5, 10, 25 ];
  selectedChipValue = this.masterChips[0];
  user;
  betslip: any = {};
  balanceError;
  liveGameInfo;
  gameExpiredError = false;
  userSyncError = false;

  constructor(private route: ActivatedRoute, private dataService: DataService, private router: Router) {
    const resolvedUserKey = 'resolvedPlayer';
    const resolvedUSerEventKey = 'resolvedUserEvent';
    this.user = this.route.snapshot.data[resolvedUserKey].Item;
  }

  hasBetsInProgress(){
    return ((this.inProgressBetsForSpin.length > 0) && !this.existingBetslipForGame) ||
      (this.existingBetslipForGame &&
       !this.compareArrays(this.existingBetslipForGame.betsForGame, this.inProgressBetsForSpin));
  }

  compareArrays(array1, array2){
    return array1.length === array2.length && array1.sort().every((value, index) => value === array2[index]);
  }


  ngOnInit(): void {
    if (this.eventInfo.currentGame.masterChipValues) {
      this.masterChips = this.eventInfo.currentGame.masterChipValues;
    }
    this.loadExistingBetsForSpin();
  }

  loadExistingBetsForSpin(){
    const betsQueryData: any = {};
    betsQueryData.table_name = this.eventInfo.dbBetTableName;
    this.dataService.queryBets(betsQueryData).then(res => {
      this.existingBetslipForGame = this.filterBetsForGame(res.Items)[0];
      // clone bets to all new bets
      this.inProgressBetsForSpin =  this.existingBetslipForGame && this.existingBetslipForGame.betsForGame ?
        [... this.existingBetslipForGame.betsForGame] : [];
    });
  }

  getWorkingBalance(){
    let workingBalance = Number(this.user.balance) - Number(this.getTotalStake(this.inProgressBetsForSpin));
    if (this.existingBetslipForGame) {
      workingBalance = workingBalance + Number(this.getTotalStake(this.existingBetslipForGame.betsForGame));
    }
    return workingBalance;
  }

  filterBetsForGame(betList){
    return betList.filter(
      bet => bet.userId === this.user.userId &&
        bet.eventId === this.eventInfo.eventInfoId &&
        bet.gameId === this.eventInfo.currentGame.gameId);
  }

  clearStagedBets() {
    location.reload();
  }

  clearBets(){
    if (!this.eventInfo.currentGame.isActive || !this.isAllBetsForCurrentGame(this.existingBetslipForGame.betsForGame)){
      alert('This game is no longer active, your submitted bets cannot be removed');
      location.reload();
      return;
    }
    if (confirm('This will clear all bets for this spinn including already submitted bets')) {
          this.inProgressBetsForSpin = [];

          if (this.existingBetslipForGame) {
            this.returnExistingBetBalance();
          }
      }
  }

  requestBets(){
    this.balanceError = false;
    if (!this.eventInfo.currentGame.isActive || !this.isAllBetsForCurrentGame(this.inProgressBetsForSpin)){
      alert('Sorry this game is no longer active, your unsubmitted bets will be reset');
      location.reload();
      return;
    }
    this.dataService.getUserById(this.user.userId).then(userRes => {
      if (this.user.balance !== userRes.Item.balance){
        this.userSyncError = true;
        alert('Error placing bet user data was not up to date, try again after page reloads');
        location.reload();
        return;
      }
      this.user = userRes.Item;

      if ( this.getWorkingBalance() < 0) {
        this.balanceError = true;
        return;
      }

      this.user.balance = this.getWorkingBalance();

      this.dataService.getEventInfo(this.user.eventId).then(eventInfoData => {
        this.liveGameInfo = eventInfoData.Item.currentGame;
        if (this.liveGameInfo.isActive){
          this.placeBet();
        }else{
          this.gameExpiredError = true;
        }
      });
    });
  }

  returnExistingBetBalance() {
    const userData: any = {};
    this.user.balance = Number(this.user.balance) + Number(this.getTotalStake(this.existingBetslipForGame.betsForGame));
    this.user.balance = this.setTwoDecimals(this.user.balance);
    userData.item = this.user;
    userData.table_name = 'RN_Users';

    // update user balance and clear existing bets
    this.dataService.putTableInfo(userData).then(res => {
      const betData: any = {};
      betData.table_name = this.eventInfo.dbBetTableName;
      this.existingBetslipForGame.betsForGame = [];
      betData.item = this.existingBetslipForGame;
      // submit bet
      this.dataService.putTableInfo(betData).then(resp => {
        // document.getElementById('closeBetFormButton').click();
        location.reload();
      });
    });
  }

  isAllBetsForCurrentGame(betList){
    return betList.filter(
      betData => {
        if (betData.gameId !== this.eventInfo.currentGame.gameId ) {
          return false;
        }
        return true;
    }).length === 0;
  }

  getTotalStake(betList){
    return Number(betList.reduce((prev, current) => prev + current.stake, 0));
  }

  submitBets() {
    if (confirm('Confirm you want to set the bets for this spin, this will overwrite any previous bets placed')) {
      this.requestBets();
    }
  }

  placeBet() {
    const userData: any = {};
    userData.item = this.user;
    userData.table_name = 'RN_Users';

    this.dataService.putTableInfo(userData).then(res => {
      const betData: any = {};
      betData.table_name = this.eventInfo.dbBetTableName;
      this.betslip.betsForGame = this.inProgressBetsForSpin;
      this.betslip.gameType = 'roulette';
      this.betslip.spinNumber = this.eventInfo.currentGame.spinNumber;
      this.betslip.userId = this.user.userId;
      this.betslip.gameId = this.eventInfo.currentGame.gameId;
      betData.item = this.betslip;
      this.betslip.betId = this.existingBetslipForGame ? this.existingBetslipForGame.betId : uuid();
      this.betslip.eventId = this.eventInfo.eventInfoId ;
      // submit bet
      this.dataService.putTableInfo(betData).then(resp => {
        // document.getElementById('closeBetFormButton').click();
        location.reload();
      });
    });
  }


  addBetForSquare(squareId){
    this.balanceError = false;
    if (this.selectedChipValue === -1){
      this.removeBetsForSquare(squareId);
      return;
    }
    if (this.getWorkingBalance() - this.selectedChipValue < 0){
      this.balanceError = true;
      return;
    }
    const existingBet = this.getBetsForSquare(squareId)[0];
    if (existingBet){
      existingBet.stake = existingBet.stake + this.selectedChipValue;
    }else{
      this.inProgressBetsForSpin.push(
        new RouletteBet('rob', this.eventInfo.currentGame.spinNumber, squareId,  this.selectedChipValue,
        this.getSelectedNumberForBet(squareId), this.getOddsForBet(squareId)));
    }
  }

  getOddsForBet(squareId){
    let selectedOdds;
    if (typeof squareId === 'number'){
      selectedOdds = 35;
    }
    else {
      switch (squareId) {
        case 'even':
          selectedOdds = 1;
          break;
        case 'odd':
          selectedOdds = 1;
          break;
        case 'red':
          selectedOdds = 1;
          break;
        case 'black':
          selectedOdds = 1;
          break;
        case 'first_18':
          selectedOdds = 1;
          break;
        case 'second_18':
          selectedOdds = 1;
          break;
        case 'first_12':
          selectedOdds = 2;
          break;
        case 'second_12':
          selectedOdds = 2;
          break;
        case 'third_12':
          selectedOdds = 2;
          break;
        case 'first_column':
          selectedOdds = 2;
          break;
        case 'second_column':
          selectedOdds = 2;
          break;
        case 'third_column':
          selectedOdds = 2;
          break;
      }
    }
    return selectedOdds;
  }

  getSelectedNumberForBet(squareId){
    let selectedNumbers;
    if (typeof squareId === 'number'){
      selectedNumbers = [squareId];
    }
    else {
      switch (squareId) {
        case 'even':
          selectedNumbers = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36];
          break;
        case 'odd':
          selectedNumbers = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35];
          break;
        case 'red':
          selectedNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
          break;
        case 'black':
          selectedNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
          break;
        case 'first_18':
          selectedNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
          break;
        case 'second_18':
          selectedNumbers = [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];
          break;
        case 'first_12':
          selectedNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
          break;
        case 'second_12':
          selectedNumbers = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
          break;
        case 'third_12':
          selectedNumbers = [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];
          break;
        case 'first_column':
          selectedNumbers = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
          break;
        case 'second_column':
          selectedNumbers = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
          break;
        case 'third_column':
          selectedNumbers = [3, 6, 9, 12, 15, 18, 21, 24, 26, 30, 33, 36];
          break;
      }
    }
    return selectedNumbers;
  }


  getSquareStyle(squareNumber){
    let squareColor = '';
    if (this.hasBet(squareNumber)){
      squareColor = 'blue';
    }
    // return { 'background-color': squareColor };

  }

  getSelectedChipStyle(chip) {
    let chipColor = '';
    if (this.selectedChipValue === chip){
      chipColor = 'indigo';
    }
    return {  'border-radius': '15px 15px 15px 15px', display: 'flex', 'background-color': chipColor };
  }

  getChipClass(squareNumber){
    const betsForSquare = this.getBetsForSquare(squareNumber);
    const chipTotal = betsForSquare.reduce((prev, current) => prev + current.stake, 0);
    return this.getChipClassFromValue(chipTotal);
  }

  getChipClassFromValue(chipTotal){
    let chipClass = '';
    if (chipTotal <= 0){
      chipClass = 'hidden';
    }
    else if (chipTotal >= 200 ){
      chipClass = 'chip12';
    }
    else if (chipTotal >= 100){
      chipClass = 'chip8';
    }
    else if (chipTotal >= 75){
      chipClass = 'chip13';
    }
    else if (chipTotal >= 50){
      chipClass = 'chip11';
    }
    else if (chipTotal >= 25){
      chipClass = 'chip2';
    }
    else if (chipTotal >= 15){
      chipClass = 'chip5';
    }
    else if (chipTotal >= 10){
      chipClass = 'chip4';
    }
    else if (chipTotal >= 5){
      chipClass = 'chip3';
    }
    else if (chipTotal >= 4){
      chipClass = 'chip10';
    }
    else if (chipTotal >= 3){
      chipClass = 'chip9';
    }
    else if (chipTotal >= 2){
      chipClass = 'chip7';
    }
    else if (chipTotal >= 1){
      chipClass = 'chip6';
    }
    else if (chipTotal > 0 ){
      chipClass = 'chip1';
    }
    return chipClass;
  }

  getChipValue(squareId){
    const betsForSquare = this.getBetsForSquare(squareId);
    if (betsForSquare[0]) {
      return betsForSquare[0].stake;
    }
  }

  hasBet(squareId){
    return this.inProgressBetsForSpin.filter(
      betData => betData.squareId === squareId).length > 0;
  }

  getBetsForSquare(squareId){
    return this.inProgressBetsForSpin.filter(
      betData => betData.squareId === squareId);
  }

  removeBetsForSquare(squareId){
    this.inProgressBetsForSpin = this.inProgressBetsForSpin.filter(
        betData => betData.squareId !== squareId);
  }

  setTwoDecimals(input){
    return Number((Math.round(Number(input) * 100) / 100).toFixed(2));
  }
}
