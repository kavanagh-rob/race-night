import { Component, OnInit } from '@angular/core';
import {DataService} from '../../shared/services/data.service';
import {Router, ActivatedRoute} from '@angular/router';
import { Observable, forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-payout',
  templateUrl: './admin-payout.component.html',
  styleUrls: ['./admin-payout.component.css']
})
export class AdminPayoutComponent implements OnInit {

  constructor(private dataService: DataService,  private route: ActivatedRoute, private router: Router) {
    const resolvedEvent = 'resolvedEvent';
    this.eventInfo = this.route.snapshot.data[resolvedEvent].Item;
  }
  eventInfo;

  allBetsForEvent = [];
  betsToPay = [];
  liveRaceInfo;
  raceList;
  clicked = false;
  updateBetCalls = [];
  getUserCalls = [];
  updateUserCalls = [];
  completBetCalls = [];

  ngOnInit() {
    this.liveRaceInfo = this.eventInfo ? this.eventInfo.currentRace : null;
    this.loadBetsForEvent();
  }

  loadBetsForEvent() {
    const betsQueryData: any = {};
    betsQueryData.table_name = this.eventInfo.dbBetTableName;
    this.dataService.queryBets(betsQueryData).then(res => {
      if (res.Items){
        this.allBetsForEvent = res.Items.filter(
          bet => bet.eventId === this.eventInfo.eventInfoId);
      }

      this.raceList = this.getDistinctRaces(this.allBetsForEvent);
      this.setBetResultInfo();
    });
  }

  setBetResultInfo() {
    this.allBetsForEvent.forEach(bet => {
      // change this for no stats check
      if (bet.result === 'N/A' || bet.result === 'PENDING'){
        const startingPrice = this.getHorseOdds(bet.raceNumber, bet.horseNumber);
        if (!startingPrice) {
          return;
        }
        bet.finalOdds = startingPrice;
        bet.result = this.getBetResult(bet.raceNumber, bet.horseNumber);
        bet.payout = bet.result === 'WIN' ? this.setTwoDecimals(Number(bet.finalOdds) * Number(bet.stake)) : 0;
      }
    });
  }

  getBetsForRace(raceNumber) {
    return this.allBetsForEvent.filter(
      bet => bet.raceNumber === raceNumber);
  }

  getBetResult(raceNumber, horseNumber) {
    const result = this.getResultForRace(raceNumber);
    const winningHorseNumber = result ? result.winningHorse.horseNumber : null;
    if (winningHorseNumber) {
      if (winningHorseNumber === horseNumber){
        return 'WIN';
      } else {
        return 'LOSE';
      }
    }
    return 'N/A';
  }

  processBetsForRace(raceNumber) {
    this.betsToPay = [];
    const raceResult = this.getResultForRace(raceNumber);
    if (!raceResult || !raceResult.winningHorse){
      return;
    }
    else{
      const openBetsForRace = this.allBetsForEvent.filter(
        bet => {
          let isBetOpen = true;
          if ( bet.raceNumber !== raceNumber || this.isCompletedBet(bet)) {
            isBetOpen = false;
          }
          return isBetOpen;
          });

      this.setBetsToPay(openBetsForRace);
      this.upDateBetJoin();
    }
  }

  setBetsToPay(openBetsForRace){
    openBetsForRace.forEach( openBet => {
        openBet.isProcessed = true;
        const betData: any = {};
        betData.item = openBet;
        betData.table_name = this.eventInfo.dbBetTableName;
        if ( !(openBet.paymentStatus === 'COMPLETE') && openBet.result === 'WIN') {
            openBet.paymentStatus = 'PROCESSING';
            this.betsToPay.push(openBet);
        }
        this.upDateBet(betData);
    });
   }

   upDateBet(betData){
    this.updateBetCalls.push(this.dataService.putTableInfo(betData));
  }

  upDateBetJoin(){
    forkJoin(...this.updateBetCalls).subscribe(
      data => { // Note: data is an array now
        this.getDistinctUsersToPay();
        this.getUsersJoin();

      }, err => console.log('error ' + err),
      () => console.log('Ok ')
    );
  }


  getUsersJoin() {
    forkJoin(...this.getUserCalls).subscribe(
      data => { // Note: data is an array now
        data.forEach(res => {
          const user = res.Item;
          const winningBetsForUser = this.betsToPay.filter(
            bet => bet.userId === user.userId);
          winningBetsForUser.forEach(winBet => {
          user.balance = this.setTwoDecimals(Number(user.balance) + Number(winBet.payout));
          });
          this.payUser(user, winningBetsForUser);
        });

      }, err => console.log('error ' + err),
      () => console.log('Ok ')
    );
  }

  payUser(user, winningBetsForUser) {
    const userData: any = {};
    userData.item = user;
    userData.table_name = 'RN_Users';

    // update user balance
    this.dataService.putTableInfo(userData).then(resp => {
      const completedBetPromises = [];
      winningBetsForUser.forEach(winBet => {
        winBet.paymentStatus = 'COMPLETE';
        const betData: any = {};
        betData.item = winBet;
        betData.table_name = this.eventInfo.dbBetTableName;
        completedBetPromises.push(this.dataService.putTableInfo(betData));
      });
      this.completeBetJoin(completedBetPromises);
    });
  }


  getDistinctUsersToPay() {
    const userIDsToPay = this.getDistinctUsersForBetList(this.betsToPay);
    userIDsToPay.forEach(distinctUserId => {
      this.getUser(distinctUserId);
    });
  }

  getUser(distinctUserId){
    this.getUserCalls.push(
      this.dataService.getUserById(distinctUserId));
  }

  completeBetJoin(completedBetPromises){
    forkJoin(...this.updateUserCalls).subscribe(
      data => { // Note: data is an array now

      }, err => console.log('error ' + err),
      () => console.log('Completed Processing Bets')
    );
  }

  getDistinctUsersForBetList(betList) {
    return betList.map(bet => bet.userId)
    .filter((value, index, self) => self.indexOf(value) === index);
  }

  isCompletedBet(bet){
    let isCompleted = false;
    if ((bet.isProcessed && bet.result !== 'WIN')){
      isCompleted = true;
    }
    else if (bet.result === 'WIN' && bet.paymentStatus === 'COMPLETE') {
      isCompleted = true;
    }
    return isCompleted;
  }

  updateBetSlip(betslip) {
    const betData: any = {};
    betData.table_name = this.eventInfo.dbBetTableName;
    betData.item = betslip;
    // submit bet
    this.dataService.putTableInfo(betData).then(resp => {
    });
  }

  getDistinctRaces(betList) {
    return betList.map(bet => bet.raceNumber)
    .filter((value, index, self) => self.indexOf(value) === index);
  }

  getResultForRace(raceNumber){
    const selectedRace = this.getSelectedRace(raceNumber);
    return selectedRace ? selectedRace.result : null;
  }

  getSelectedRace(raceNumber){
    return this.eventInfo.races.filter(
      race =>  race.raceNumber === raceNumber)[0];
  }

  getHorseOdds(raceNumber, horseNumber){
    const selectedRace = this.getSelectedRace(raceNumber);
    if (!selectedRace) {
      return;
    }
    return selectedRace.horses.filter(
      horse => horse.horseNumber === horseNumber)[0].liveOdds;
  }

  navigateToUser(userId) {
    this.router.navigateByUrl('/player-home/' + userId);
  }

  navigateToPage(route) {
    this.router.navigate(['../../' + route],  {relativeTo: this.route});
  }

  navigateToLiveResultsPage(route) {
    this.router.navigate(['../' + route],  {relativeTo: this.route});
  }


  setTwoDecimals(input){
    return Number((Math.round(Number(input) * 100) / 100).toFixed(2));
  }

  sortRaceList(prop: string) {
    return this.raceList ? this.raceList.sort((a, b) => b - a) : null;
  }

  getBetColor(bet) {
    let color = '';
    if (bet.result === 'WIN' || bet.result === 'LOSE') {
      color = 'burlywood';
    }
    if (bet.paymentStatus && bet.paymentStatus === 'PROCESSING' ) {
      color = 'orange';
    }
    if (bet.paymentStatus && bet.paymentStatus === 'COMPLETE') {
      color = 'lightgreen';
    }
    return { 'background-color': color };
  }

}
