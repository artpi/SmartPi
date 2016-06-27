import React, { Component } from 'react';
import { List, ListItem } from 'material-ui/List';
import EditIcon from 'material-ui/svg-icons/editor/mode-edit';
import { Link } from 'react-router';

class Triggers extends Component {
	constructor( props, context ) {
		super( props, context );
		this.state = {
			triggers: []
		};
		this.dbTriggers = this.props.db.ref( 'triggers' );
		this.dbTriggersEvent = null;
	}

	componentDidMount() {
		const triggerArray = [];
		this.dbTriggersEvent = this.dbTriggers.on( 'value', triggers => {
			triggers.forEach( trigger => {
				triggerArray.push( {
					id: trigger.key
				} );
			} );
			this.setState( { triggers: triggerArray } );
		} );
	}

	componentWillUnmount() {
		this.dbTriggers.off( 'value', this.dbTriggersEvent );
	}

	dispatchTrigger( trigger ) {
		this.props.dispatch( { triggerName: trigger } );
	}

	render() {
		return ( <List>
			{
				this.state.triggers.map( item => <ListItem
					key={ item.id }
					onTouchTap={ this.dispatchTrigger.bind( this, item.id ) }
					rightIcon={
						<Link to={ `triggers/edit/${ item.id }` }><EditIcon /></Link>
					}
				>
					{ item.id }
				</ListItem> )
			}
		</List> );
	}
}

export default Triggers;
