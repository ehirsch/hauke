var final_transcript = '';
var recognizing = false;
var recognizerTimeout;
var ignore_onend;
var start_timestamp;


var start_button;
var recognition;
var final_span;
var interim_span;
var bubbleContainer;
var text_area;


function waitForInput() {
	if(recognizerTimeout) {
		clearTimeout(recognizerTimeout);
	}
	recognizerTimeout = setTimeout(function () {
		console.log('stop listening…');
		recognition.stop();
	}, 2000);
}
function init() {

	bubbleContainer = document.getElementById('ui-bubble-container');
	text_area = document.getElementById('ui-text');
	start_button = document.getElementById('ui-record');
	start_button.addEventListener('click', startButton);

	final_span = document.getElementById('ui-final-span');
	interim_span = document.getElementById('ui-interim-span');

	recognition = new webkitSpeechRecognition();
	recognition.continuous = true;
	recognition.interimResults = true;

	recognition.onstart = function() {
		recognizing = true;
		showInfo('info_speak_now');

		start_button.classList.add('is-active');
		document.getElementById('ui-sound-record-animation').classList.add('is-active');

		document.getElementById('ui-form-answer').classList.add('is-hidden');


		waitForInput();
	};

	recognition.onerror = function(event) {
		if (event.error == 'no-speech') {
			showInfo('info_no_speech');
			ignore_onend = true;
		}
		if (event.error == 'audio-capture') {
			showInfo('info_no_microphone');
			ignore_onend = true;
		}
		if (event.error == 'not-allowed') {
			if (event.timeStamp - start_timestamp < 100) {
				showInfo('info_blocked');
			} else {
				showInfo('info_denied');
			}
			ignore_onend = true;
		}
	};

	recognition.onend = function() {
		recognizing = false;
		if (ignore_onend) {
			return;
		}

		start_button.classList.remove('is-active');
		document.getElementById('ui-sound-record-animation').classList.remove('is-active');
		document.getElementById('ui-form-answer').classList.remove('is-hidden');

		if (!final_transcript) {
			showInfo('info_click-to-start');
			return;
		}

		showInfo('info_end');

		submit(final_transcript);

		if (window.getSelection) {
			window.getSelection().removeAllRanges();
			var range = document.createRange();
			range.selectNode(final_span);
			window.getSelection().addRange(range);
		}
	};

	recognition.onresult = function(event) {
		var interim_transcript = '';
		console.log('onresult');
		waitForInput();
		for (var i = event.resultIndex; i < event.results.length; ++i) {
			if (event.results[i].isFinal) {
				final_transcript += event.results[i][0].transcript;
			} else {
				interim_transcript += event.results[i][0].transcript;
			}
		}
		final_transcript = capitalize(final_transcript);
		final_span.innerHTML = linebreak(final_transcript);
		interim_span.innerHTML = linebreak(interim_transcript);
	};
}


var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
	return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char = /\S/;
function capitalize(s) {
	return s.replace(first_char, function(m) { return m.toUpperCase(); });
}

function startButton(event) {
	if (recognizing) {
		recognition.stop();
		return;
	}
	final_transcript = '';
	recognition.lang = 'de-DE';
	recognition.start();
	// ignore_onend = false;
	final_span.innerHTML = '';
	interim_span.innerHTML = '';

	start_timestamp = event.timeStamp;
}

function start() {
	startButton({timeStamp: new Date()});
}


function showInfo(s) {
	console.log(s)
}
var voice;

function reply(text) {
	createBubble(text, 'question', 'images/hauke.jpg');

	// http://stackoverflow.com/questions/21947730/chrome-speech-synthesis-with-longer-texts
	try {
		window.speechSynthesis.cancel();
	} catch (e) {
		console.log(e);
	}

	var msg = new SpeechSynthesisUtterance(text);

	msg.lang = 'de-DE';
	msg.voice = voice;


	// on the end we will listen for some time for an answer.
	msg.onend = function () {
		console.log("start listening again");
		setTimeout(start, 1000);
	};
	msg.onerror = function() {
		console.log("humpf")
	};

	window.speechSynthesis.speak(msg);
}
function setupVoice() {
	voice = speechSynthesis.getVoices().filter(function(voice) {
				return voice.name == 'Google Deutsch';
			}
	)[0];

	if (voice === undefined) {
		voice = speechSynthesis.getVoices().filter(function(voice) {
					return voice.name == 'Anna (Enhanced)';
				}
		)[0];
	}
}

// the voices are loaded asynchronously
window.speechSynthesis.onvoiceschanged = setupVoice;


function submit(text) {
	var formData = {};

	formData.text = text;

	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/steuermann', true);
	xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhr.onload = function (e) {
		handleSteuermannResponse( JSON.parse(e.target.responseText));
	};

	xhr.send( JSON.stringify(formData) );
	createBubble(text, 'answer');
}

function formSubmit() {
	var text = text_area.value;
	if( text ) {
		text_area.value = '';
		submit(text)
	}
	return false; // prevent the page from reloading
}

function submitOnAltEnter(e) {
	var key = window.event ? e.keyCode : e.which;

	if( 13 == key && e.altKey ) {
		formSubmit()
	}
}

// attach handler to the keydown event of the document
document.addEventListener('keydown', submitOnAltEnter);


function handleSteuermannResponse(res) {
	showInfo(res);
	reply(res.text);
	if( res.command ) {
		if('clear' == res.command ) {
			bubbleContainer.innerHTML = "";
		}
	}
}


function createBubble(text, type, avatarSource) {
	avatarSource = avatarSource || "images/default-avatar.jpg";
	var bubble = document.createElement("div");
	bubble.classList.add('o-bubble');
	bubble.setAttribute('data-type', type);
	bubble.innerHTML = '<div class="o-bubble__inner"><p>' +
			text + '</p></div><img src="' + avatarSource + '" alt="" class="o-avatar o-avatar--small">';

	bubbleContainer.appendChild(bubble);

	bubble.scrollIntoView();
}


window.addEventListener ("load", init);