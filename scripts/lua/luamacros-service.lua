-- Reconfigure certain keys on keyboards, ie. redirect the buttons on the remote control to navigate slide in ProPresenter via Websocket instead of normal PageDown/Up keypresses
-- This is used by LuaMacros and is automatically executed when computer starts up


-- CONFIGURATION
remoteControlKeyboardID = '35EB7C97'  -- the Logitech R400 Wireless Presentation Remote (use code piece below for finding it - see also https://github.com/me2d13/luamacros/wiki/Basic-Functions)
webserverHost = 'http://localhost/presentation-manager'  -- scheme and hostname


-- Used for finding the keyboardID:
-- lmc_assign_keyboard('MACROS')
-- lmc_print_devices()


lmc.minimizeToTray = true
lmc_minimize()

-- Define which "keyboard" to intercept keypresses for
print('Setting up keyboard ID ' .. remoteControlKeyboardID)
lmc_device_set_name('MACROS', remoteControlKeyboardID)

-- ===================================
-- REDEFINE KEYS
-- ===================================

-- PageUp
lmc_set_handler('MACROS', 33, 1, function()
	print('PageUp pressed')
	response = lmc_http_get(webserverHost .. '/propresenter-command.php?act=prev-slide');
	if (response == 99) then
		-- pass through
		lmc_send_input(33, 0, 0) -- press
		lmc_send_input(33, 0, 2) -- release
	end
	-- IN CASE WE WANT TO USE NODE INSTEAD: response = lmc_spawn('node.exe', 'c:\\Data\\scripts\\nodejs\\triggerEvents.js', 'next-slide')
end)

-- PageDown
lmc_set_handler('MACROS', 34, 1, function()
	print('PageDown pressed')
	response = lmc_http_get(webserverHost .. '/propresenter-command.php?act=next-slide');
	if (response == 99) then
		-- pass through
		lmc_send_input(34, 0, 0) -- press
		lmc_send_input(34, 0, 2) -- release
	end
end)

-- .
lmc_set_handler('MACROS', 190, 1, function()
	print('. pressed')
	response = lmc_http_get(webserverHost .. '/propresenter-command.php?act=clear-slide');
	if (response == 99) then
		-- pass through
		lmc_send_input(190, 0, 0) -- press
		lmc_send_input(190, 0, 2) -- release
	end
end)

-- F5
lmc_set_handler('MACROS', 116, 1, function()
	print('F5 pressed')
	response = lmc_http_get(webserverHost .. '/propresenter-command.php?act=play-pause-audio');
	if (response == 99) then
		-- pass through
		lmc_send_input(116, 0, 0) -- press
		lmc_send_input(116, 0, 2) -- release
	end
end)


-- lmc_set_handler('MACROS', function(button, direction)
--   if (direction == 1) then return end  -- ignore down
--   print('Button: ' .. button)
-- end)
