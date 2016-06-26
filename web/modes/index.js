import RGBControl from '../modes/rgb-control.js';
import Switch from '../modes/switch.js';

const modeMapping = {
	rgb: RGBControl,
	'switch': Switch
};

export default function getModeComponent( mode ) {
	return modeMapping[ mode ];
}
