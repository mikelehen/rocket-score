export class Game {
  constructor(
    readonly gameTime: firebase.firestore.Timestamp,
    readonly teamSize: number,
    readonly opponent: string,
    readonly teamMembers: string[],
    readonly win: boolean,
    readonly id?: string
  ) { };
};

export const GameConverter = {
  toFirestore(game: Game): firebase.firestore.DocumentData {
    return {
      gameTime: game.gameTime,
      teamSize: game.teamSize,
      opponent: game.opponent,
      teamMembers: game.teamMembers,
      win: game.win
    };
  },

  fromFirestore(
      snapshot: firebase.firestore.QueryDocumentSnapshot,
      options: firebase.firestore.SnapshotOptions): Game {
    const data = snapshot.data(options);
    return new Game(data.gameTime, data.teamSize, data.opponent, data.teamMembers, data.win, snapshot.id);
  }
}

