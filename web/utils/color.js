const controllerBase = 1023;
const hexBase = 255;

function scale( value, fromBase, toBase ) {
	return Math.round( value * toBase / fromBase );
}

function toHex( value ) {
	value = scale( value, controllerBase, hexBase ).toString( 16 );
	return value.length > 1 ? value : '0' + value;
}

export default function hex( color ) {
	return '#' + toHex( color.red ) + toHex( color.green ) + toHex( color.blue );
}
