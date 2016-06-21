import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import get from 'lodash/get';
import pick from 'lodash/pick';
import TextField from 'material-ui/TextField';
import { Card, CardActions, CardHeader, CardTitle, CardText } from 'material-ui/Card';
import Toggle from 'material-ui/Toggle';
import ColorPicker from '../components/colorPicker';

class NodemcuMinion extends Component {
	constructor( props, context ) {
		super( props, context );
		this.state = {
			open: false,
		};
	}

	submit() {
        var red = Math.round(this.state.red * 1); 
        var green = Math.round(this.state.green * 1); 
        var blue = Math.round(this.state.blue * 1);
        
		this.props.dispatch( {
			id: this.props.id,
			action: 'set',
			state: {
                red: red,
                green: green,
                blue: blue
            }
		} );
	}

	off() {
		this.props.dispatch( {
			id: this.props.id,
			action: 'off'
		} );
	}
    
    handleChange (color) {
        this.setState({
            red: color.rgb.r * 4,
            green: color.rgb.g * 4,
            blue: color.rgb.b * 4
        })
    }

	render() {
        var red = this.state.red || get( this.props, [ 'state', 'red' ], '' );
        var green = this.state.green || get( this.props, [ 'state', 'green' ], '' );
        var blue = this.state.blue || get( this.props, [ 'state', 'blue' ], '' );
        var initialColor = {
            r: Math.round(red / 4),
            g: Math.round(green / 4),
            b: Math.round(blue / 4)
        }
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
                    <ColorPicker color={initialColor} onChange={this.handleChange.bind(this)} />
					<div>
						<TextField floatingLabelText="RED" type={ 'number' } value={ red } onChange = { ( e, val ) => this.setState( { 'red' : val } ) }/>
						<br />
						<TextField floatingLabelText="GREEN" type={ 'number' } value={ green } onChange = { ( e, val ) => this.setState( { 'green' : val } ) }/>
						<br />
						<TextField floatingLabelText="BLUE" type={ 'number' } value={ blue } onChange = { ( e, val ) => this.setState( { 'blue' : val } ) }/>
						<br />
					</div>
				</CardText>
				<CardActions expandable={ true }>
					<FlatButton label="SAVE" onClick={ () => { this.submit() } } />
					<FlatButton label="OFF" onClick={ () => { this.off() } } />
				</CardActions>
			</Card>
		);
	}
}

export default NodemcuMinion;
