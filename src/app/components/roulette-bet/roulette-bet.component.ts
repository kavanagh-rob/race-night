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

  betsForSpin: RouletteBet[] = [];
  spinNumber = 1;
  masterChips = [ 0.5, 1, 2, 5, 10, 25 ];
  selectedChipValue = this.masterChips[0];
  user;
  betslip;
  balanceError;
  liveGameInfo;
  gameExpiredError = false;

  constructor(private route: ActivatedRoute, private dataService: DataService, private router: Router) {
    const resolvedUserKey = 'resolvedPlayer';
    const resolvedUSerEventKey = 'resolvedUserEvent';
    this.user = this.route.snapshot.data[resolvedUserKey].Item;
  }


  ngOnInit(): void {}

  requestBet(){
    this.dataService.getUserById(this.user.userId).then(res => {
      this.user = res.Item;
      if ( Number(this.user.balance) < Number(this.betslip.stake)) {
        this.balanceError = true;
        return;
      }
      this.dataService.getEventInfo(this.user.eventId).then(eventInfoData => {
        this.liveGameInfo = eventInfoData.Item.liveSpinInfo;
        if (this.liveGameInfo.isActive){
          this.placeBet();
        }else{
          this.gameExpiredError = true;
        }
      });
    });
  }

  placeBet() {
    const userData: any = {};
    this.user.balance = Number(this.user.balance) - Number(this.betslip.stake);
    this.user.balance = this.setTwoDecimals(this.user.balance);
    userData.item = this.user;
    userData.table_name = 'RN_Users';

    // update user balance
    this.dataService.putTableInfo(userData).then(res => {
      const betData: any = {};
      betData.table_name = this.eventInfo.dbBetTableName;
      this.betslip.stake = this.setTwoDecimals(this.betslip.stake);
      betData.item = this.betslip;
      this.betslip.betId = uuid();
      this.betslip.eventId = this.eventInfo.eventInfoId ;
      // submit bet
      this.dataService.putTableInfo(betData).then(resp => {
        document.getElementById('closeBetFormButton').click();
        location.reload();
      });
    });
  }


  addBetForSquare(squareId){
    if (this.selectedChipValue === -1){
      this.removeBetsForSquare(squareId);
      return;
    }
    const existingBet = this.getBetsForSquare(squareId)[0];
    if (existingBet){
      existingBet.stake = existingBet.stake + this.selectedChipValue;
    }else{
      this.betsForSpin.push(new RouletteBet('rob', this.spinNumber, squareId,  this.selectedChipValue,
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
        case 'first18':
          selectedOdds = 1;
          break;
        case 'second18':
          selectedOdds = 1;
          break;
        case 'first12':
          selectedOdds = 2;
          break;
        case 'second12':
          selectedOdds = 2;
          break;
        case 'third12':
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
        case 'first18':
          selectedNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
          break;
        case 'second18':
          selectedNumbers = [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];
          break;
        case 'first12':
          selectedNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
          break;
        case 'second12':
          selectedNumbers = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
          break;
        case 'third12':
          selectedNumbers = [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];
          break;
      }
    }
    return selectedNumbers;
  }

  addNumberBet(squareId) {
    if (this.selectedChipValue === -1){
      this.removeBetsForSquare(squareId);
      return;
    }
    const existingBet = this.getBetsForSquare(squareId)[0];
    if (existingBet){
      existingBet.stake = existingBet.stake + this.selectedChipValue;
    }else{
      this.betsForSpin.push(new RouletteBet('rob', this.spinNumber, squareId,  this.selectedChipValue, [squareId], 35));
    }
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
    return this.betsForSpin.filter(
      betData => betData.squareId === squareId).length > 0;
  }

  getBetsForSquare(squareId){
    return this.betsForSpin.filter(
      betData => betData.squareId === squareId);
  }

  removeBetsForSquare(squareId){
    this.betsForSpin = this.betsForSpin.filter(
        betData => betData.squareId !== squareId);
  }

  setTwoDecimals(input){
    return Number((Math.round(Number(input) * 100) / 100).toFixed(2));
  }
}
