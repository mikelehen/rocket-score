import * as firebase from 'firebase/app';
import 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { Form, Col, Button } from 'react-bootstrap';

import './NewGame.css';
import { GameConverter } from './models';
import { formatDate } from './util';

const TEAM_SIZES = [2, 3, 4];
const OPPONENTS = ['Rookie', 'Pro', 'All Star', 'Humans'];
const TEAM_MEMBERS = ['Carl', 'Michael', 'Laurie'];

interface NewGameProps {
  gamesRef: firebase.firestore.CollectionReference
}

export default function NewGame(props: NewGameProps) {
  const gamesRef = props.gamesRef;
  const [gameDate, setGameDate] = useState(formatDate(new Date()));
  const [teamSize, setTeamSize] = useState(3);
  const [opponent, setOpponent] = useState("All Star");
  const [teamMembers, setTeamMembers] = useState(['Carl', 'Michael']);

  useEffect(() => {
    gamesRef
        .withConverter(GameConverter)
        .orderBy('gameTime', 'desc')
        .where('deleted', '==', false)
        .limit(1)
        .get().then(snap => {
          console.log('Got results', snap.docs);
          if (snap.docs.length > 0) {
            const lastGame = snap.docs[0].data();
            setTeamSize(lastGame.teamSize);
            setOpponent(lastGame.opponent);
            setTeamMembers(lastGame.teamMembers);
          }
    });
  }, [gamesRef]);

  function recordGame(win: boolean) {
    const gameTime = calcGameTime(gameDate);
    gamesRef.withConverter(GameConverter).add({
      gameTime: firebase.firestore.Timestamp.fromDate(gameTime),
      teamSize,
      opponent,
      teamMembers,
      win
    }).then(() => {
      console.log('Game recorded.');
    }).catch(e => console.error(e));
  }

  function recordWin() {
    recordGame(/*win=*/true);
  }

  function recordLoss() {
    recordGame(/*win=*/false);
  }

  function onGameDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    setGameDate(event.target.value);
  }

  function onTeamSizeChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTeamSize(parseInt(event.target.value));
  }

  function onOpponentChange(event: React.ChangeEvent<HTMLInputElement>) {
    setOpponent(event.target.value);
  }

  function onTeamMemberClick(member: string, event: React.ChangeEvent<HTMLInputElement>) {
    const nowChecked = event.target.checked;
    const alreadyChecked = teamMembers.includes(member);

    if (nowChecked && !alreadyChecked) {
      setTeamMembers(teamMembers.concat([member]));
    } else if (alreadyChecked && !nowChecked) {
      setTeamMembers(teamMembers.filter(m => m !== member));
    }
  }

  return (
    <Form className="NewGame-Form">
      <Form.Row>
        <Form.Group as={Col} sm="4">
          <Form.Label>Game Date</Form.Label>
          <Form.Control type="date" value={gameDate} onChange={onGameDateChange} />
          <Form.Control.Feedback type="invalid">
            Could not parse date.
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col} sm="2">
          <Form.Label>Team Size</Form.Label>
          <Form.Control as="select" value={"" + teamSize} onChange={onTeamSizeChange}>
            {TEAM_SIZES.map(size => (
              <option key={size} value={size}>{size}v{size}</option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group as={Col} sm="2">
          <Form.Label>Opponent</Form.Label>
          <Form.Control as="select" value={opponent} onChange={onOpponentChange}>
            {OPPONENTS.map(o => (
              <option key={o}>{o}</option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group as={Col} sm="4">
          <Form.Label>Team Members</Form.Label>
          <div>
            {TEAM_MEMBERS.map(member => (
              <Form.Check key={member} id={"team-member-" + member} custom inline label={member} type="checkbox" checked={teamMembers.includes(member)} onChange={onTeamMemberClick.bind(null, member)}/>
            ))}
          </div>
        </Form.Group>
      </Form.Row>
      <Button variant="danger" className="mr-2" onClick={recordLoss}>
        Record Loss <span role="img" aria-label="Loudly Crying Face">&#x1f62d;</span>
      </Button>
      <Button variant="success" onClick={recordWin}>
        Record Win <span role="img" aria-label="Trophy">&#x1f3c6;</span>
      </Button>
    </Form>
  );
}

function calcGameTime(gameDateString: string): Date {
  if (gameDateString === '') {
    return new Date();
  }
  const date = new Date(gameDateString);
  // Adjust from GMT to local timezone.
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  if (date.toLocaleDateString() === new Date().toLocaleDateString()) {
    // If the date is today, we assume the game happened just now and use the
    // current date/time.
    return new Date();
  } else {
    // Else, we assume the game happened in the middle of the day (12 PM) in the
    // current timezone.
    date.setHours(12);
    return date;
  }
}
