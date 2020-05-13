import { Horse } from './horse';

export class Result {
    constructor(
      public winningHorse: Horse,
      public raceNumber: number,
      public totalPot: number,
      public payoutFactor: number,
      public videoUrl: string,
      public horses: Horse[]
    ) {  }
  }
