var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;


var start_button;
var recognition;
var final_span;
var interim_span;

function init() {

	start_button = document.querySelector('#ui-record');
	start_button.addEventListener('click', startButton);

	final_span = document.querySelector('#final_span');
	interim_span = document.querySelector('#interim_span');

	recognition = new webkitSpeechRecognition();
	// recognition.continuous = true;
	recognition.interimResults = true;

	recognition.onstart = function() {
		recognizing = true;
		showInfo('info_speak_now');

		document.querySelector('#ui-sound-record-animation').classList.add('is-active');
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
		
		if (!final_transcript) {
			showInfo('info_click-to-start');
			return;
		}
		showInfo('info_end');

		document.querySelector('#ui-sound-record-animation').classList.remove('is-active');

		reply(final_transcript);

		if (window.getSelection) {
			window.getSelection().removeAllRanges();
			var range = document.createRange();
			range.selectNode(document.getElementById('final_span'));
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

var gDeutsch;
function reply(text) {
	var msg = new SpeechSynthesisUtterance('Du sagtest:' + text);

	msg.lang = 'de-DE';
	msg.voice = gDeutsch;
	window.speechSynthesis.speak(msg);
}

// the voices are loaded asynchronously
window.speechSynthesis.onvoiceschanged = function() {
	gDeutsch = speechSynthesis.getVoices().filter(function(voice) {
		return voice.name == 'Google Deutsch';
	}
	)[0];
};

function showInfo(s) {
	console.log(s)
}

window.addEventListener ("load", init);


