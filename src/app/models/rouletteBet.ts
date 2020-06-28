export class RouletteBet {
  public eventId;
    constructor(
      public userId: string,
      public spinNumber: number,
      public squareId: number,
      public stake: number,
      public selectedNumbers: number[],
      public odds: number
    ) {  }
  }
