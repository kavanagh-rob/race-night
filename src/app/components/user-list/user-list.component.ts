import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import {DataService} from '../../shared/services/data.service';
import {Router, NavigationExtras, ActivatedRoute} from '@angular/router';
import { v1 as uuid } from 'uuid';
import { areAllEquivalent } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  constructor(private dataService: DataService, private router: Router) {
    this.userModel = new User(uuid(), '', '', null);
  }
  meeting;
  users = [];
  userModel: User;

  ngOnInit() {
      this.loadUsers();
  }

  loadUsers() {
    this.dataService.getAllUsers().then(res => { // Success
      this.users = res.Items;
    });
  }

  submitUser() {
    const data: any = {};
    data.item = this.userModel;
    data.table_name = 'RN_Users';
    this.dataService.putTableInfo(data).then(res => { // Success
      document.getElementById('closeUserModelButton').click();
      this.loadUsers();
    });
  }

}
