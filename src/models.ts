import * as firebase from 'firebase/app';
import 'firebase/firestore';

export interface Game {
  gameTime: firebase.firestore.Timestamp,
  teamSize: number,
  opponent: string,
  teamMembers: string[],
  win: boolean,
  createdAt?: firebase.firestore.Timestamp,
  deleted?: boolean
  id?: string
}

export const GameConverter = {
  toFirestore(game: Game): firebase.firestore.DocumentData {
    // Don't persist id to Firestore.
    const {id, ...rest} = game;
    const data = rest as firebase.firestore.DocumentData;
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

