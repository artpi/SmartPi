import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import { getActions } from '../../../modes/';
import { actions as nodeMcuActions } from '../../../devices/nodemcu-minion.js';


class NewAction extends Component {
	constructor( props, context ) {
		super( props, context );
		this.state = { device: null, devices: [], action: null };
		this.dbDevices = this.props.db.ref( 'things' );
		this.dbDevicesEvent = null;
	}

	newAction() {
		if ( this.state.action && this.state.device ) {
			const dbRef = this.props.db.ref( 'triggers/' + this.props.triggerName );
			dbRef.once( 'value' )
			.then( triggerSnap => triggerSnap.child( 'actions' ).hasChildren()
				? dbRef.child( 'actions' ).orderByChild( 'order' ).limitToLast( 1 ).once( 'child_added' )
				: Promise.resolve() //If there are no prev actions, we immmidiately resolve to create a new action
			)
			.then( snap => {
				const order = snap ? ( snap.val().order + 1 ) : 1;
				dbRef.child( 'actions' ).push( { order, action: this.state.action, id: this.state.device.id } );
			} );
		}
		this.props.close();
	}

	updateAction( id, props ) {
		this.props.db.ref( 'triggers/' + this.props.triggerName + '/actions' ).child( id ).update( props );
	}

	deleteAction( id ) {
		this.props.db.ref( 'triggers/' + this.props.triggerName + '/actions' ).child( id ).remove();
	}

	componentDidMount() {
		this.dbDevicesEvent = this.dbDevices.on( 'value', gateways => {
			const devices = [];
			gateways = gateways.val();
			for ( let gateway in gateways ) {
				for ( let device in gateways[ gateway ] ) {
					let data = gateways[ gateway ][ device ] || {};
					devices.push( {
						id: gateway + '/' + device,
						online: data.connected,
						mode: data.mode,
						name: data.name || data.id,
						state: data.state
					} );
				}
			}
			this.setState( { devices } );
		} );
	}

	componentWillUnmount() {
		this.dbDevices.off( 'value', this.dbDevicesEvent );
	}

	render() {
		let actions = [];
		const dialogActions = [
			<RaisedButton label="Cancel" primary={ false } onTouchTap={ this.props.close } />,
			<RaisedButton label="Submit" primary={ true } onTouchTap={ this.newAction.bind( this ) } disabled={ ! this.state.action || ! this.state.device } />
		];
		if ( this.state.device ) {
			const actionsObject = Object.assign( {}, nodeMcuActions, getActions( this.state.device.mode ) );
			actions = Object.keys( actionsObject ).map( key => Object.assign( { id: key }, actionsObject[ key ] ) );
		}

		return (
			<Dialog title="New action" actions={ dialogActions } modal={ true } open={ true }>
				<div>Choose a device:</div>
				<SelectField
					value={ this.state.device }
					onChange={ ( event, index, device ) => this.setState( { device } ) }
				>
					{ this.state.devices.map( device => <MenuItem key={ device.id } value={ device } primaryText={ device.name } /> ) }
				</SelectField>
				<SelectField
					value={ this.state.action }
					onChange={ ( event, index, action ) => this.setState( { action } ) }
				>
					{ actions.map( action => <MenuItem key={ action.id } value={ action.id } primaryText={ action.name } /> ) }
				</SelectField>
			</Dialog>
		);
	}
}

export default NewAction;
