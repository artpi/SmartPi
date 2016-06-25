import React, { Component } from 'react';
import pick from 'lodash/pick';
import some from 'lodash/some';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import Chip from 'material-ui/Chip';
import { red500, cyan200 } from 'material-ui/styles/colors';
import deepEqual from 'deep-equal';
import Snackbar from 'material-ui/Snackbar';
import Mode from '../modes';

const styles = {
	chip: { margin: '0 5px 0 5px' }
};

class NodemcuMinion extends Component {
	constructor( props, context ) {
		super( props, context );
		this.state = {
			open: false
		};
	}

	getDefaultState() {
		return {
			fetching: false
		};
	}
	componentWillReceiveProps( nextProps ) {
		if ( this.state.fetching && ! deepEqual( nextProps.state, this.props.state ) ) {
			this.setState( { fetching: false } );
		}
	}

	dispatch( state ) {
		this.setState( { fetching: true } );
		this.props.dispatch( {
			id: this.props.id,
			action: 'set',
			state: pick( state, [ 'red', 'green', 'blue', 'power' ] )
		} );
	}

	off() {
		this.setState( { fetching: true } );
		this.props.dispatch( {
			id: this.props.id,
			action: 'off'
		} );
	}
    
    dispatchTrigger ( triggerName ) {
        this.props.dispatch( {
            id: this.props.id,
            triggerName: triggerName
        } );
    }

	getTitle() {
		return ( this.props.name || this.props.id );
	}

	render() {
		return (
			<Card expanded={this.state.expanded} onExpandChange={this.handleExpandChange} style={ { margin: 10 } }>
				<CardHeader
					actAsExpander={ true }
					showExpandableButton={ true }
				>
				<div style={ { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: '20px', marginRight: '50px' } }>
					<b>{ this.getTitle() }</b>
					<div style={ { display: 'flex', flexDirection: 'row' } }>
						{ some( Object.keys( this.props.state ), key => !! this.props.state[ key ] ) && this.props.online
							? <Chip style={ styles.chip } backgroundColor={ cyan200 } onRequestDelete={ this.off.bind( this ) } onTouchTap={ this.off.bind( this ) }>ON</Chip>
							: null }
						{ ! this.props.online
							? <Chip style={ styles.chip } backgroundColor={ red500 } labelColor={ 'white' }>OFFLINE</Chip>
						: null }
						<Snackbar
							open={ this.state.fetching }
							message={ this.getTitle() + ' Requesting change' }
							autoHideDuration={ 5000 }
							onRequestClose={ () => this.setState( { fetching: false } ) }
						/>
					</div>
				</div>
				</CardHeader>
				<CardText expandable={ true }>
				<Mode
					mode = { this.props.mode }
					dispatch={ this.dispatch.bind( this ) }
					dispatchTrigger={ this.dispatch.bind( this ) }
					fetching = { this.state.fetching }
					state={ this.props.state }
				/>
				</CardText>
			</Card>
		);
	}
}

export default NodemcuMinion;
