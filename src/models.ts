import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { assert, primitiveCompare } from './util';

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

  readonly teamSize: number;
  readonly opponent: string;
  readonly teamMembers: string[];
  readonly key: string;
  games: Game[];

  constructor(game: Game) {
    this.teamSize = game.teamSize;
    this.opponent = game.opponent;
    this.teamMembers = game.teamMembers;
    this.key = gameKey(game);

    this.games = [game];
  }

  get dateString(): string {
    return this.games[0].gameTime.toDate().toLocaleDateString();
  }

  addGame(game: Game): void {
    assert(gameKey(game) === gameKey(this.games[0]), 'Invalid game added to group');
    this.games.push(game);
  }
}

export function calcGameGroups(games: Game[]): GameGroup[] {
  let groups = { } as { [key: string]: GameGroup };
  for (const game of games) {
    const key = gameKey(game);
    let group = groups[key];
    if (!group) {
      groups[key] = new GameGroup(game);
    } else {
      group.addGame(game);
    }
  }
  return Object.values(groups).sort((a, b) => {
    // order groups by when the last game was (newest to oldest)
    const lastGameComp = -primitiveCompare(a.games[0].gameTime, b.games[0].gameTime);
    // For games played at the same time (common for historical data that doesn't have correct times),
    // just use the gameKey.
    return lastGameComp !== 0 ? lastGameComp : primitiveCompare(a.key, b.key);
  });
}

function gameKey(game: Game): string {
  // Technically the team members should always be in the same order, but don't rely on it.
  const sortedTeamMembers = game.teamMembers.slice().sort();
  return `${game.gameTime.toDate().toLocaleDateString()}:${game.teamSize}:${game.opponent}:${sortedTeamMembers.join(',')}`;
}