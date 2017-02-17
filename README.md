# InstantJabber
A chat application for student projects

## Development
In order to begin developing you will first need to get setup. The first thing you will need to do is to download and install node.js. The latest from the 4.x.x stream or greater will do. After installing node.js, you will need to download some global dependancies.
  `npm install -g bower`
  `npm install -g grunt-cli`

After installing bower you will need to install the dependancies for the application
  `npm install`

That should automatically run `bower install`, if it doesn't, run that command as well.

This is all the setup that is required. In order to run the application simply run
  `grunt serve`

And finally, you can connect to your application at `localhost:3000`
