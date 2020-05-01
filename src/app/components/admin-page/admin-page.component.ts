import { Component, OnInit } from '@angular/core';
import {DataService} from '../../shared/services/data.service';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent implements OnInit {

  constructor(private dataService: DataService) { }

  ngOnInit() {
  }

}
