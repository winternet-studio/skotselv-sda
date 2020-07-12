var config = {
	propresenterWebsocket: {
		server: {scheme: 'ws', host: '192.168.1.100', port: 20562},
		password: 'PASSWORD',
		retryAttempts: 999,
		persistConnection: true,
	},
	propresenterUUIDs: {
		stageScreen: 'd968aa11-f7f3-4aa6-8ca9-6181429e94d2',
		stageDisplayStandardLayout: '679f8861-1abf-4af6-b476-22b25e2222ed',
		stageDisplayMusicLayout: '0a95afcf-965c-4809-8b92-64424977c6b2',
	},
};

module.exports = config;
