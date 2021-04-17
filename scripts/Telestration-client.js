var submitDrawing = function() {
	if (drawPad.isEmpty()) {
		alert("No drawing detected.");
	} else {
		var dataURL = drawPad.toDataURL();
		var blob = dataURLToBlob(dataURL);
		socket.emit('saveFile', {fileData: blob, gameRound: gameApp.gameRound})
	}
	gameApp.gameRound++;
	setNewRound();
}
var submitText = function() {
	if (gameApp.textInput == '') {
		alert("No text entered.");
	} else {

		socket.emit('enterGuess', { "text": gameApp.textInput, "gameRound": gameApp.gameRound })
	}
	gameApp.textInput = '';
	gameApp.gameRound++;
	setNewRound();
}

var hostGame = function() {
	if (gameApp.username == '') {
		alert('Enter a username.')
		return;
	}
	socket.emit('newGame', { "username" : gameApp.username }, function(gameID, socketID){
		if (!gameID){
			alert('Unable to create game.')
			return
		}
		gameApp.gameID = gameID;
		gameApp.players.push({socketID: socketID, username: gameApp.username })
	})
}
var joinGame = function() {
	if (gameApp.username == '') {
		alert('Enter a username.')
		return;
	}
	if (gameApp.gameID == '') {
		alert('Enter a gameID.')
		return;
	}
	socket.emit('joinGame', {"gameID" : gameApp.gameID, "username" : gameApp.username }, function(socketID){
		if (!socketID){
			alert('Unable to join game.')
			return
		}
		gameApp.players.push({socketID: socketID, username: gameApp.username })
	})
}
var startGame = function() {
	if (confirm("New players won't be able to join after the game has started. Have all the players joined?")) {
		socket.emit("startGame");
	}
}

var setNewRound = function() {
	if (!gameApp.nextRounds.length) {
		gameApp.showPanel = "waitPanel";
		gameApp.waitingForPrompt = 1;
		return;
	}
	gameApp.waitingForPrompt = 0;
	var nextRound = gameApp.nextRounds[0];

	if (nextRound.type == "draw") {
		gameApp.drawPadPrompt = nextRound.promptText
		gameApp.showPanel = "inputDraw";
		setTimeout(function(){
			gameApp.initCanvas()
		}, 10)

	} else if (nextRound.type == "text") {
		gameApp.drawPadPrompt = ""
		gameApp.imagePrompt = nextRound.promptText
		gameApp.showPanel = "inputText";

	}
	gameApp.nextRounds.shift();

}
var getNewPrompt = function() {
	if (gameApp .gameRound == 1 && confirm("Are you sure you want a new prompt?")) {
		socket.emit("getNewPrompt", {"prompt": gameApp.drawPadPrompt}, function(newPrompt){
			gameApp.drawPadPrompt = newPrompt;
		});
	}

}

var imageLoadFailed = function(image) {
	console.log("imageLoadFailed", image)
    image.onerror = null;
    setTimeout(function (){
        image.src += '?' +new Date;
     }, 1000);
}

var resetGame = function() {
	gameApp.username         = '';
	gameApp.showPanel        = 'homePanel';
	gameApp.drawPadPrompt    = 'test prompt.';
	gameApp.imagePrompt      = '';
	gameApp.textInput        = '';
	gameApp.gameID           = '';
	gameApp.players          = [];
	gameApp.gameRound        = 1;
	gameApp.nextRounds       = [];
	gameApp.waitingForPrompt = 0;
	gameApp.finalSheet       = [];
}