; This runs the Node.JS script monitorEvents.js that connects to ProPresenter websocket server.
; The purpose is basically just to hide the script window and nicely put it into the system tray.


; source: https://autohotkey.com/boards/viewtopic.php?t=4373

#NoTrayIcon
#Persistent

global hProgram

/* Setup Tray icon and add item that will handle
 * double click events
 */
Menu Tray, Icon
Menu Tray, Icon, c:\Program Files\ProPresenter\ProPresenter.exe
Menu Tray, Add, Show / Hide WebSocket Client, TrayClick
Menu Tray, Default, Show / Hide WebSocket Client

;// Run program hidden
DetectHiddenWindows On
Run node c:\Data\scripts\nodejs\monitorEvents.js,, Hide, PID
WinWait ahk_pid %PID%
hProgram := WinExist()
WinWaitClose ahk_id %hProgram%
;AUTOCLOSE AFTER 20 SECS:   MsgBox,,, WebSocket Client was closed. Quitting script., 20
MsgBox,,, WebSocket Client was closed. Quitting script.
ExitApp

TrayClick:
OnTrayClick()
return

;// Show / hide program on double click
OnTrayClick() {
    if DllCall("IsWindowVisible", "Ptr", hProgram) {
        WinHide ahk_id %hProgram%
    
    } else {
        WinShow ahk_id %hProgram%
        WinActivate ahk_id %hProgram%
    }
}
