import { Component, OnInit, Input } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DataService} from '../../shared/services/data.service';
import {Router} from '@angular/router';
import { User } from '../../models/user';

@Component({
  selector: 'app-game-history',
  templateUrl: './game-history.component.html',
  styleUrls: ['./game-history.component.css']
})
export class GameHistoryComponent implements OnInit {

  constructor(private route: ActivatedRoute, private dataService: DataService, private router: Router) {
    const resolvedUserKey = 'resolvedPlayer';
    this.user = this.route.snapshot.data[resolvedUserKey].Item;
  }

  @Input()
  eventInfo;
  userBetsList;
  user: User;
  accordianOpened = -1 ;

  ngOnInit(): void {
    this.getCurentBetsForRace();
  }

  getCurentBetsForRace() {
    const betsQueryData: any = {};
    betsQueryData.table_name = this.eventInfo.dbBetTableName;
    this.dataService.queryBets(betsQueryData).then(res => {
      this.getUserBets(res.Items);
    });
  }

  getUserBets(betList){
    this.userBetsList = betList.filter(
      bet => bet.userId === this.user.userId && bet.eventId === this.eventInfo.eventInfoId);
  }


  sortBets(prop: string) {
    if (!this.userBetsList){
      return;
    }
    const spinNumberProp = 'spinNumber';
    return  this.userBetsList.sort((a, b) =>
      b[spinNumberProp] - a[spinNumberProp
      ]);
  }

  getBetType(bet){
    return typeof bet.squareId === 'number' ? bet.squareId + ' (single)' : bet.squareId.toUpperCase();
  }

  getBetColor(bet){
    let color = '';
    if (bet.paymentStatus === 'COMPLETE'){
      color = 'green';
    }
    else if (bet.paymentStatus === 'PROCESSING'){
      color = 'grey';
    }
    else if (bet.result === 'WIN'){
      color = 'lightgreen';
    }
    else if (bet.result === 'LOSE'){
      color = 'lightcoral';
    }
    else {
      color = 'orange';
    }
    return { 'background-color': color };
  }

  toggleAccordian(index) {
    this.accordianOpened = this.accordianOpened === index ? -1 : index;
  }

  setTwoDecimals(input){
    return Number((Math.round(Number(input) * 100) / 100).toFixed(2));
  }


}
