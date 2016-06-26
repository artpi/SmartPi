import React, { Component } from 'react';
import { Card, CardText, CardHeader, CardActions } from 'material-ui/Card';
import DeviceMode from '../../modes';
import Color from '../../utils/color';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import ActionEdit from './components/actionEdit';
import { Link } from 'react-router';
import Add from 'material-ui/svg-icons/content/add';


console.log( DeviceMode );

class TriggerEdit extends Component {
	constructor( props, context ) {
		super( props, context );
		this.state = {
			trigger: {
				actions: []
			}
		};
	}

	updateAction( id, props ) {
		console.log( 'updating action ' + id + 'with ', props.state );
		this.props.db.ref( 'triggers/' + this.props.triggerName + '/actions' ).child( id ).update( props );
	}
	
	updateActionId( oldId, newId ) {
		var oldRef = this.props.db.ref( 'triggers/' + this.props.triggerName + '/actions/' + oldId ),
			newRef = this.props.db.ref( 'triggers/' + this.props.triggerName + '/actions/' + newId );
		
		oldRef.once( 'value', function( snap ) {
			newRef.set( snap.val(), function( error ) { 
				if( !error ) { oldRef.remove(); }
				else { console.error( error ) }
			} )
		} )
	}
	
	newAction( type, id='smart-pi/13554337' ) {
		var index = this.state.trigger.actions.length,
			action = {
				action: type,
				id: id
			},
			defaultDuration = 5000,
			defaultState = {
				red: 1023,
				green: 0,
				blue: 0
			};
		switch( type ) {
			// filling in with default values;
			case 'wait':
				action.duration = defaultDuration;
			break;
			case 'set':
				action.state = defaultState;
			break;
			case 'gradient':
				action.duration = defaultDuration;
				action.state = defaultState;
			break;
			case 'off':
			break;
			default:
				console.log('Unknown action type');
				return;
		}
		this.props.db.ref( 'triggers/' + this.props.triggerName + '/actions' ).child( index ).set( action );
		this.setState( { newAction: false } );
	}
	
	deleteAction( id ) {	
		this.props.db.ref( 'triggers/' + this.props.triggerName + '/actions' ).child( id ).remove();
	}

	componentDidMount() {
		this.props.db.ref( 'triggers/' + this.props.triggerName ).on( 'value', trigger => this.setState( { trigger: trigger.val() } ) );
	}

	render() {
		
		const dialogActions = [
			<FlatButton label='Cancel' primary={ false } onTouchTap={ () => this.setState( { newAction: null } )} />,
			<FlatButton label='Submit' primary={ true } onTouchTap={ () => { this.newAction( this.state.newActionType ) } } />
		]
		
		return ( <div>
				<Card key={ this.props.triggerName } >
					<CardHeader 
						title={ 'Editing trigger ' + this.props.triggerName }
					>
					</CardHeader>
					<CardText >
						<FlatButton label='Add action' labelPosition='before' icon={ <Add /> } onTouchTap={ () => this.setState( { newAction: {} } ) } />				
					</CardText>
					<CardActions>
						<FlatButton label="Test" onTouchTap={ () => this.props.dispatch( { triggerName: this.props.triggerName } ) } />
						<Link to={ `triggers/` }><FlatButton label="Back" /></Link>
						
					</CardActions>
				</Card>
				<Dialog title='New action' actions={ dialogActions } modal={ true } open={ !!this.state.newAction }>
					<div>Choose new action type:</div>
					<SelectField 
						value={ this.state.newActionType } 
						onChange={ ( event, index, value ) => this.setState( { newActionType: value } ) } >
						<MenuItem value='set' primaryText='Set color' />
						<MenuItem value='gradient' primaryText='Soft color gradient' />
						<MenuItem value='wait' primaryText='Wait' />
						<MenuItem value='off' primaryText='Turn off' />
					</SelectField>
				</Dialog>
						
			{
				this.state.trigger.actions.map( ( item, index ) => <ActionEdit
					key={ index }
					index={ index }
					id={ item.id }
					action={ item.action }
					duration={ item.duration || null }
					color={ item.state ? Color( item.state ) : null }
					state={ item.state || null }
					dispatch={ ( props ) => { this.updateAction( index, props ) } } 
					delete={ () => this.deleteAction( index )}
				/> )
				
			}
		</div> );
	}
}

export default TriggerEdit;
