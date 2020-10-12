<?php
// Connects to ProPresenter websocket server and sends commands
// Used by the LuaMacros script


use WebSocket as TextalkWebSocket;  //websocket client from textalk

require('vendor/autoload.php');

$config = require(__DIR__ .'/config.php');

try {
	$remoteClient = new TextalkWebSocket\Client($config['propresenterWebsocket']['server']['scheme'] .'://'. $config['propresenterWebsocket']['server']['host'] .':'. $config['propresenterWebsocket']['server']['port'] .'/remote', ['timeout' => 10]);
} catch (\Exception $e) {
	echo 99;
	exit;
}


try {
	// echo 'Authenticating...<br>';
	$json = json_encode(['action' => 'authenticate', 'protocol' => $config['propresenterWebsocket']['server']['protocol'], 'password' => $config['propresenterWebsocket']['password']]);
	$remoteClient->send($json);
	$response = $remoteClient->receive();  //must wait for response!


	// Show all library documents
	// $remoteClient->send('{"action":"libraryRequest"}');
	// $response = $remoteClient->receive();
	// echo $response;


	// Docs: https://github.com/jeffmikels/ProPresenter-API/blob/master/Pro7.md

	if ($_GET['act'] == 'next-slide') {
		$json = json_encode(['action' => 'presentationTriggerNext']);
	} elseif ($_GET['act'] == 'prev-slide') {
		$json = json_encode(['action' => 'presentationTriggerPrevious']);
	} elseif ($_GET['act'] == 'clear-slide') {
		$json = json_encode(['action' => 'clearText']);
	} elseif ($_GET['act'] == 'play-pause-audio') {
		$json = json_encode(['action' => 'audioPlayPause']);
	} elseif ($_GET['act'] == 'show-todays-speaker') {
		$json = json_encode(['action' => 'presentationTriggerIndex', 'presentationPath' => $config['todaysSpeakerSlide']['path'], 'slideIndex' => $config['todaysSpeakerSlide']['index'] ]);
	} elseif ($_GET['act'] == 'show-sabbath-school-countdown') {
		$json = json_encode(['action' => 'presentationTriggerIndex', 'presentationPath' => $config['sabbathSchoolCountdownSlide']['path'], 'slideIndex' => $config['todaysSpeakerSlide']['index'] ]);
	} else {
		die('No valid command given.');
	}
	// echo $json .'<br>';
	$remoteClient->send($json);
	if (!$_GET['skiplog']) {
		file_put_contents(__DIR__ .'/keypresses.log', date('Y-m-d H:i:s') ."\t". $_GET['act'] . PHP_EOL, FILE_APPEND);
	}

	$response = $remoteClient->receive();

	usleep(100000);  //maybe not needed, but we do it just for extra safety

	$remoteClient->close();  //nicely close the connection (hopefully helps prevent ProPresenter crashes - if they haven't already fixed their program in v7.2)
} catch (\Exception $e) {
	echo 'ERROR:';
	echo $e->getMessage();
}

echo 0;
