export class User {
  public eventId;
    constructor(
      public userId: string,
      public name: string,
      public avatorUrl: string,
      public balance: number,
      public payments: any []
    ) {  }
  }
