Set WshShell = CreateObject("WScript.Shell")
' Get the directory of the current script
strPath = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\"))
' Run the python script hidden (0 = hide window, False = don't wait for completion)
WshShell.Run "python """ & strPath & "main.py""", 0, False
