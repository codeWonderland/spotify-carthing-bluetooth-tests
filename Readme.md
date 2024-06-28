# Spotify Carthing Bluetooth Tests
Here lie all the tests that I did with the spotify carthing and its built in bluetooth functionality. 

There are two main parts to this project, the python server and the web app. Both should be added to folders in the /home/superbird/ directory. Specifics can be determined by looking at the included supervisord.conf file. 

## Disclaimers
I have stopped working on this avenue of hacking the carthing. Largely because without a companion app, there is no easy method of gaining information about the currently playing media through bluetooth. If someone else wants to take the reins, feel free.

The code is also a mess. While I would normally do more to make a public project like this cleaner, it's not really a complete project, just a series of tests to control the bluetoothctl and connect to a device. Please note that while something like this is fine to run on a Carthing, given that it has no data on it, this python code is incredibly insecure to run on your personal computer, as it opens up your device to insecure bluetooth connections.
