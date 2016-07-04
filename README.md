# Firenet of things AKA SmartPi

A SmartHome setup using Google Firebase and $4 modules. Can do a lot of awesome stuff.

## [![](https://cloud.githubusercontent.com/assets/3775068/16554631/6191bf76-41d0-11e6-9656-615122231014.png)  Play demo video on youtube](https://www.youtube.com/watch?v=AjtrikwHB_Y)


| Devices list                        | Main menu                           | RGB lamp control                    | Composing triggers                  |
|-------------------------------------|-------------------------------------|-------------------------------------|-------------------------------------|
|![](https://cldup.com/n84sS0Fi9M.png)|![](https://cldup.com/-n1hCbb30L.png)|![](https://cldup.com/7BJc3cMJIU.png)|![](https://cldup.com/wOSFFjdpGu.png)|


#### Features

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

#### Quick install

1. You need devices that communicate with this project. I recommend [nodemcu-minion with ESP8266](https://github.com/artpi/nodemcu-minion)
2. Install mqtt broker on your device at home ( Raspberry Pi? ). `apt-get install mosquitto`
3. [Sign up for a free Google Firebase account](https://firebase.google.com/)
4. Download server account keys for firebase and save them as `device-bridge/config-firebaseKeys.json`
5. Edit `device-bridge/config.js` with your config:
```
export default {
	id: 'smart-pi',
	broker: 'mqtt://...',
	firebase: 'https://....firebaseio.com'
};
```
6. Save config for the [web console from firebase setup](https://firebase.google.com/docs/web/setup) as `web/config-firebase.js`
7. Run Device Bridge (in your raspberry pi) : `cd device-bridge && npm install && npm run`
8. Build web interface : `cd web && npm install && npm run build && firebase deploy`
9. Navigate to your new projet: `firebase open`
10. Profit

## Architecture

This whole project started as a quest to build self-owned IOT cloud with minimal setup and enabling running as cheap as possible.
There are plenty solutions on the market. Some of them looked like they can disappear any minute, some of them were not cheap.
Amazon IOT was very tempting, but I couldn't run it for free and the cheapest modules had trouble connecting to their SSL servers (because of TLS 1.2)

All in all, I settled on Firebase, which is real-time cloud json database from Google. With Firebase you have Hosting, Google / Facebook / Github... 
authentication and authorization.

All this would not be possible without glorious ESP8266 chips. They are like Arduino with Wifi and they are running NodeMCU firmware which you program in lua script ( similar to JS ).
I have started putting up a [ Plug&Play firmware called nodemcu-minion](https://github.com/artpi/nodemcu-minion) which requires no programming to setup.

In overall design I wanted to follow "microservices" approach while keeping it sane. Everything should scale nicely.

### Pieces of the cloud

- Lua scripts running on NodeMCU on ESP8266 hardware
- MQTT broker (mosquitto) on Raspberry Pi
- Node script running on Raspberry Pi ("Device Gateway")
- Firebase running on Google Cloud

#### Hardware

I use ESP8266 chips connected to RGB strip or relays.
Each chip listens to `iot/things/id` topic on message broker and sends a heartbeat to `iot/heartbeat` every second.

#### MQTT broker

This is message broker for lightweight iot messaging protocol.
Theoretically devices could connect to Firebase directly, but I wanted to limit data usage and MQTT was just easier. MQTT Broker is meant to keep communication in a single household. Whole setup can have more brokers, they are completely transparent.

#### Device Gateway

This is the only element that stops the whole system from working, because this is the only piece that runs actual code.
Device Gateway handles Firebase Queues and MQTT messages and it is a Node Script.
- it updates device shadow state in Firebase by parsing heartbeat messages
- keeps "General" queue
	- to dispatch task to a proper device queue
	- to generate a task series upon a trigger
- keeps queue for every device to change its state

#### Firebase

Firebase database is a heart of whole setup.
- `dispatch` tree is used as a task queue
- `devices` tree is used as a device shadow tree
- `spec` tree holds queue configuration details and user authorization rules
- `triggers` tree holds information about triggered task series.

Firebase hosting hosts a web app
Firebase Authentication is used for logging

##### Triggers

Via smart configuration of Firebase access rules, triggers expose HTTPS endpoint that does not require login.
Making a request:
```
curl -X POST -d '{"triggerName":...,"token":..}' https://<your-project>.firebaseio.com/dispatch.json
```
with a proper token will put a new task in `dispatch` queue that will be picked up by device gateway general worker. Each trigger has its own token.
This feature is used for IFTTT integration

#### Web App

Firebase-React web app:
- implements Google account login via Firebase Auth
- displays device state
- is used for dispatching state changes
- is used for configuration

## Old version (SmartPi):

This project started as a PHP / Arduino setup built on top of raspberry pi. [I moved the old version to a an `master-old` branch](https://github.com/artpi/SmartPi/tree/master-old).
These are some of the features of that version:

**SmartPi** is my setup of a SmartHome. Some features include:
- Turning the lights on/off
- Playing music from Spotify
- Voice control through *OK Google* keyword
- Sensing my presence and performing actions accordingly
- Integration with GoogleCalendar and performing actions scheduled there
- Emulating sunrise in my bedroom every morning via RGB led strip

