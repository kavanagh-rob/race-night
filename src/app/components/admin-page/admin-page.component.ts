import { Component, OnInit } from '@angular/core';
import {DataService} from '../../shared/services/data.service';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent implements OnInit {

  constructor(private dataService: DataService) { }
  allBets;
  currentRaceInfo;
  raceResultsList;
  raceList;
  noWinnerError = false;

ngOnInit() {
    this.loadRaceResults();
}

loadRaceResults() {
  this.dataService.getLiveRaceInfo().then(raceInfoData => {
    this.currentRaceInfo = raceInfoData;
    this.getSubmittedResults();
  });
}

getSubmittedResults() {
  const resultsRequestData: any = {};
  resultsRequestData.table_name = this.currentRaceInfo.dbResultTableName;
  this.dataService.scanTableInfo(resultsRequestData).then(raceInfoData => {
    if (raceInfoData && raceInfoData.Items){
      this.raceResultsList = raceInfoData.Items;
    }
    this.loadBets();
  });
}

loadBets() {
  const betsQueryData: any = {};
  betsQueryData.table_name = this.currentRaceInfo.dbBetTableName;
  this.dataService.queryBets(betsQueryData).then(res => {
    this.allBets = res.Items;
    this.raceList = this.getDistinctRaces(this.allBets);
    this.setBetResultInfo();
  });
}

setBetResultInfo() {
  this.allBets.forEach(bet => {
    // change this for no stats check
    if (bet.status === 'N/A' || bet.status === 'PENDING'){
      const startingPrice = this.getHorseOdds(bet.raceNumber, bet.horseNumber);
      bet.finalOdds = startingPrice;
      bet.status = this.getBetStatus(bet.raceNumber, bet.horseNumber);
      bet.payout = bet.status === 'WIN' ? this.setTwoDecimals(Number(bet.finalOdds) * Number(bet.stake)) : 0;
    }
  });
}

getBetsForRace(raceNumber) {
  return this.allBets.filter(
    bets => bets.raceNumber === raceNumber);
}

getBetStatus(raceNumber, horseNumber) {
  const results = this.getResultForRace(raceNumber);
  const winningHorseNumber = results.length > 0 ? results[0].winningHorseNumber : null;
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
  this.noWinnerError = true;
  const raceResult = this.getResultForRace(raceNumber)[0];
  if (!raceResult || !raceResult.winningHorseNumber){
    this.noWinnerError = true;
    return;
  }
  else{
    const openBetsForRace = this.allBets.filter(
      bet => {
        if (bet.raceNumber !== raceNumber || bet.isProcessed) {
          return false;
        }
        return true;
        });

    openBetsForRace.forEach(
        openBet => {
          openBet.isProcessed = true;
          const betData: any = {};
          betData.item = openBet;
          betData.table_name = this.currentRaceInfo.dbBetTableName;
            // submit bet
          this.dataService.putTableInfo(betData).then(resp => {
            if (openBet.status === 'WIN'){
              this.payUser(openBet);
            }
          });
      });
  }
}

payUser(openBet) {
  this.dataService.getUserById(openBet.userId).then(res => {
    const user = res.Item;
    const balance = Number(user.balance) + Number(openBet.payout);
    const userData: any = {};
    user.balance = Number(user.balance) + Number(openBet.payout);
    userData.item = user;
    userData.table_name = 'RN_Users';

    // update user balance
    this.dataService.putTableInfo(userData).then(resp => {
      openBet.paymentStatus = 'complete';
      const betData: any = {};
      betData.item = openBet;
      betData.table_name = this.currentRaceInfo.dbBetTableName;
      this.dataService.putTableInfo(betData).then(closeBetResp => {
      });
    });

  });
}

updateBetSlip(betslip) {
  const betData: any = {};
  betData.table_name = this.currentRaceInfo.dbBetTableName;
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
    result => result.raceInfo.raceNumber === raceNumber);
}

getHorseOdds(raceNumber, horseNumber){
  const raceResult = this.getResultForRace(raceNumber)[0];
  return raceResult.raceInfo.horses.filter(
    horse => horse.number === horseNumber)[0].liveOdds;
}

setTwoDecimals(input){
  return Number((Math.round(Number(input) * 100) / 100).toFixed(2));
}

}
