import { v1 as uuid } from 'uuid';
export class Horse {
  public horseId: string = uuid();
  public horseNumber = null;
  public name = '';
  public liveOdds: number;
  public totalBetsForHorse: number;
    constructor(
    ) {  }
  }
