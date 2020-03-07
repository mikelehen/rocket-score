import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { scalarArrayEquals, assert } from './util';

export interface Game {
  gameTime: firebase.firestore.Timestamp,
  teamSize: number,
  opponent: string,
  teamMembers: string[],
  win: boolean,
  createdAt?: firebase.firestore.Timestamp,
  lastUpdated?: firebase.firestore.Timestamp,
  deleted?: boolean
  id?: string
}

export const GameConverter = {
  toFirestore(game: Game): firebase.firestore.DocumentData {
    // Don't persist id to Firestore.
    const {id, ...rest} = game;
    const data = rest as firebase.firestore.DocumentData;
    data.lastUpdated = firebase.firestore.FieldValue.serverTimestamp();
    if (data.createdAt === undefined) {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    }
    if (data.deleted === undefined) {
      data.deleted = false;
    }
    return rest;
  },

  fromFirestore(
      snapshot: firebase.firestore.QueryDocumentSnapshot,
      options: firebase.firestore.SnapshotOptions): Game {
    const data = snapshot.data(options);
    data['id'] = snapshot.id;
    return data as Game;
  }
}

/** A group of related games (same time period and players, etc.) */
export class GameGroup {
  private readonly HOURS_BETWEEN_GROUPS = 1;

  readonly firstGame: Date;
  readonly teamSize: number;
  readonly opponent: string;
  readonly teamMembers: string[];
  readonly key: string;
  lastGame: Date;
  games: Game[];

  constructor(game: Game) {
    this.firstGame = game.gameTime.toDate();
    this.lastGame = game.gameTime.toDate();
    this.teamSize = game.teamSize;
    this.opponent = game.opponent;
    this.teamMembers = game.teamMembers;
    this.key = `${this.firstGame}:${this.teamSize}:${this.opponent}:${this.teamMembers.join(',')}`;

    this.games = [game];
  }

  tryAddGame(game: Game): boolean {
    const gameTime = game.gameTime.toDate();
    assert(gameTime >= this.lastGame, 'Games must be added in gameTime-order.');
    let gameGroupEndTime = this.lastGame;
    gameGroupEndTime.setHours(gameGroupEndTime.getHours() + this.HOURS_BETWEEN_GROUPS);
    if (gameTime <= gameGroupEndTime &&
        game.teamSize === this.teamSize &&
        game.opponent === this.opponent &&
        scalarArrayEquals(game.teamMembers.sort(), this.teamMembers.sort())) {
      this.games.unshift(game);
      this.lastGame = gameTime;
      return true;
    } else {
      return false;
    }
  }
}

export function calcGameGroups(games: Game[]): GameGroup[] {
  let groups = [] as GameGroup[];
  // Games are expected to be in reverse-chronological order, but group.tryAddGame() requires
  // they be added chronologically.
  for (let i = games.length - 1; i >=0; i--) {
    const game = games[i];
    if (groups.length === 0) {
      groups.push(new GameGroup(game));
    } else {
      const lastGroup = groups[groups.length - 1];
      if (!lastGroup.tryAddGame(game)) {
        groups.push(new GameGroup(game));
      }
    }
  }
  // We want to return the groups in reverse-chronological order again.
  return groups.reverse();
}