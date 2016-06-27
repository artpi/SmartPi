import React from 'react';
import get from 'lodash/get';

import RGBControl, { Avatar as RGBAvatar } from '../modes/rgb-control.js';
import Switch, { Avatar as SwitchAvatar } from '../modes/switch.js';

const modeMapping = {
	rgb: { edit: RGBControl, avatar: RGBAvatar },
	'switch': { edit: Switch, avatar: SwitchAvatar }
};

export function getModeComponent( mode ) {
	return modeMapping[ mode ].edit;
}

export default ( props ) => {
	const ModeComponent = getModeComponent( props.mode );
	if ( !ModeComponent ) {
		return null;
	} else {
		return (
			<ModeComponent { ...props } />
		);
	}
};

export const Avatar = props => {
	const AvatarComponent = get( modeMapping, [ props.mode, 'avatar' ] );
	if ( !AvatarComponent ) {
		return null;
	} else {
		return (
			<AvatarComponent { ...props } />
		);
	}
};
