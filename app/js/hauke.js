var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;


var start_button;
var recognition;
var final_span;
var interim_span;

function init() {

	start_button = document.getElementById('ui-record');
	start_button.addEventListener('click', startButton);

	final_span = document.getElementById('ui-final-span');
	interim_span = document.getElementById('ui-interim-span');

	recognition = new webkitSpeechRecognition();
	// recognition.continuous = true;
	recognition.interimResults = true;

	recognition.onstart = function() {
		recognizing = true;
		showInfo('info_speak_now');

		document.querySelector('#ui-sound-record-animation').classList.add('is-active');
		document.querySelector('#ui-record').classList.add('is-active');
		document.querySelector('#ui-form-answer').classList.add('is-hidden');
	};

	recognition.onerror = function(event) {
		if (event.error == 'no-speech') {
			// start_img.src = 'mic.gif';
			showInfo('info_no_speech');
			ignore_onend = true;
		}
		if (event.error == 'audio-capture') {
			// start_img.src = 'mic.gif';
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

		document.querySelector('#ui-sound-record-animation').classList.remove('is-active');
		document.querySelector('#ui-record').classList.remove('is-active');
		document.querySelector('#ui-form-answer').classList.remove('is-hidden');

		if (!final_transcript) {
			showInfo('info_click-to-start');
			return;
		}

		showInfo('info_end');

		submit(final_transcript, function (res) {
			showInfo(res);
			reply(res.text);
		});

		if (window.getSelection) {
			window.getSelection().removeAllRanges();
			var range = document.createRange();
			range.selectNode(final_span);
			window.getSelection().addRange(range);
		}
	};

	recognition.onresult = function(event) {
		var interim_transcript = '';
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
	ignore_onend = false;
	final_span.innerHTML = '';
	interim_span.innerHTML = '';

	// start_img.src = 'mic-slash.gif';
	start_timestamp = event.timeStamp;
}


function showInfo(s) {
	console.log(s)
}
var voice;

function reply(text) {
	var msg = new SpeechSynthesisUtterance(text);

	msg.lang = 'de-DE';
	msg.voice = voice;
	window.speechSynthesis.speak(msg);
}
function setupVoice() {
	voice = speechSynthesis.getVoices().filter(function(voice) {
				return voice.name == 'Google Deutsch';
			}
	)[0];
}

// the voices are loaded asynchronously
window.speechSynthesis.onvoiceschanged = setupVoice;

function createGUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
}


function submit(text, callback) {
	var formData = {};

	formData.text = text;
	formData.userId = createGUID();

	var xhr = new XMLHttpRequest();
	// xhr.open('POST', '/hauke/message', true);
	xhr.open('POST', '/echo', true);
	xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhr.onload = function (e) {
		callback( JSON.parse(e.target.responseText));
	};

	xhr.send( JSON.stringify(formData) );
}

window.addEventListener ("load", init);


