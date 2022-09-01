# Wifi Trak By Alfred Hanson

Visit the WifiTrak Webapp [here]
###### _If its down, its because its running on a Raspberry Pi in my Living Room_

## About
This project seeks to capture the ever growing jungle that is apartment WiFi networks, and turn it into a useful appartus. By aggregating sets of WiFi network strengths, it seems possible to harness a database of these sets for a given locale and accurately locate something within its bounds. This project seeks to investigate this hypothesis, explore its technical feasibility, and perhaps some practical consumer use cases.

## Me
It is important to note that this project was chock full of firsts for me. These firsts include:
- Using Ruby/Ruby on Rails
- Using the Grape API Framework
- Using the [Moddable SDK]
-- Touchscreen microcontroller programming in particular
- Using Google Cloud Platform (Scrapped early)

Along with that, this project was completed in a very much MVP fashion. The app is currently deployed in development mode, there are a plethora of angles for SQL injection, and no authentication to speak of. However, sticking with the 80/20, I believe it does a good job of investigating the possibilities of WiFi network leveraging for micro-geolocation.

# Functionality at a glance
In this repo you will find the code for the RoR application, and code for the microcontrollers. The microcontroller is divided into two sections for the provisioning device and tracker device firmware.

### The Provisioner
This device is a microcontroller with a touchscreen attached to it. This hardware is sold by the creators of the Moddable SDK, the [Moddable Two]. The purpose of this device when paired with the firmware I created is to provide an easy to use, handheld battery powered interface that can collect data on WiFi signals. Using a set of locations that I defined based on my apartment, it is as simple as walking to the location where you would like to add data for, tapping the location, and verifying the data before submission. The device submits a payload of networks with strength ratings to the RoR server for further processing.
![Alt Text](https://media.giphy.com/media/eg5XXlMJ7c3885iFMk/giphy-downsized-large.gif)

### The Tracker
This device simply does a set of WiFi scans and uploads a payload with all of the networks found. In my development, I found the attentuation of the wifi signals results in a wide range of possible values for any given network, even with the tracker in the same exact location. So a set of 20 or so scans are done, are average out, and then sent up. I have found that this, with some server side tweaking to my propietary algorithm have produced accurate and consistent results.

![Alt Text](https://i.ibb.co/j4mTzDN/IMG-2517.jpg)

### The RoR Webapp
The webapp is pretty self explanatory. Going to the page will show you web app and any devices I currently have configured, and their latest report positions. Any updates made serverside are automagically rendered through the afforementiioned Turbo Rails integration.

## Retrospective
I can say through this that while at first, Ruby was some form of alien hieroglyphics, I could see myself designing this product into product with the RoR platform. The ActiveRecord model system impressed me greatly, and the syntax/auto generation for using the model in views. In addition, the Rails 7 platform with ActionCable/Turbo allowing for easy integration of webhooks to the afforementioned models was too good to be true. I did not have time to create a formal SPA application, and honestly for this I am glad this was the case. Had I tried to digest React or Vue on my first go with RoR, I assuredly would have not been able to bridge the grape with Turbo websocket integration.

   [here]: <https://wifitrak.ngrok.io/devices/index>
   [Moddable SDK]: <https://www.moddable.com/>
   [Moddable Two]: <https://github.com/Moddable-OpenSource/moddable/blob/public/documentation/devices/moddable-two.md>
