#!/usr/bin/env node

// THIS IS NOT CURRENTLY USED but works just fine. It was made to do the exact same thing as propresenter-command.php in an attempt to see if that would fix the
// occasional ProPresenter crash when using the websocket API. But it turned out that it wasn't our script that was the problem - they just needed to do a bugfix.


// Connects to ProPresenter websocket server for triggering events
// Specifically we use this to change slides and presentations
// This is called by an LuaMacros
// This script is very similar to monitorEvents.js

var AppSettings = require('./config');
var util = require('./utilityCommon');

var AppRuntime = {
	websocketFailedAttempts: 0,
	websocketClosedConnectionCounter: 0,
	currentStageDisplayLayout: null,
	serverInfo: null
};

// Read command line options
var act = process.argv[2];
var skiplog = process.argv[3];
if (!act) {
	throw 'No action specified.';
}

// Allow max 15 secs for the entire script
setTimeout(function() {
	util.logMsg('Disconnecting after reaching max script time');
	process.exit();
}, 10000);

// Connect to websocket
AppRuntime.wsRemoteUrl = AppSettings.propresenterWebsocket.server.scheme +'://'+ AppSettings.propresenterWebsocket.server.host +':'+ AppSettings.propresenterWebsocket.server.port +'/remote';

var WebSocketClient = require('websocket').client;
AppRuntime.wsRemoteConn = new WebSocketClient();

AppRuntime.wsRemoteConn.on('connectFailed', function(error) {
	AppRuntime.websocketFailedAttempts++;

	var errStr = error.toString();
	if (errStr.indexOf('\n') > -1) {
		errStr = errStr.substr(0, errStr.indexOf('\n'));
	}
	util.logMsg('WebSocket Connect error #'+ AppRuntime.websocketFailedAttempts +': ' + errStr, 'red');
});
AppRuntime.wsRemoteConn.on('connect', function(connection) {
	util.logMsg('WebSocket Connection established', 'grey');
	AppRuntime.websocketConnected = true;
	// AppRuntime.websocketConnectionResource = connection;

	var sendMsg = function(object, disconnectAfter) {
		var json = JSON.stringify(object);
		util.logMsg('Sending: '+ json.replace(/password"(.*?)"(.*?)"/, 'password"$1""'), 'green');
		connection.sendUTF(json);

		if (disconnectAfter) {
			setTimeout(function() {
				connection.close();
				util.logMsg('Disconnecting '+ disconnectAfter +'ms after sending command');
				process.exit();
			}, disconnectAfter);  //millisecs
		}
	};

	util.logMsg('Authenticating...');
	sendMsg({action: 'authenticate', protocol: '700', password: AppSettings.propresenterWebsocket.password});

	connection.on('message', function(message) {
		AppRuntime.websocketClosedConnectionCounter = 0;  //"on connect" can't be used because we might connect successfully but then run into a problem later that closes the connection

		if (message.type === 'utf8') {
			util.logMsg('Received:', 'red');
			util.logMsg(message.utf8Data);
			var payload = JSON.parse(message.utf8Data);
			// console.log(payload);

			if (payload.action === 'authenticate' && payload.authenticated) {
				AppRuntime.serverInfo = Object.assign({}, payload);

				// After authenticating send our command
				if (act == 'next-slide') {
					sendMsg({action: 'presentationTriggerNext'}, 1000);
				} else if (act == 'prev-slide') {
					sendMsg({action: 'presentationTriggerPrevious'}, 1000);
				} else if (act == 'clear-slide') {
					sendMsg({action: 'clearText'}, 1000);
				} else if (act == 'play-pause-audio') {
					sendMsg({action: 'audioPlayPause'}, 1000);
				} else if (act == 'show-todays-speaker') {
					sendMsg({action: 'presentationTriggerIndex', presentationPath: config.todaysSpeakerSlide.path, slideIndex: config.todaysSpeakerSlide.index }, 1000);
				} else if (act == 'show-sabbath-school-countdown') {
					sendMsg({action: 'presentationTriggerIndex', presentationPath: config.sabbathSchoolCountdownSlide.path, slideIndex: config.todaysSpeakerSlide.index }, 1000);
				} else {
					process.exit();
				}
			}
		} else {
			util.logMsg('Whoops, '+ message.type +' message received from Websocket!', 'red');
		}
	});

	connection.on('error', function(error) {
		util.logMsg('Websocket Connection error: ' + error.toString(), 'red');
	});

	connection.on('close', function(code, reason) {
		util.logMsg('Websocket Connection closed (Code: '+ code +' - Reason: '+ reason +')', 'grey');
		AppRuntime.websocketConnected = false;

		AppRuntime.websocketClosedConnectionCounter++;
	});
});

function connectToWebsocket(url) {
	util.logMsg('Connecting to ' + url.replace(AppSettings.propresenterWebsocket.password, '<password>'), 'grey');
	AppRuntime.wsRemoteConn.connect(url);
}


connectToWebsocket(AppRuntime.wsRemoteUrl);
