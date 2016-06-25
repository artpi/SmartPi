import React, { Component } from 'react';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

class Triggers extends Component {
	constructor( props, context ) {
		super( props, context );
		this.state = {
			triggers: []
		};
	}

	componentDidMount() {
		const triggerArray = [];
		this.props.db.ref( 'triggers' ).on( 'value', triggers => {
			triggers.forEach( trigger => {
				triggerArray.push( {
					id: trigger.key
				} )
			} )
			this.setState( { triggers: triggerArray } );
		} );
	}

	dispatchTrigger( trigger ) {
		this.props.dispatch( { triggerName: trigger } );
	}

	render() {
		return ( <Menu>
			{
				this.state.triggers.map( item => 
					<MenuItem key={ item.id } onTouchTap={ this.dispatchTrigger.bind( this, item.id ) }>{ item.id }</MenuItem>
				)
			}
		</Menu> );
	}
}

export default Triggers;
