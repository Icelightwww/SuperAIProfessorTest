const apiKey = "fk201173-O6vIx81J8OUtiWTUNNEnJTxeW0iZ1UBX";
const chatapiUrl = "https://api.openai.com/v1/engines/davinci-codex/completions";

var onRecognizing = false;
var spacePressing = false;
var recognizedWords = "";

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || window.webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent
let voices = window.speechSynthesis.getVoices();
var recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.lang = 'en-US';
recognition.interimResults = true;
recognition.maxAlternatives = 5;

var diagnostic = document.querySelector('.output');
var bg = document.querySelector('html');
var hints = document.querySelector('.hints');
var dictateButton = document.querySelector('.dictateButton');
var AIFeedback = document.querySelector('.AIFeedback');


dictateButton.onclick = function () {
  // console.log(onRecognizing);
  if (onRecognizing===false) {
    recognition.start();
    onRecognizing = true;
    // dictateButton.disabled = true;
    dictateButton.textContent = 'Recognizing...';
    diagnostic.textContent = '-Keep talking-';
    console.log('Ready to receive a color command.');
  }else if (onRecognizing===true) {
    recognition.stop();
    onRecognizing = false;
    // dictateButton.disabled = false;
    dictateButton.textContent = 'Tap to start dictating';
  }
  
}
document.addEventListener('keydown', function(event) {
  if (event.key === ' ' && onRecognizing === false) {
    // Your JavaScript code here
    dictateButton.onclick();
    spacePressing = true;
    console.log("Detected Keydown");
  }
});
document.addEventListener('keyup', function(event) {
  if (event.key === ' ') {
    // Your JavaScript code here
    if (onRecognizing === true) {
      dictateButton.onclick();
    }
    spacePressing = false;
    console.log("Detected Keyup");
    // console.log(onRecognizing);
  }
});
recognition.onresult = function (event) {
  // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
  // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
  // It has a getter so it can be accessed like an array
  // The first [0] returns the SpeechRecognitionResult at the last position.
  // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
  // These also have getters so they can be accessed like arrays.
  // The second [0] returns the SpeechRecognitionAlternative at position 0.
  // We then return the transcript property of the SpeechRecognitionAlternative object
  // var recognizedWords = event.results[0][0].transcript;
  recognizedWords = Array.from(event.results)
    .map((result) => result[0].transcript)
    .join('');
  diagnostic.textContent = 'Your words: ' + recognizedWords;
  console.log('Confidence: ' + event.results[0][0].confidence);




}

recognition.onspeechend = function (event) {
  // recognition.stop();
  // dictateButton.textContent = 'Tap to start dictating';
  goAI(recognizedWords, true);
}

recognition.onnomatch = function (event) {
  // diagnostic.textContent = "I didn't recognise that color.";
}

recognition.onerror = function (event) {
  // diagnostic.textContent = 'Error occurred in recognition: ' + event.error;
  diagnostic.textContent = 'Some errors occured. Please try again later.'
}



function readOutLoud(message) {
  var speech = new SpeechSynthesisUtterance();

  //设置朗读内容和属性
  speech.text = message;
  speech.volume = 1;
  speech.rate = 1;
  speech.pitch = 1;

  window.speechSynthesis.speak(speech);
}

function goTTS(text) {
  const params = {
    token: 'ttsmaker_demo_token',
    text: text,
    voice_id: 778,
    audio_format: 'wav',
    audio_speed: 1.0,
    audio_volume: 0,
    text_paragraph_pause_time: 0
  };
  // 'I am very happy to be your professor.'
  const proxyUrl = 'https://cors-anywhere.herokuapp.com/';


  fetch('https://api.ttsmaker.com/v1/create-tts-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      const audioUrl = data.audio_file_url;
      fetch(proxyUrl + audioUrl)
        .then(response => response.blob())
        .then(blob => {
          const audio = new Audio(URL.createObjectURL(blob));
          audio.play();
        })
        .catch(error => console.log(error));
    })
    .catch(error => console.log(error));

}
function goAI(recognizedWords, testing) {
    //发送信息到API
    console.log('Ready to send data to OpenAI...');
  const postData = JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: recognizedWords }],
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + apiKey,
    },
    body: postData,
  };
  if (testing===false) {
    console.log("Now send data to GPT");
    //OK Below
  fetch('https://openai.api2d.net/v1/chat/completions', options)
  // .then(response => {
  //   console.log('statusCode:', response.status);
  //   console.log('headers:', response.headers);
  //   return response.json();
  // })
  .then(response => response.json())
  .then(data => {
    var feedback = data.choices[0].message.content;
    goTTS(feedback);
    AIFeedback.textContent = 'AI Professor: ' + feedback;
    console.log('Response is successfully received.');
    console.log(data);
    console.log(feedback);
  })
  .catch(error => {
    console.error('Failed to get response. ' + error);
    AIFeedback.textContent = 'Sorry, AI Professor cannot respond you now.';
  });
  console.log('Words are sent to OpenAI.');
//OK Above
  }else {
    console.log("Not sending");
  }
  
}