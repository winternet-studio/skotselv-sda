<?php
// Connects to ProPresenter websocket server and sends commands
// Used by the LuaMacros script


use WebSocket as TextalkWebSocket;  //websocket client from textalk

require('vendor/autoload.php');

$config = require(__DIR__ .'/config.php');


$remoteClient = new TextalkWebSocket\Client($config['propresenterWebsocket']['scheme'] .'://'. $config['propresenterWebsocket']['host'] .':'. $config['propresenterWebsocket']['port'] .'/remote', ['timeout' => 10]);


echo 'Authenticating...<br>';
$json = json_encode(['action' => 'authenticate', 'protocol' => $config['propresenterWebsocket']['protocol'], 'password' => $config['propresenterWebsocket']['password']]);
$remoteClient->send($json);
echo $remoteClient->receive() .'<br>';


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
echo $json .'<br>';
$remoteClient->send($json);
if (!$_GET['skiplog']) {
	file_put_contents(__DIR__ .'/keypresses.log', date('Y-m-d H:i:s') ."\t". $_GET['act'] . PHP_EOL, FILE_APPEND);
}

// echo $remoteClient->receive();
