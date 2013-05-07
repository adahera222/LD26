#pragma strict

import System.Collections.Generic;

public class Terminal extends ScriptEvents implements ScreenSizeChangeListener {

	var guiStyle : GUIStyle;
	var terminalSession : TerminalSession;
	
	private var x : int;
	private var y : int;
	private var width : int;
	private var height : int;
	
	private var maxLines : int;
	private var maxWidth : int;
	
	
	private var on : boolean;
	
	private var keyboardBuffer : String;
	
	function Start() {
		super.Start();
		OnScreenSizeChanged();
		GameInfo.RegisterScreenSizeChangeListnener(this);
		keyboardBuffer = "";
	}
	
	function OnGUI() {
		if(on){
			GUI.depth = 100;
			
			// update font size in case window size has changed
			if(guiStyle.fontSize != GameInfo.terminalSize){
				guiStyle.fontSize = GameInfo.terminalSize;
				maxLines = height / GameInfo.terminalSize - 3;
				maxWidth = width / GameInfo.terminalSize * 1.8;
			}
		
			var output : String = "";
			var numLines : int = Mathf.Min(maxLines, terminalSession.GetHistory().length);
			
			for(var i : int = numLines - 1; i >= 0; i--){
				output += terminalSession.GetHistory()[terminalSession.GetHistory().length - i - 1];
				if(i != 0){
					output += "\n";
				}
			}
			
			if(!terminalSession.IsMaskInput()){
				output += keyboardBuffer;
			} else {
				//for(var j : int = 0; j < keyboardBuffer.Length
				output += keyboardBuffer.Length * '*';
			}
			
			GUI.Box(Rect(x, y, width, height), output, guiStyle); // Temporary!!!!
		}
	}
	
	
	
	function SwitchState() {
		on = !on;
		player.SetUsingTerminal(on);
	}
	
	function OnScreenSizeChanged(){
		x = Screen.width / 4.6;
		y = Screen.height / 8.5;
		width = Screen.width - (x*2);
		height = Screen.height - (y*2);
		print("terminal now = (" + x + "," + y + "," + width + "," + height + ")");
	}

	function IsOn() : boolean {
		return on;
	}
	
	
	// key checking
	
	function Update() {
		if(player.IsUsingTerminal() && player.IsAcceptingInput()){
			if(Input.inputString != null && Input.inputString.Length > 0){
				print("TERM: reading input: " + Input.inputString);
				
				for(var i : int = 0; i < Input.inputString.Length; i++){
					var c : char = Input.inputString[i];
					if(c == '\r'){
						print("TERM: newline");
						terminalSession.ExecuteInput(keyboardBuffer);
						keyboardBuffer = "";
					} else if(c == '\b'){
						print("TERM: backspace");
						print("TERM: before = " + keyboardBuffer);
						if(keyboardBuffer.Length > 0){
							keyboardBuffer = keyboardBuffer.Remove(keyboardBuffer.Length - 1);
						}
						print("TERM: after = " + keyboardBuffer);
					} else {
						if((keyboardBuffer.Length + (terminalSession.GetHistory()[terminalSession.GetHistory().length - 1] as String).Length) < maxWidth){
							keyboardBuffer += c;
						}
					}
				}
				
				
			}
		}
	}
}