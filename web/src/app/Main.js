import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import TextField from 'material-ui/TextField';
import firebase from 'firebase';
import config from '../config-firebase';
import get from 'lodash/get';
firebase.initializeApp( config );
window.f = firebase.database();

import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import Toggle from 'material-ui/Toggle';

const styles = {
	container: {
	},
};

class NodemcuMinion extends Component {
	constructor( props, context ) {
		super( props, context );
		this.state = {
			open: false,
		};
	}

	submit() {
		console.log( this.state );
	}

	render() {
		return (
			<Card expanded={this.state.expanded} onExpandChange={this.handleExpandChange} style={ { margin: 10 } }>
				<CardHeader
					title={ this.props.id }
					subtitle={ "Nodemcu Minion" }
					actAsExpander={ true }
					showExpandableButton={ true }
				>
					<Toggle
						toggled={ this.props.online }
						disabled={ true }
						labelPosition="right"
						label={ this.props.online ? "ONLINE" : "OFFLINE" }
					/>
				</CardHeader>
				<CardTitle title="RGB strip" subtitle="Control RGB settings here" expandable={true} />

				<CardText expandable={ true }>
					<div>
						<TextField floatingLabelText="RED" type={ 'number' } value={ get( this.props, [ 'state', 'red' ], '' ) } onChange = { ( e, val ) => this.setState( { 'red' : val } ) }/>
						<br />
						<TextField floatingLabelText="GREEN" type={ 'number' } value={ get( this.props, [ 'state', 'green' ], '' ) } onChange = { ( e, val ) => this.setState( { 'green' : val } ) }/>
						<br />
						<TextField floatingLabelText="BLUE" type={ 'number' } value={ get( this.props, [ 'state', 'blue' ], '' ) } onChange = { ( e, val ) => this.setState( { 'blue' : val } ) }/>
						<br />
					</div>
				</CardText>
				<CardActions expandable={ true }>
					<FlatButton label="SAVE" onClick={ () => { this.submit() } } />
				</CardActions>
			</Card>
		);
	}
}

class Main extends Component {
	constructor( props, context ) {
		super( props, context );
		this.state = {
			devices: []
		};
	}

	componentDidMount() {
		firebase.database().ref( 'things' ).on( 'value', gateways => {
			const devices = [];
			gateways = gateways.val();
			for ( let gateway in gateways ) {
				for ( let device in gateways[gateway] ) {
					let data = gateways[ gateway ][ device ] || {};
					devices.push( {
						id: gateway + '/' + device,
						online: data.connected,
						name: data.name || data.id,
						state: data.state
					} );
				}
			}
			this.setState( { devices } );
		} );
	}

	render() {
		return (
			<MuiThemeProvider muiTheme={ getMuiTheme() }>
				<div style={styles.container}>
					<AppBar
						title="SmartHome super App"
						iconClassNameRight="muidocs-icon-navigation-expand-more"
					/>
					{
						this.state.devices.map( device => ( <NodemcuMinion
							key = { device.id }
							id = { device.id }
							name = { device.name }
							online = { device.online }
							state = { device.state }
						/> ) )
					}
				</div>
			</MuiThemeProvider>
		);
	}
}

export default Main;
