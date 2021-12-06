//import { keyboardLayout } from "./KeyboardLayout";

const Keyboard = {
  elements: {
    keyboardContainer: null,
    keysContainer: null,
    keys: [],
  },

  properties: {
    currentInput: null,
    currentCursorPosition: null,
    value: "",
    capsLock: false,
    shift: false,
    language: "en",
    speech: false,
    sound: false,
    dark: false,
    recognition: null,
  },

  eventHandlers: {
    oninput: null,
    onclose: null,
  },

  init(layout) {
    this.elements.keyboardContainer = document.createElement("div");
    this.elements.keysContainer = document.createElement("div");
    this.elements.keyboardContainer.classList.add(
      "keyboard",
      "keyboard--hidden"
    );
    this.elements.keysContainer.classList.add("keyboard__container");
    this.elements.keysContainer.appendChild(this._createKeys(layout));
    this.elements.keys =
      this.elements.keysContainer.querySelectorAll(".keyboard__key");
    this.elements.keyboardContainer.appendChild(this.elements.keysContainer);
    this.elements.keysContainer.addEventListener("click", (e) => {
      this._clickHandler(e);
    });
    document.body.appendChild(this.elements.keyboardContainer);

    const inputsList = document.querySelectorAll(".use-keyboard-input");

    inputsList.forEach((element) => {
      element.addEventListener("focus", () => {
        this.open(element, (currentValue, currentCursorPosition) => {
          element.value = currentValue;
          console.log("val", currentValue);
          this.setCursorPosition(element, currentCursorPosition);
        });
      });
    });

    inputsList.forEach((element) => {
      element.addEventListener("keypress", (e) => {
        this._updateValue(this.properties.currentCursorPosition, 0, e.key);
      });
    });
    this._setSpeechInput();
  },
  _triggerEvent(handlerName) {
    if (this.eventHandlers[handlerName]) {
      this.eventHandlers[handlerName](
        this.properties.value,
        this.properties.currentCursorPosition
      );
    }
  },
  _createKeys(layout) {
    const keyLayout = document.createDocumentFragment();
    for (const [key, value] of Object.entries(layout)) {
      const keyButton = document.createElement("button");
      keyButton.setAttribute("type", "button");
      keyButton.setAttribute("data-code", key);
      keyButton.classList.add("keyboard__key");
      switch (key) {
        case "Backspace":
          keyButton.classList.add("s-6");
          keyButton.innerHTML = key;

          break;
        case "Tab":
          keyButton.classList.add("s-6");
          keyButton.innerHTML = key;
          break;
        case "CapsLock":
          keyButton.classList.add("s-8");
          keyButton.innerHTML = key;
          break;
        case "Enter":
          keyButton.classList.add("s-8");
          keyButton.innerHTML = value.en.value;
          break;
        case "Shift":
          keyButton.classList.add("s-10");
          keyButton.innerHTML = key;
          break;
        case "ShiftRight":
          keyButton.classList.add("s-10");
          keyButton.innerHTML = key;
          break;
        case "Space":
          keyButton.classList.add("s-all");
          keyButton.innerHTML = value.en.value;
          break;

        default:
          keyButton.classList.add(["s-4"]);
          keyButton.textContent = value[this.properties.language].value;
          keyButton.value = keyButton.textContent;
          break;
      }
      keyLayout.appendChild(keyButton);
    }
    return keyLayout;
  },

  _clickHandler(e) {
    if (e.target.classList.contains("keyboard__key")) {
      this.properties.currentCursorPosition =
        this.properties.currentInput.selectionStart;
      console.log(this.properties.currentCursorPosition);
      switch (e.target.getAttribute("data-code")) {
        case "Shift":
          this._toggleShift();
          break;
        case "CapsLock":
          this._toggleCapsLock();
          break;
        case "Backspace":
          this._updateValue(this.properties.currentCursorPosition - 1, 1);
          this.properties.currentCursorPosition++;
          this._triggerEvent("oninput");
          break;
          break;
          case "Lang":
          this._toggleLang();
          break;
        case "Mic":
          this._toggleSpeech();
          break;
        case "ArrowRight":
          if (
            this.properties.currentCursorPosition < this.properties.value.length
          ) {
            this.properties.currentCursorPosition++;
            this._triggerEvent("oninput");
          }
          break;
        case "ArrowLeft":
          if (this.properties.currentCursorPosition > 0) {
            this.properties.currentCursorPosition--;
          }
          this._triggerEvent("oninput");
          break;
          case "Tab":
            this._updateValue(
              this.properties.currentCursorPosition,
              0,
              "  "
            );
            this.properties.currentCursorPosition+=2;
            this._triggerEvent("oninput");
          break;
          case "Enter":
            this._updateValue(
              this.properties.currentCursorPosition,
              0,
              '\n'
            );
            this.properties.currentCursorPosition++;
            this._triggerEvent("oninput");
          break;
        case "Sound":
          // handle sound
          break;
        case "Theme":
          // handle theme
          break;
        case "Hide":
          this.close();
          break;

        default:
          this._updateValue(
            this.properties.currentCursorPosition,
            0,
            e.target.textContent
          );
          this.properties.currentCursorPosition++;
          this._triggerEvent("oninput");
          break;
      }
    }
  },
  _updateKeyContent() {
    this.elements.keys.forEach((key) => {
      const keyCode = key.getAttribute("data-code");
      if (this.properties.shift) {
        const shiftValue =
          keyboardLayout[keyCode][this.properties.language].shift;
        if (shiftValue) {
          key.textContent = shiftValue;
        }
      } else {
        key.textContent =
          keyboardLayout[keyCode][this.properties.language]?.value;
      }
    });
  },
  _updateValue(pos, del, key = "") {
    const tmp = this.properties.value.split("");
    tmp.splice(pos, del, key);
    this.properties.value = tmp.join("");
  },

  _setSpeechInput() {
    this.properties.recognition = new SpeechRecognition();
    this.properties.recognition.interimResults = true;
    this.properties.recognition.lang = "en-US";
    this.properties.recognition.addEventListener("result", (e) => {
      const transcript = Array.from(e.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");
      if (e.results[0].isFinal) {
        let key = ` ${transcript}`;
        this._updateValue(this.properties.currentCursorPosition, 0, key);
        this.properties.currentCursorPosition = this.properties.currentCursorPosition + key.length;
        this._triggerEvent("oninput");
      }
    });
  },
  _toggleShift() {
    this.properties.shift = !this.properties.shift;
    this._updateKeyContent();
  },
  _toggleCapsLock() {
    this.properties.capsLock = !this.properties.capsLock;
    this.properties.capsLock
      ? this.elements.keys.forEach(
          (key) => (key.textContent = key.textContent.toUpperCase())
        )
      : this.elements.keys.forEach(
          (key) => (key.textContent = key.textContent.toLowerCase())
        );
  },
  _toggleLang() {
    this.properties.language === "en"
      ? (this.properties.language = "ru")
      : (this.properties.language = "en");
       this._updateKeyContent();
  },
  _toggleSpeech(){
    this.properties.speech = !this.properties.speech;
    if(this.properties.speech){
      this.properties.recognition.lang = this.properties.language=='en'? 'en-US':'ru-RU';
      this.properties.recognition.addEventListener('end',  this.properties.recognition.start);
      this.properties.recognition.start();
    }else{
      this.properties.recognition.removeEventListener('end', this.properties.recognition.start);
      this.properties.recognition.stop();
     }


  },
  ///TODO
  _toggleSound() {
    this.properties.sound = !this.properties.sound;
  },
  _toggleTheme() {
    this.properties.dark = !this.properties.dark;
  },

  setCursorPosition(input, position) {
    if (input.setSelectionRange) {
      input.focus();
      input.setSelectionRange(position, position);
    } else if (input.createTextRange) {
      var range = input.createTextRange();
      range.collapse(true);
      range.moveEnd("character", position);
      range.moveStart("character", position);
      range.select();
    }
  },

  open(input, oninput, onclose) {
    this.properties.currentInput = input;
    this.properties.value = input.value || "";
    this.eventHandlers.oninput = oninput;
    this.eventHandlers.onclose = onclose;
    this.elements.keyboardContainer.classList.remove("keyboard--hidden");
  },

  close() {
    this.properties.currentInput = null;
    this.properties.value = "";
    this.eventHandlers.oninput = null;
    this.eventHandlers.onclose = null;
    this.elements.keyboardContainer.classList.add("keyboard--hidden");
  },
};

window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
window.addEventListener("DOMContentLoaded", function () {
  Keyboard.init(keyboardLayout);
});
