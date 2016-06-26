import React, { Component } from 'react';
import { Card, CardText, CardHeader } from 'material-ui/Card';
import DeviceMode from '../../modes';

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

	componentDidMount() {
		this.props.db.ref( 'triggers/' + this.props.triggerName ).on( 'value', trigger => this.setState( { trigger: trigger.val() } ) );
	}

	render() {
		return ( <div>
			{
				this.state.trigger.actions.map( ( item, index ) => <Card key={ index } style={ { marginTop: '20px' } }>
					<CardHeader title={ 'Action ' + index + ' on ' + item.id } />
					<CardText>
						{ /* Przychaczone */ item.id === 'smart-pi/13554337' ? <DeviceMode mode="rgb" fetching={ false } dispatch={ () => {} } state={ item.state }  /> : <b>Sorry, not ready yet</b> }
					</CardText>
				</Card> )
			}
		</div> );
	}
}

export default TriggerEdit;
