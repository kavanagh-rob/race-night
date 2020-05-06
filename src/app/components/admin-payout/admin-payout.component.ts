import { Component, OnInit } from '@angular/core';
import {DataService} from '../../shared/services/data.service';
import {Router, ActivatedRoute} from '@angular/router';

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
  raceResultsList;
  raceList;
  clicked = false;

  ngOnInit() {
    this.liveRaceInfo = this.eventInfo ? this.eventInfo.currentRace : null;
    this.getSubmittedResults();
  }

  getSubmittedResults() {
    const resultsRequestData: any = {};
    resultsRequestData.table_name = this.eventInfo.dbResultTableName;
    this.dataService.scanTableInfo(resultsRequestData).then(raceResultsData => {
      if (raceResultsData && raceResultsData.Items){
        this.raceResultsList = raceResultsData.Items;
      }
      this.loadBetsForEvent();
    });
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
    const winningHorseNumber = result ? result.winningHorseNumber : null;
    if (winningHorseNumber) {
      if (winningHorseNumber === horseNumber){
        return 'WIN';
      } else {
        return 'LOSE';
      }
    }
    return 'N/A';
  }

  async processBetsForRace(raceNumber) {
    this.betsToPay = [];
    const raceResult = this.getResultForRace(raceNumber);
    if (!raceResult || !raceResult.winningHorseNumber){
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

      await openBetsForRace.forEach(
           openBet => {
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

      console.log(this.betsToPay);

      this.payBetsForUser();
    }
  }

  payBetsForUser() {
    const userIDsToPay = this.getDistinctUsersForBetList(this.betsToPay);
    console.log('userIDsToPay');
    console.log(userIDsToPay);
    userIDsToPay.forEach(distinctUserId => {
      this.dataService.getUserById(distinctUserId).then(res => {
        const user = res.Item;
        const winningBetsForUser = this.betsToPay.filter(
            bet => bet.userId === user.userId);

        winningBetsForUser.forEach(winBet => {
          console.log('win bets');
          console.log(winBet.payout);
          user.balance = this.setTwoDecimals(Number(user.balance) + Number(winBet.payout));
          });
        this.payUser(user, winningBetsForUser);
      });
    });
  }

  getDistinctUsersForBetList(betList) {
    return betList.map(bet => bet.userId)
    .filter((value, index, self) => self.indexOf(value) === index);
  }

  upDateBet(betData){
    this.dataService.putTableInfo(betData).then(resp => {  });
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




  payUser(user, winningBetsForUser) {
      const userData: any = {};
      userData.item = user;
      userData.table_name = 'RN_Users';

      // update user balance
      this.dataService.putTableInfo(userData).then(resp => {
        winningBetsForUser.forEach(winBet => {
          console.log('winbet');
          console.log(winBet);
          winBet.paymentStatus = 'COMPLETE';
          const betData: any = {};
          betData.item = winBet;
          betData.table_name = this.eventInfo.dbBetTableName;
          this.dataService.putTableInfo(betData).then(closeBetResp => {
            console.log('closed');
            console.log(winBet);
          });
        });
      });
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
    return this.raceResultsList.filter(
      result => result.raceInfo.raceNumber === raceNumber)[0];
  }

  getHorseOdds(raceNumber, horseNumber){
    const raceResult = this.getResultForRace(raceNumber);
    if (!raceResult) {
      return;
    }
    return raceResult.raceInfo.horses.filter(
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
