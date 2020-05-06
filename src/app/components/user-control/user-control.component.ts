import { Component, OnInit } from '@angular/core';
import {DataService} from '../../shared/services/data.service';
import { EventInfo } from '../../models/eventInfo';
import {Router, ActivatedRoute} from '@angular/router';
import { User } from '../../models/user';
import { v1 as uuid } from 'uuid';

@Component({
  selector: 'app-user-control',
  templateUrl: './user-control.component.html',
  styleUrls: ['./user-control.component.css']
})
export class UserControlComponent implements OnInit {

  constructor(private dataService: DataService,  private route: ActivatedRoute, private router: Router) {
    const resolvedEvent = 'resolvedEvent';
    this.eventInfo = this.route.snapshot.data[resolvedEvent].Item;
    this.userModel = new User(uuid(), 'name', null, 0, []);
  }
  eventInfo;
  users = [];
  userModel: User;
  userToTopUp: any = {};
  topUpAmount;


  ngOnInit() {
    this.loadUsers();
}

loadUsers() {
  this.dataService.getAllUsers().then(res => { // Success
    this.users = [];
    if (res.Items){
      this.users = res.Items.filter(
        user => user.eventId === this.eventInfo.eventInfoId);
    }
  });
}

addNewPlayer() {
  this.userModel = new User(uuid(), 'name', null, 0, []);
}

navigateToUser(userId) {
  this.router.navigateByUrl('/player-home/' + userId);
}

navigateToPage(route) {
  this.router.navigate(['../' + route],  {relativeTo: this.route});
}

submitUser() {
  const data: any = {};
  this.userModel.userId = uuid();
  this.userModel.eventId = this.eventInfo.eventInfoId;
  data.item = this.userModel;
  data.table_name = 'RN_Users';
  if (this.userModel.balance) {
    const payment = {date: new Date().toLocaleString(), amount: this.userModel.balance};
    this.userModel.payments.push(payment);
  }
  this.dataService.putTableInfo(data).then(res => { // Success
    document.getElementById('closeUserModelButton').click();
    this.loadUsers();
  });
}

topUpUser(user){
  this.userToTopUp = user;
}

submitTopUpForUser() {
  if (this.topUpAmount && Number(this.topUpAmount) > 0){
    this.dataService.getUserById(this.userToTopUp.userId).then(res => {
      const userWithTopUp = res.Item;
      userWithTopUp.balance = Number(userWithTopUp.balance) + Number(this.topUpAmount);
      const userData: any = {};
      const payment = {date: new Date().toLocaleString(), amount: Number(this.topUpAmount)};
      if (!userWithTopUp.payments){
        userWithTopUp.payments = [];
      }
      userWithTopUp.payments.push(payment);
      userData.item = userWithTopUp;
      userData.table_name = 'RN_Users';

      // update user balance
      this.dataService.putTableInfo(userData).then(resp => {
        document.getElementById('closeTopUpModelButton').click();
        location.reload();
      });
    });
  }
}
}
