!macro customInstall
  DetailPrint "Starting installation of BridgeTech Device Detector..."
!macroend

!macro customInstallStep
  DetailPrint "Installing BridgeTech Device Detector and shield avatar branding..."
!macroend

Function .onInstSuccess
  MessageBox MB_OK|MB_ICONINFORMATION "BridgeTech Device Detector has been installed successfully. Next: install Android Platform Tools, enable USB Debugging, then accept the authorization prompt on your device."
FunctionEnd

Function .onInstFailed
  MessageBox MB_OK|MB_ICONSTOP "Installation failed. Please verify your system permissions or contact BridgeTech IT Services."
FunctionEnd
