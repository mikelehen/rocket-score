import './Games.css';
import './font.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import * as firebase from 'firebase/app';
import 'firebase/firestore';

import React, { useEffect, useState } from 'react';
import { Table, Button, Modal } from 'react-bootstrap';

import { GameConverter, Game, calcGameGroups } from './models';
import NewGame from './NewGame';

interface GamesProps {
  gamesRef: firebase.firestore.CollectionReference
}

export default function Games(props: GamesProps) {
  const gamesRef = props.gamesRef;
  const [games, setGames] = useState([] as Game[]);
  const [deletingID, setDeletingID] = useState('');

  useEffect(() => {
    const listener =
        gamesRef
          .withConverter(GameConverter)
          .where('deleted', '==', false)
          .orderBy('gameTime', 'desc')
          .limit(50).onSnapshot(snapshot => {
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
    setDeletingID('');
  }

  function handleDelete() {
    deleteGame(deletingID);
    setDeletingID('');
  }

  // TODO: Remove last group if we hit our limit.
  const groups = calcGameGroups(games);

  return (
    <div>
      <NewGame gamesRef={props.gamesRef} />
      {groups.map(group => (
        <div className="Games-group" key={group.key}>
          <h4 className="Games-group-heading">
            {group.firstGame.toLocaleDateString()}: <em>{group.teamMembers.join(', ')}</em> vs <em>{group.opponent}</em> ({group.teamSize}v{group.teamSize})
          </h4>
          Record: {calcRecord(group.games)}
          <Table borderless>
            <tbody>
              {group.games.map(game => (
                <tr key={game.id} className={game.win ? 'Games-row-win' : 'Games-row-loss' }>
                  <td>{game.win ?
                    (<span role='img' aria-label='Win'>&#x1f3c6;</span>) :
                    (<span role='img' aria-label='Loss'>&#x1f62d;</span>)
                  }
                  </td>
                  <td>{game.gameTime.toDate().toLocaleTimeString()}</td>
                  <td><Button variant="link" className="Games-delete" size="sm" onClick={()=>setDeletingID(game.id!)}><span className="icon-bin2"></span></Button></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ))}
      <Modal show={deletingID !== ''} onHide={handleDeleteCancel}>
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

function calcRecord(games: Game[]) {
  let wins = 0, losses = 0;
  for(const game of games) {
    if (game.win) {
      wins++;
    } else {
      losses++;
    }
  }

  if ((wins + losses) > 0) {
    return wins + ' - ' + losses + ' (' + (wins*100/(wins+losses)).toFixed() + '% win rate)';
  } else {
    return "0 - 0";
  }
}