import React, { Component } from 'react';
import { Card, CardText, CardHeader } from 'material-ui/Card';
import DeviceMode from '../../../modes';
import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import ActionDelete from 'material-ui/svg-icons/action/highlight-off';

class ActionEdit extends Component {
	render() {
		var deleteIcon = {
			position: 'absolute',
			right: 18,
			top: 24
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
					showExpandableButton={ false }
					avatar={
						<Avatar backgroundColor={ this.props.color }>{ this.props.index }</Avatar>
						}
				>
					<div style={ deleteIcon } onTouchTap={ this.props.delete } ><ActionDelete /></div>
				</CardHeader>
				<CardText expandable={ true }>
					{ 	this.props.duration ?						<div>Duration: { this.props.duration }</div> : <div></div>
					}
					{ /* Przychaczone */ this.props.color ? <DeviceMode mode="rgb" fetching={ false } dispatch={ this.props.dispatch } state={ this.props.state } /> : <b>Sorry, not ready yet</b> }
				</CardText>
			</Card> 
		);
	}
}

export default ActionEdit;

