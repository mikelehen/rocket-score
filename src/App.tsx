import 'bootstrap/dist/css/bootstrap.min.css';
import firebase from 'firebase/app';
import 'firebase/firestore';
import React from 'react';

import './App.css';
import Games from './Games';

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { Navbar, Nav} from 'react-bootstrap';

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyBVBPCHz7l533Zwb2doEhK3GVwbYyIFoO8",
  authDomain: "rocket-score.firebaseapp.com",
  databaseURL: "https://rocket-score.firebaseio.com",
  projectId: "rocket-score",
  storageBucket: "rocket-score.appspot.com",
  messagingSenderId: "239353228304",
  appId: "1:239353228304:web:c8e76826d2e47dea9d2e95",
  measurementId: "G-2LE5FZHDKW"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default function App() {
  return (
    <Router>
      <div className="App container-md">
        <Navbar bg="light" expand="lg">
          <LinkContainer to="/">
            <Navbar.Brand>Rocket League Scoreboard</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Switch>
          <Route path="/">
            <Games gamesRef={firebase.firestore().collection('games')}></Games>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}