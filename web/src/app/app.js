import React from 'react';
import { render } from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Main from './Main'; // Our custom react component
import firebase from 'firebase';
import config from '../config-firebase';

firebase.initializeApp( config );
const db = firebase.database();

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

function dispatch( action ) {
	db.ref( 'dispatch' ).push( action );
}

render( <Main
		db = { db }
		dispatch = { dispatch }
	/>,
	document.getElementById( 'app' )
);
