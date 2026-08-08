!macro customInstall
  DetailPrint "Starting installation of IT Services Device Detector..."
!macroend

!macro customInstallStep
  DetailPrint "Copying application binaries..."
!macroend

Function .onInstSuccess
  MessageBox MB_OK|MB_ICONINFORMATION "IT Services Device Detector has been installed successfully. Thank you for using BridgeTech IT Services."
FunctionEnd

Function .onInstFailed
  MessageBox MB_OK|MB_ICONSTOP "Installation failed. Please verify your system permissions or contact BridgeTech IT Services."
FunctionEnd
