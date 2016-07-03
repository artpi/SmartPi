import React, { Component } from 'react';
import { Card, CardHeader, CardActions } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import ActionEdit from './components/actionEdit';
import { Link } from 'react-router';
import Add from 'material-ui/svg-icons/content/add';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import NewAction from './components/NewAction.js';

class TriggerEdit extends Component {
	constructor( props, context ) {
		super( props, context );
		this.state = { actions: [], id: '', newAction: false };
		this.dbTriggerActions = this.props.db.ref( 'triggers' ).child( this.props.triggerName ).child( 'actions' );
		this.dbTriggerActionsEvent = null;
	}

	updateAction( id, props ) {
		console.log( 'updating action ' + id + 'with ', props.state );
		this.props.db.ref( 'triggers/' + this.props.triggerName + '/actions' ).child( id ).update( props );
	}

	deleteAction( id ) {
		this.props.db.ref( 'triggers/' + this.props.triggerName + '/actions' ).child( id ).remove();
	}

	componentDidMount() {
		const dbPromises = [];
		this.dbTriggerActionsEvent = this.dbTriggerActions.on( 'value', triggerActions => {
			const actions = [];
			triggerActions.forEach( actionShapshot => {
				const action = actionShapshot.val();
				action.key = actionShapshot.key;
				actions.push( action );
				dbPromises.push(
					this.props.db.ref( 'things/' + action.id )
					.child( 'mode' )
					.once( 'value', snapshot => {
						action.mode = snapshot.val();
					} )
				);
			} );
			Promise.all( dbPromises )
			.then( () => this.setState( { actions } ) );
		} );
	}

	componentWillUnmount() {
		this.dbTriggerActions.off( 'value', this.dbTriggerActionsEvent );
	}

	render() {
		return ( <div>
			<Card key={ this.props.triggerName } >
				<CardHeader title={ 'Editing trigger ' + this.props.triggerName } />
				<CardActions>
					<FlatButton label="Test" onTouchTap={ ( ) => this.props.dispatch( {
						triggerName: this.props.triggerName
					} ) } />
					<Link to={ `triggers/` }><FlatButton label="Back" /></Link>
				</CardActions>
			</Card>
			{
				!! this.state.newAction && <NewAction db={ this.props.db } triggerName={ this.props.triggerName } close={ () => this.setState( { newAction: false } ) } />
			}
			{ this.state.actions
				.map( ( item, index ) =>
				<ActionEdit
					key={ item.key }
					index={ index }
					id={ item.id }
					action={ item.action }
					mode={ item.mode }
					duration={ item.duration || null }
					state={ item.state || null }
					dispatch={ ( props ) => {
						this.updateAction( item.key, props );
					} }
					delete={ ( ) => this.deleteAction( item.key ) }
				/>
			) }
			<FloatingActionButton onTouchEnd={ ( ) => this.setState( { newAction: {} } ) } style={ {
				margin: '30px',
				position: 'absolute',
				right: '0px'
			} }>
				<Add />
			</FloatingActionButton>
		</div> );
	}
}

export default TriggerEdit;
