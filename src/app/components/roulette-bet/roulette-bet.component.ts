import { Component, OnInit } from '@angular/core';
import { RouletteBet } from '../../models/rouletteBet';

@Component({
  selector: 'app-roulette-bet',
  templateUrl: './roulette-bet.component.html',
  styleUrls: ['./roulette-bet.component.css']
})
export class RouletteBetComponent implements OnInit {

  betsForSpin: RouletteBet[] = [];
  spinNumber = 1;
  chipValue = 1;
  constructor() { }

  ngOnInit(): void {
  }

  addNumberBet(squareNumber) {
    const bet = new RouletteBet('rob', this.spinNumber, 'single', squareNumber,  this.chipValue);
    this.betsForSpin.push(bet);
  }

  getSquareStyle(squareNumber){
    let squareColor = '';
    if (this.hasBet(squareNumber)){
      squareColor = 'blue';
    }
    return { 'background-color': squareColor };

  }

  hasBet(squareNumber){
    return this.betsForSpin.filter(
      betData => betData.value === squareNumber).length > 0;
  }
}
