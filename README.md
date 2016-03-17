#Raspberry Smart Home (SmartPi)

**SmartPi** is my setup of a SmartHome. Some features include:
- Turning the lights on/off
- Playing music from Spotify
- Voice control through *OK Google* keyword
- Sensing my presence and performing actions accordingly
- Integration with GoogleCalendar and performing actions scheduled there
- Emulating sunrise in my bedroom every morning via RGB led strip


##Light Control
I have a 3,5 m RGB Led strip in my bedroom, controlled via Arduino, which in turn is wirelessly controlled by raspberry.
This led strip serves as a light source, prividing soft and warm light in the evening and bright close to blue light during the day.
Every morning it simulates sunrise in order to wake me up.

###Wiring and scripting

My LED strip is in a different room than Raspberry, so control is achieved via **nrf24l01+** modules (approx 3 dolars). These modules work over 2.4 GHz and there is an excellent library called RF24 for both Arduino and Raspberry Pi.

So, when I send a light control command:
- SmartHome.php calls i2control (WARNING: i2control.c is not the source code for i2control, because I have lost my source code but have the executable.). [Source code here](./raspberry/i2control.c)
- There is Arduino connected via I2C to Raspberry. This is needed, because I for some reason I cannot connect *nrf24l01+* via SPI to raspberry. [This Arduino source code is here ](./arduino/NRF_sender/NRF_sender.ino)
- Arduino uses RF24 library to send an array of 4 ints and gets back also an array of 4 ints. First int is the id of wireless unit it communicates with. 
- LED strip is controlled by Arduino. [Code of the led strip is here](./arduino/Led_strip_nrf/Led_strip_nrf.ino)


###Sunrise Wake Up

Controlled by Google Calendar, my setup starts this progression of colors with soft transitions between them:
- Orange-red
- Orange
- Yellow
- White
- LightBlue (Azure)
- Play wakeUp playlist from spotify
- After 20 minutes, turn off


##Music Control

Via my mobile phone or voice commands I can play a playlist fro spotify, pause or resume music. 

I highly recoment Mopidy (https://www.mopidy.com/). This is an open source server for MPD (Music Player Daemon) Protocol. It can play music from spotify, google music, youtube, podcasts, local data etc. You can control it via App on your phone, command line and multiple http clients. It is written in Python, so you need *pip*, python package manager.

To control it via Command line, I use *MPC* (http://git.musicpd.org/cgit/master/mpc.git/) and *Moped* HTTP frontend (https://docs.mopidy.com/en/latest/ext/web/#mopidy-moped)

I have enabled mobidy-spotify plugin and store all my music in spotify.
My **MPCCommand** and inheriting classes all use MPC to control the audio.


##Presence sensing

When I get home, the raspberry Pi knows it and plays my *FinallyHome* playlist from spotify. When I leave my home, it turns all the lights off and music down.
It can be achieved through pinging bluetooth mac or IP of the phone connected through the network.


##Calendar

Any command of my SmartHome.php script can be run from Google Calendar. This provides nice interface for Wake Up alarms and other time-sensitive behaviour.
Script caches event data in mysql database and then executes events that had not been run yet. This is run by cron., so you should setup cron job.

##Voice Control

Any action can be triggered by voice command on my android phone. For example:
- When I say "bedroom on" or "bedroom blue", the led strip in my bedroom turns light-blue, the same for red and green colors
- When i say "Player workout", the audio system connected to MPD daemon starts playing workout playlist set to random
- When I say "Player TED", the audio systems starts playing podcasts from NPR TED radio hour.
- When I say "Player stop", player pauses playback. 

This is achieved through **OK Google** voice command wired in *Google Now*. I have connected excellent **Tasker** (https://play.google.com/store/apps/details?id=net.dinglisch.android.taskerm) with **Autovoice** plugin (https://play.google.com/store/apps/details?id=com.joaomgcd.autovoice) to tap into power of voice commands.
You can see my [Tasker configuration in android dir](android/Tasker/SmartPi.prj.xml)

##Code Setup

TBD
