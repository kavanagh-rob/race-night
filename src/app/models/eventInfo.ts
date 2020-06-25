import { v1 as uuid } from 'uuid';
import { RaceInfo } from '../models/raceInfo';

export class EventInfo {
  constructor() { }
  public eventInfoId = uuid();
  public eventImage = null;
  public name = null;
  public organiser = null;
  public date = null;
  public dbBetTableName = 'bets-001';
  public currentRace: RaceInfo;
  public races = [];
}
