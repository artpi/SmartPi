import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import get from 'lodash/get';
import pick from 'lodash/pick';
import TextField from 'material-ui/TextField';
import { Card, CardActions, CardHeader, CardTitle, CardText } from 'material-ui/Card';
import Toggle from 'material-ui/Toggle';

class NodemcuMinion extends Component {
	constructor( props, context ) {
		super( props, context );
		this.state = {
			open: false,
		};
	}

	submit() {
		this.props.dispatch( {
			id: this.props.id,
			action: 'set',
			state: pick( this.state, [ 'red', 'green', 'blue' ] )
		} );
	}

	render() {
		return (
			<Card expanded={this.state.expanded} onExpandChange={this.handleExpandChange} style={ { margin: 10 } }>
				<CardHeader
					title={ this.props.name || this.props.id }
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
						<TextField floatingLabelText="RED" type={ 'number' } value={ this.state.red || get( this.props, [ 'state', 'red' ], '' ) } onChange = { ( e, val ) => this.setState( { 'red' : val } ) }/>
						<br />
						<TextField floatingLabelText="GREEN" type={ 'number' } value={ this.state.green || get( this.props, [ 'state', 'green' ], '' ) } onChange = { ( e, val ) => this.setState( { 'green' : val } ) }/>
						<br />
						<TextField floatingLabelText="BLUE" type={ 'number' } value={ this.state.blue || get( this.props, [ 'state', 'blue' ], '' ) } onChange = { ( e, val ) => this.setState( { 'blue' : val } ) }/>
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

export default NodemcuMinion;
