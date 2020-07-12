// This file contains some utility functions

var colors = require('colors/safe');

var runtime = {};

/**
 * Compress a JSON string by remove quotes and meaningless lines
 *
 * Must be a pretty-printed string
 */
function compressJson(string) {
	return string
		.replace(/\{\n/g, '\n')
		.replace(/"([a-z0-9_\-]+)": "(.*[a-z_: ]+.*)",?/gi, '$1: $2')  //remove quotes around keys and around strings with letters in it
		.replace(/"([a-z0-9_\-]+)": /gi, '$1: ')  //remove quotes around remaining keys
		.replace(/",\n/g, '"\n')  //remove comma after values
		.replace(/ *},?\n/g, '')  //remove lines with only "}," or "}"
		.replace(/\n\s*}$/, '');  //remove very last "}" (is not remove in previous line because no line-break follows it)
};

/**
 * $param {string} msg
 * $param {string} color - Possible values (can be concatenated with "."): https://www.npmjs.com/package/colors
 */
function logMsg(msg, color, skipTimestamp) {
	clearTimeout(runtime._blankLineTimer);

	msg = compressJson(msg);

	var memoryUsed = process.memoryUsage().rss / 1024 / 1024;
	var memoryUsed2 = process.memoryUsage().heapUsed / 1024 / 1024;
	var timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	if (color) {
		if (color.indexOf('.') > -1) {
			var styling = color.split('.');
			for (var i = 0; i < styling.length; i++) {
				msg = colors[styling[i]](msg);
			}
		} else {
			msg = colors[color](msg);
		}
	}
	if (!skipTimestamp) {
		msg = colors.cyan(timestamp +'   '+ Math.round(memoryUsed) +'M/'+ Math.round(memoryUsed2) +'M    ') + msg;
	}
	console.log(msg);

	// For debugging
	if (0) {
		var fs = require("fs");
		fs.appendFileSync(__dirname +"/logs/monitorPbx.log", msg +"\n");
	}

	// Make blank lines between messages that are further apart so it becomes easier to tell ringing, answer, and hangup apart
	runtime._blankLineTimer = setTimeout(function() {
		console.log(colors.bold.yellow('___________________________________________________________________________________________________'));
		console.log('');
		runtime._blankLineTimer = null;
	}, 1000);  //minimum 1 sec apart
}

function timestampEpochToISO(epoch) {
	// source: https://stackoverflow.com/questions/4631928/convert-utc-epoch-to-local-date#8016205
	var date = new Date(0);
	date.setUTCSeconds(epoch);
	return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

function upperCaseFirst(string) {
	return string.substr(0, 1).toUpperCase() + string.substr(1);
}

function notifySysAdmin(message) {
	// Source: https://stackoverflow.com/questions/20643470/execute-a-command-line-binary-with-node-js#20643568
	// TODO: test this
// DISABLE UNTIL WE HAVE TESTED IT FULLY
return;
	var cmd = 'echo "Ext ${AMPUSER} - ${AMPUSERCIDNAME} just placed a call to John Doe on ${STRFTIME(%C%m%d%y%H%M)}" | mail -s "Call alert from ext ${AMPUSER} - ${AMPUSERCIDNAME}" john.doe@sample.com';

	const { exec } = require('child_process');
	exec(cmd, (err, stdout, stderr) => {
		if (err) {
			// TODO: try to call a custom URL for sending email from there
			return;
		}

		logMsg('stdout: '+ stdout);
		logMsg('stderr: '+ stderr);
	});
}

exports.compressJson = compressJson;
exports.logMsg = logMsg;
exports.timestampEpochToISO = timestampEpochToISO;
exports.upperCaseFirst = upperCaseFirst;
exports.notifySysAdmin = notifySysAdmin;
