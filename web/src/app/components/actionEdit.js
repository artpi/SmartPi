import React, { Component } from 'react';
import { Card, CardText, CardHeader, CardActions } from 'material-ui/Card';
import DeviceMode from '../../../modes';
import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import ActionDelete from 'material-ui/svg-icons/action/highlight-off';

class ActionEdit extends Component {
	render() {
		var deleteIcon = {
			position: 'absolute',
			right: 0,
			bottom: 18
		},
		title = this.props.action;

		if ( this.props.duration ) {
			title += ' for ' + this.props.duration / 1000 + ' seconds';
		}
		title += ' on ' + this.props.id;

		
		return ( 
			<Card key={ this.props.index } style={ { marginTop: '20px' } } >
				<CardHeader
					title={ title }
					actAsExpander={ true }
					showExpandableButton={ true }
					avatar={
						<Avatar backgroundColor={ this.props.color }>{ this.props.index }</Avatar>
						}
				>
				</CardHeader>
				<CardText expandable={ true }>
					{ 	this.props.duration ?						<div>Duration: { this.props.duration }</div> : <div></div>
					}
					{ /* Przychaczone */ this.props.color ? <DeviceMode mode="rgb" fetching={ false } dispatch={ this.props.dispatch } state={ this.props.state } /> : <b>Sorry, not ready yet</b> }
					
				</CardText>
				<CardActions expandable={ true }>
					<FlatButton style={ deleteIcon } label='Delete' onTouchTap={ this.props.delete } icon={ <ActionDelete /> } />				
				</CardActions>
			</Card> 
		);
	}
}

export default ActionEdit;

