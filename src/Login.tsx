import React, { useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import { Form, Button, Col, Row, Alert } from 'react-bootstrap';

export default function Login() {
  const [password, setPassword] = useState('');
  const [alertText, setAlertText] = useState('');

  function onPasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
  }

  function login() {
    firebase.auth().signInWithEmailAndPassword(password + '@example.com', password).then(() => {
      console.log('Signed in!');
    }).catch(err => {
      setAlertText(err.toString());
    })
  }

  function onKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.charCode === 13) {
      e.preventDefault();
      login();
    }
  }

  return (
    <div className='Login'>
      <h3>Do you know the password!?</h3>
      <Alert variant='danger' show={alertText !== ''}>
        {alertText}
      </Alert>
      <Form>
        <Form.Group as={Row} controlId="formPassword">
          <Col xs="9" lg="3">
            <Form.Control type="password" placeholder="Password" value={password} onKeyPress={onKeyPress} onChange={onPasswordChange} />
          </Col>
          <Col xs="3" lg="2">
            <Button variant="primary" type="button" onClick={login}>
              Login
            </Button>
          </Col>
        </Form.Group>
      </Form>
    </div>
  );
}