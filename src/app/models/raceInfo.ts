import { Horse } from '../models/horse';
import { v1 as uuid } from 'uuid';
export class RaceInfo {
  public raceId: string = uuid();
  public eventId: string;
  public raceNumber;
  public name = '';
  public isActive = false;
  public payoutFactor = 1;
  public showPayoutFactor = true;
  public raceCardImageUrl = 'N/A';
  public raceTime = '..soon';
  public horses = [];
    constructor() {  }
  }
