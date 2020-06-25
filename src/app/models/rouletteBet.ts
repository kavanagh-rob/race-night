export class RouletteBet {
  public eventId;
    constructor(
      public userId: string,
      public spinNumber: number,
      public type: string,
      public value: number,
      public stake: number
    ) {  }
  }
