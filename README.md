# Firenet of things AKA SmartPi AKA this crazy dude's smarthome rig.


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

TBD

## Architecture

This whole project started as a quest to build self-owned IOT cloud with minimal setup and enabling running as cheap as possible.
There are plenty solutions on the market. Some of them looked like they can disappear any minute, some of them were not cheap.
Amazon IOT was very tempting, but I couldn't run it for free and the cheapest modules had trouble connecting to their SSL servers (because of TLS 1.2)

All in all, I settled on Firebase, which is real-time cloud json database from Google. With Firebase you have Hosting, Google / Facebook / Github... 
authentication and authorization.

All this would not be possible without glorious ESP8266 chips. They are like Arduino with Wifi and they are running NodeMCU firmware which you program in lua script ( similar to JS ).
I have started putting up a [ Plug&Play firmware called nodemcu-minion](./devices/nodemcu-minion) which requires no programming to setup. Work in progress.

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

