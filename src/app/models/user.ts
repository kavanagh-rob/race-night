export class User {
    constructor(
      public userId: string,
      public name: string,
      public avatorUrl: string,
      public balance: number,
      public payments: any []
    ) {  }
  }
