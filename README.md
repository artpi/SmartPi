#Raspberry Smart Home (Smart Pi)


##Light Control



###Wiring and scripting


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
You can see my [Tasker configuration in android dir](android/Tasker/SmartPi.xml)

##Code Setup

###arduino dir

###raspberry dir