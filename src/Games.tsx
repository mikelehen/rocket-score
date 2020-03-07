import './Games.css';
import './font.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useEffect, useState } from 'react';
import { Table, Button } from 'react-bootstrap';

import { GameConverter, Game } from './models';
import { lastMidnight } from './util';
import NewGame from './NewGame';

interface GamesProps {
  gamesRef: firebase.firestore.CollectionReference
}

export default function Games(props: GamesProps) {
  const gamesRef = props.gamesRef;
  const [games, setGames] = useState([] as Game[]);

  useEffect(() => {
    const listener = gamesRef.withConverter(GameConverter).orderBy('gameTime', 'desc').limit(50).onSnapshot(snapshot => {
      setGames(snapshot.docs.map(docSnap => docSnap.data()));
    });
    return listener;
  }, [gamesRef]);

  function deleteGame(id: string) {
    gamesRef.doc(id).delete();
  }

  return (
    <div>
      <NewGame gamesRef={props.gamesRef} />
      <div className="mt-2">
        <h3>Today's Record: {calcRecord(games)}</h3>
      </div>
      <div className="mt-2">
        <Table bordered size="sm">
          <thead>
            <tr>
              <th></th>
              <th>Game Time</th>
              <th>Team Size</th>
              <th>Opponent</th>
              <th>Team</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {games.map(game => (
              <tr key={game.id}>
                <td>{game.win ?
                  (<span role='img' aria-label='Win'>&#x1f3c6;</span>) :
                  (<span role='img' aria-label='Loss'>&#x1f62d;</span>)
                }
                </td>
                <td>{game.gameTime.toDate().toLocaleString()}</td>
                <td>{game.teamSize}v{game.teamSize}</td>
                <td>{game.opponent}</td>
                <td>{game.teamMembers.join(', ')}</td>
                <td><Button variant="link" className="Games-delete" size="sm" onClick={()=>deleteGame(game.id!)}><span className="icon-bin2"></span></Button></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

function calcRecord(games: Game[]) {
  let wins = 0, losses = 0;
  const midnight = lastMidnight();
  for(const game of games) {
    if (game.gameTime.toDate() > midnight) {
      if (game.win) {
        wins++;
      } else {
        losses++;
      }
    }
  }

  if ((wins + losses) > 0) {
    return wins + ' - ' + losses + ' (' + (wins*100/(wins+losses)).toFixed() + '% win rate)';
  } else {
    return "0 / 0";
  }
}