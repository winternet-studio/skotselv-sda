#!/usr/bin/env node

// Connects to ProPresenter websocket server and listens for events
// Specifically we listen for slide change events to determine if we should change display stage layout
// This is called by an AutoHotKey script that starts when the computer starts up
// This script is very similar to triggerEvents.js

var AppSettings = require('./config');
var util = require('./utilityCommon');

var AppRuntime = {
	websocketFailedAttempts: 0,
	websocketClosedConnectionCounter: 0,
	currentStageDisplayLayout: null,
	serverInfo: null
};

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

	// Try again later
	var retryIn = 5;
	util.logMsg('Trying again in '+ retryIn +' secs...');
	setTimeout(function() {
		connectToWebsocket(AppRuntime.wsRemoteUrl);
	}, retryIn*1000);
});
AppRuntime.wsRemoteConn.on('connect', function(connection) {
	util.logMsg('WebSocket Connection established', 'grey');
	AppRuntime.websocketConnected = true;
	// AppRuntime.websocketConnectionResource = connection;

	var sendMsg = function(object) {
		var json = JSON.stringify(object);
		util.logMsg('Sending: '+ json.replace(/password"(.*?)"(.*?)"/, 'password"$1""'), 'green');
		connection.sendUTF(json);
	};

	util.logMsg('Authenticating...');
	sendMsg({action: 'authenticate', protocol: '700', password: '1844'});

	connection.on('message', function(message) {
		AppRuntime.websocketClosedConnectionCounter = 0;  //"on connect" can't be used because we might connect successfully but then run into a problem later that closes the connection

		if (message.type === 'utf8') {
			util.logMsg('Received:', 'red');
			util.logMsg(message.utf8Data);
			var payload = JSON.parse(message.utf8Data);
			// console.log(payload);

			if (payload.action === 'authenticate' && payload.authenticated) {
				AppRuntime.serverInfo = Object.assign({}, payload);
			} else if (payload.action === 'presentationTriggerIndex') {
				if (payload.presentationPath) {
					payload.presentationPath = payload.presentationPath.replace(/\\/g, '/');  //streamline to use only forward slashes

					// sendMsg({'action':'stageDisplaySets'});  //use for finding new UUIDs

					if (AppRuntime.textClearedTimer) {
						clearTimeout(AppRuntime.textClearedTimer);
					}

					// Only send command to change the layout when is it different that what we within this script know that it was previously - or if we don't know what is was
					if (payload.presentationPath.indexOf('/Libraries/Sanger') > -1) {
						if (!AppRuntime.currentStageDisplayLayout || AppRuntime.currentStageDisplayLayout === AppSettings.propresenterUUIDs.stageDisplayStandardLayout) {
							sendMsg({action: 'stageDisplayChangeLayout', stageLayoutUUID: AppSettings.propresenterUUIDs.stageDisplayMusicLayout, stageScreenUUID: AppSettings.propresenterUUIDs.stageScreen});
							AppRuntime.currentStageDisplayLayout = AppSettings.propresenterUUIDs.stageDisplayMusicLayout;
						}
					} else {
						if (!AppRuntime.currentStageDisplayLayout || AppRuntime.currentStageDisplayLayout === AppSettings.propresenterUUIDs.stageDisplayMusicLayout) {
							sendMsg({action: 'stageDisplayChangeLayout', stageLayoutUUID: AppSettings.propresenterUUIDs.stageDisplayStandardLayout, stageScreenUUID: AppSettings.propresenterUUIDs.stageScreen});
							AppRuntime.currentStageDisplayLayout = AppSettings.propresenterUUIDs.stageDisplayStandardLayout;
						}
					}
				}
			} else if (payload.action === 'clearText') {
				// Slide was clared
				// NOTE: we add a delay to this because this event occurs on every single slide change even within a song
				AppRuntime.textClearedTimer = setTimeout(function() {
					if (!AppRuntime.currentStageDisplayLayout || AppRuntime.currentStageDisplayLayout === AppSettings.propresenterUUIDs.stageDisplayMusicLayout) {
						sendMsg({action: 'stageDisplayChangeLayout', stageLayoutUUID: AppSettings.propresenterUUIDs.stageDisplayStandardLayout, stageScreenUUID: AppSettings.propresenterUUIDs.stageScreen});
						AppRuntime.currentStageDisplayLayout = AppSettings.propresenterUUIDs.stageDisplayStandardLayout;
					}
				}, 2000);
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

		// Try again later
		var retryIn = 5;
		util.logMsg('Reconnecting to ProPresenter in '+ retryIn +' secs...');
		setTimeout(function() {
			connectToWebsocket(AppRuntime.wsRemoteUrl);
		}, retryIn*1000);
	});
});

function connectToWebsocket(url) {
	util.logMsg('Connecting to ' + url.replace(AppSettings.propresenterWebsocket.password, '<password>'), 'grey');
	AppRuntime.wsRemoteConn.connect(url);
}


connectToWebsocket(AppRuntime.wsRemoteUrl);
