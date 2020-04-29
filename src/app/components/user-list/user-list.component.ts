import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import {DataService} from '../../shared/services/data.service';
import {Router, NavigationExtras, ActivatedRoute} from '@angular/router';
import { v1 as uuid } from 'uuid';


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  constructor(private dataService: DataService, private router: Router) {
    this.userModel = new User(uuid(), '', '', null, []);
  }
  meeting;
  users = [];
  userModel: User;
  userToTopUp: any = {};
  topUpAmount;

  ngOnInit() {
      this.loadUsers();
  }

  loadUsers() {
    this.dataService.getAllUsers().then(res => { // Success
      this.users = res.Items;
    });
  }

  navigateToUser(userId) {
    this.router.navigateByUrl('/player-home/' + userId);
  }

  submitUser() {
    const data: any = {};
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
    this.dataService.getUserById(this.userToTopUp.userId).then(res => {
      const userWithTopUp = res.Item;
      userWithTopUp.balance = Number(userWithTopUp.balance) + Number(this.topUpAmount);
      const userData: any = {};
      const payment = {date: new Date().toLocaleString(), amount: Number(this.topUpAmount)};
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
