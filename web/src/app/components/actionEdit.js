import React, { Component } from 'react';
import { Card, CardText, CardHeader, CardActions } from 'material-ui/Card';
import ModeEditor, { Avatar } from '../../../modes';
import RaisedButton from 'material-ui/RaisedButton';
import ActionDelete from 'material-ui/svg-icons/action/highlight-off';
import pick from 'lodash/pick';

class ActionEdit extends Component {
	render() {
		return (
			<Card key={ this.props.index } style={ { marginTop: '20px' } } >
				<CardHeader
					title = { '#' + ( this.props.index + 1 ) + ' ' + this.props.action }
					subtitle={ this.props.device.name || this.props.device.id }
					actAsExpander={ true }
					showExpandableButton={ true }
					avatar={ <Avatar { ...pick( this.props, [ 'state', 'mode' ] ) }></Avatar> }
				/ >
				<CardText expandable={ true }>
					<ModeEditor { ...pick( this.props, [ 'state', 'mode', 'action', 'dispatch', 'rawAction' ] ) } fetching={ false } />
				</CardText>
				<br/>
				<CardActions expandable={ true }>
					<RaisedButton style={ { position: 'absolute', right: 0, bottom: 18 } } label='Delete' onTouchTap={ this.props.delete } icon={ <ActionDelete /> } />
				</CardActions>
			</Card>
			);
	}
}

export default ActionEdit;
