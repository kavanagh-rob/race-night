import { Horse } from '../models/horse';
import { v1 as uuid } from 'uuid';
export class EventInfo {
  public eventId: string = uuid();
  public isActive = false;
  public payoutFactor = 1;
  public showPayoutFactor = true;
  public dbBetTableName = 'bets-001';
  public dbResultTableName = 'rn-results-001';
  public name = '';
  public eventNumber = null;
  public raceCardImageUrl = '';
  public horses = [];
    constructor() {  }
  }
