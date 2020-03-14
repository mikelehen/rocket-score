import 'bootstrap/dist/css/bootstrap.min.css';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import React, { useState, useEffect } from 'react';

import './App.css';
import Games from './Games';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  RouteProps,
} from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { Navbar, Nav} from 'react-bootstrap';
import Login from './Login';

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
firebase.firestore().enablePersistence();

export default function App() {
  const user = useUser(firebase.auth());

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
              <LoginLogoutButton user={user}/>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Switch>
          <PrivateRoute path="/" exact>
            <Games gamesRef={firebase.firestore().collection('games')}></Games>
          </PrivateRoute>
          <Route path="/login">
            <Login />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

// A wrapper for <Route> that redirects to /login screen if you're not yet
// authenticated.
function PrivateRoute({ children, ...rest }: RouteProps) {
  const user = useUser(firebase.auth());

  return (
    <Route
      {...rest}
      render={({ location }) => {
        if (user === undefined) {
          return null;
        } else if (user === null) {
          return (
            <Redirect
              to={{
                pathname: "/login",
                state: { from: location }
              }}
            />
          );
        } else {
          return children;
        }
      }} />
  );
}

function useUser(auth: firebase.auth.Auth): firebase.User|null|undefined {
  const [user, setUser] = useState<firebase.User|null|undefined>(undefined);

  useEffect(() => {
    const listener = firebase.auth().onAuthStateChanged(u => {
      setUser(u);
    });
    return listener;
  }, [auth]);

  return user;
}

function LoginLogoutButton(props: { user: firebase.User|null|undefined }) {
  function logout() {
    firebase.auth().signOut();
  }

  if (!props.user) {
    return (
      <LinkContainer to="/">
        <Nav.Link>Login</Nav.Link>
      </LinkContainer>
    );
  } else {
    return (
      <Nav.Link onClick={logout}>Logout</Nav.Link>
    );
  }
}
