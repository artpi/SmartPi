# Firenet of things

This is the 'worker' package for "Firenet of Things" - my $4 Smarthome setup build on top of Google Firebase.
This part connects firebase to devices. It runs locally in your home, on Raspberry Pi or other supporting device.
More information in [Github README](https://github.com/artpi/SmartPi)

## Features

- Siri integration ( via `homebridge-firenet` [package](https://www.npmjs.com/package/homebridge-firenet/) )
- Wireless control over $4 ESP8266 modules
- AC/DC current control
- RGB LED strip control, Sunrise simulation
- IFTTT integration
	- Presence sensing
	- Google Calendar intogration
	- Notifications
- Device shadows (keeping last device state), notification on device disconnection (ex. when power fails)
- Google / Facebok / Github... etc login and auth
- Triggers that can start a series of tasks
- Websocket API
- REST API
- React / Firebase web app
- Runs on a free Google Firebase plan


## Quick install

#### Prerequisites:

- MQTT broker
- Devices connected to MQTT broker
- Firebase account

#### Installation
- `npm install -g firenet`

#### Configuration

Configuration is kept in `~/.firenet-of-things/`
Download service account keys for firebase and save them as `~/.firenet-of-things/firebase-credentials.json`
Edit `~/.firenet-of-things/config.js` with your config:
```
{
	id: 'smart-pi',
	broker: 'mqtt://...',
	firebase: 'https://....firebaseio.com'
};
```

#### Run

Just run in console:
`firenet-of-things`
