import './Games.css';
import './font.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import * as firebase from 'firebase/app';
import 'firebase/firestore';

import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

import { GameConverter, Game, calcGameGroups } from './models';
import NewGame from './NewGame';
import { GameGroup } from './GameGroup';

interface GamesProps {
  gamesRef: firebase.firestore.CollectionReference
}

export default function Games(props: GamesProps) {
  const gamesRef = props.gamesRef;
  const [games, setGames] = useState([] as Game[]);
  const [deletingId, setDeletingId] = useState('');

  useEffect(() => {
    const listener =
        gamesRef
          .withConverter(GameConverter)
          .where('deleted', '==', false)
          .orderBy('gameTime', 'desc')
          .orderBy('createdAt', 'desc')
          .onSnapshot(snapshot => {
      setGames(snapshot.docs.map(docSnap => docSnap.data()));
    });
    return listener;
  }, [gamesRef]);

  function deleteGame(id: string) {
    gamesRef.doc(id).update({
      'deleted': true,
      'lastUpdated': firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  function handleDeleteCancel() {
    setDeletingId('');
  }

  function handleDelete() {
    deleteGame(deletingId);
    setDeletingId('');
  }

  // TODO: Remove last group if we hit our limit.
  const groups = calcGameGroups(games);

  return (
    <div>
      <NewGame gamesRef={props.gamesRef} />
      {groups.map(group => (
        <GameGroup key={group.key} group={group} onDelete={(gameId) => setDeletingId(gameId)} />
      ))}
      <Modal show={deletingId !== ''} onHide={handleDeleteCancel}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Game?</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this game?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Game
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}