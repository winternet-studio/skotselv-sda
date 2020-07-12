-- Reconfigure certain keys on keyboards, ie. redirect the buttons on the remote control to navigate slide in ProPresenter via Websocket instead of normal PageDown/Up keypresses
-- This is used by LuaMacros and is automatically executed when computer starts up


-- CONFIGURATION
remoteControlKeyboardID = '3DFEA16',  -- the Logitech R400 Wireless Presentation Remote (use code piece below for finding it - see also https://github.com/me2d13/luamacros/wiki/Basic-Functions)
webserverHost = 'http://localhost',  -- scheme and hostname


-- Used for finding the keyboardID:
-- lmc_device_set_name('MACROS')
-- lmc_print_devices()


-- Define which "keyboard" to intercept keypresses for
print('Setting up keyboard ID ' .. remoteControlKeyboardID)
lmc_device_set_name('MACROS', remoteControlKeyboardID)

-- ===================================
-- REDEFINE KEYS
-- ===================================

-- PageUp
lmc_set_handler('MACROS', 33, 1, function()
	lmc_http_get(webserverHost .. '/propresenter-command.php?act=prev-slide');
end)

-- PageDown
lmc_set_handler('MACROS', 34, 1, function()
	lmc_http_get(webserverHost .. '/propresenter-command.php?act=next-slide');
end)

-- .
lmc_set_handler('MACROS', 190, 1, function()
	lmc_http_get(webserverHost .. '/propresenter-command.php?act=clear-slide');
end)

-- F5
lmc_set_handler('MACROS', 116, 1, function()
	lmc_http_get(webserverHost .. '/propresenter-command.php?act=play-pause-audio');
end)


-- lmc_set_handler('MACROS', function(button, direction)
--   if (direction == 1) then return end  -- ignore down
--   print('Button: ' .. button)
-- end)
