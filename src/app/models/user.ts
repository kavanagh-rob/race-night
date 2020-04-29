export class User {
    constructor(
      public userId: string,
      public name: string,
      public email: string,
      public balance: number,
      public payments: any []
    ) {  }
  }
