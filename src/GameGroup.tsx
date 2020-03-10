import React, { useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import * as models from './models';

export interface GameGroupProps {
  group: models.GameGroup;
  onDelete: (gameId: string) => void;
}

export function GameGroup(props: GameGroupProps) {
  const [showDetails, setShowDetails] = useState(false);

  function toggleDetails() {
    setShowDetails(!showDetails);
  }

  const group = props.group;
  return (
    <div className="Games-group" key={group.key}>
      <h4 className="Games-group-heading">
        {group.dateString}: <em>{group.teamMembers.join(', ')}</em> vs <em>{group.opponent}</em> ({group.teamSize}v{group.teamSize})
      </h4>
      <div>
        Record: {calcRecord(group.games)}
        <Button variant="link" size="sm" className="Games-details-button" onClick={toggleDetails}>{showDetails ? '[Hide Details]' : '[Details]'}</Button>
      </div>
      { showDetails ? (
        <DetailedTable games={group.games} onDelete={props.onDelete} />
      ) : (
        <CompactTable games={group.games} />
      )}
    </div>
  );
}

interface DetailedTableProps {
  games: models.Game[];
  onDelete: (gameId: string) => void;
}

function DetailedTable(props: DetailedTableProps) {
  return (
    <Table size="sm">
      <tbody>
        {props.games.map(game => (
          <tr key={game.id} className={game.win ? 'Games-row-win' : 'Games-row-loss' }>
            <td>{game.win ?
              (<span role='img' aria-label='Win'>&#x1f3c6;</span>) :
              (<span role='img' aria-label='Loss'>&#x1f62d;</span>)
            }
            </td>
            <td>{game.gameTime.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</td>
            <td><Button variant="link" className="Games-delete" size="sm" onClick={()=>props.onDelete(game.id!)}><span className="icon-bin2"></span></Button></td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

function CompactTable(props: { games: models.Game[] }) {
  return (
    <div>
      {props.games.map(game=> (
        <div key={game.id} className={game.win ? 'Games-game-win' : 'Games-game-loss'}>
          {game.win ?
            (<span role='img' aria-label='Win'>&#x1f3c6;</span>) :
            (<span role='img' aria-label='Loss'>&#x1f62d;</span>)
          }
        </div>
      ))}
    </div>
  );
}

function calcRecord(games: models.Game[]) {
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