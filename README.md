# VoiceCtrl — Voice Controlled Web Application

**IT329 Advanced Web Technologies**  
King Saud University · College of Computer and Information Sciences  
Department of Information Technology

---

## Overview

VoiceCtrl is a fully browser-based voice-controlled web application built as a live demo for an emerging web technologies presentation. It demonstrates the complete workflow of a voice-controlled web app:

**Voice Input → Speech-to-Text → Command Processing → Page Action**

---

## Features

- 🎙 **Speech Recognition** — captures voice input via the browser microphone
- 🔊 **Voice Command Processing** — recognizes commands and performs real actions on the page
- 🌐 **Fully Browser-Based** — works entirely client-side with no server needed
- ✨ **Particle Sphere Intro** — animated 3D rotating particle ball that morphs into the listening ring
- 💡 **Glowing Ring UI** — Alexa-style ring that reacts to listening state and displays recognized speech
- 🌙 **Dark / Light Mode** — toggled by voice
- 📱 **No installation required** — open and run in Chrome

---

## Voice Commands

| Command | Action |
|---|---|
| `"hello"` | Displays a greeting message |
| `"dark mode"` | Switches the page to dark theme |
| `"light mode"` | Switches back to light theme |
| `"change color"` | Randomly changes the background color |
| `"open google"` | Opens Google in a new tab |
| `"refresh page"` | Reloads the page and replays the intro |

---


## Technology Used

| Technology | Purpose |
|---|---|
| **Web Speech API** (`SpeechRecognition`) | Converts voice to text |
| **HTML5 Canvas** | Renders the particle sphere intro animation |
| **CSS Custom Properties** | Manages light/dark theme switching |
| **Vanilla JavaScript** | Command processing and DOM manipulation |
| **Google Fonts** | Orbitron + Exo 2 for the futuristic UI |

---

## How It Works (Technical Flow)

```
1. User clicks "TAP TO SPEAK"
        ↓
2. SpeechRecognition.start() activates the microphone
        ↓
3. Browser captures audio and converts it to text (transcript)
        ↓
4. transcript is passed to processCommand()
        ↓
5. if/else checks match the transcript to a known command
        ↓
6. The matching action is executed on the webpage
```

---

## Browser Support

| Browser | Supported |
|---|---|
| Google Chrome | ✅ Full support |
| Microsoft Edge | ✅ Full support |
| Firefox | ❌ Not supported |
| Safari | ❌ Not supported |

---

## Presentation Notes

This project was built as a **live demo** for a 15-minute university presentation on Voice-Controlled Web Applications as an emerging web technology. This simple demo show how the Web Speech API tool works.

---

*King Saud University — IT329 Advanced Web Technologies*
