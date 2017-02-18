# InstantJabber
A chat application for student projects

## Development
In order to begin developing you will first need to get setup. The first thing you will need to do is to download and install node.js. The latest from the 4.x.x stream or greater will do. You will also need to install mongoDB https://www.mongodb.com/download-center and add the binaries to your path. Now, you will need to download some global dependancies.
  1. `npm install -g bower`
  2. `npm install -g grunt-cli`

After installing bower you will need to install the dependancies for the application `npm install`

That should automatically run `bower install`, if it doesn't, run that command as well.

In order to store our database we need to create a directory for it `mkdir data`

This is all the setup that is required. In order to run the application simply run `grunt serve`

And finally, you can connect to your application at `localhost:3000`

To delete the build folder, simply run `grunt cleanup`
