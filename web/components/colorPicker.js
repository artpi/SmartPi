import React from 'react';
import { CustomPicker } from 'react-color';
import Slider from 'material-ui/Slider';

class ColorPicker extends React.Component {
    render() {
        var example = {
            width: '100%',
            height: '50px',
            border: '2px solid black',
            marginBottom: '1em',
            backgroundColor: this.props.hex
        }
        
        return (
            <div>
                <div style={example}></div>
                <div>Hue</div>
                <Slider 
                    name="h"
                    min={0}
                    max={360}
                    step={1}
                    value={this.props.hsl.h}
                    onChange={ (e, val) => this.props.onChange({
                        h: val,
                        s: this.props.hsl.s,
                        l: this.props.hsl.l
                    })}
                />
                <div>Saturation</div>
                <Slider 
                    name="s"
                    min={0}
                    max={1}
                    step={.001}
                    value={this.props.hsl.s}
                    onChange={ (e, val) => this.props.onChange({
                        h: this.props.hsl.h,
                        s: val,
                        l: this.props.hsl.l
                    })}               
                />
                <div>Lightness</div>
                <Slider 
                    name="l"
                    min={0}
                    max={1}
                    step={.001}
                    value={this.props.hsl.l}
                    onChange={ (e, val) => this.props.onChange({
                        h: this.props.hsl.h,
                        s: this.props.hsl.s,
                        l: val
                    })}
                />
            </div>
        );       
    }
}

export default CustomPicker(ColorPicker);