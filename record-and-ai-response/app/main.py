from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.uix.textinput import TextInput
import sounddevice as sd
import numpy as np
import whisper
import threading
import time

class AudioRecorderApp(App):
    def build(self):
        self.audio_data = []
        self.is_recording = False
        layout = BoxLayout(orientation='vertical')

        self.label = Label(text='Press "Start Recording" to begin.')
        layout.add_widget(self.label)

        start_button = Button(text='Start Recording')
        start_button.bind(on_press=self.start_recording)
        layout.add_widget(start_button)

        stop_button = Button(text='Stop Recording')
        stop_button.bind(on_press=self.stop_recording)
        layout.add_widget(stop_button)

        self.transcript_input = TextInput(hint_text='Transcript will appear here...', multiline=True)
        layout.add_widget(self.transcript_input)

        return layout

    def start_recording(self, instance):
        self.audio_data = []
        self.is_recording = True
        self.label.text = 'Recording...'
        threading.Thread(target=self.record_audio).start()

    def stop_recording(self, instance):
        self.is_recording = False
        self.label.text = 'Processing...'
        self.process_audio()

    def record_audio(self):
        samplerate = 16000
        def callback(indata, frames, time, status):
            if self.is_recording:
                self.audio_data.append(indata.copy())

        with sd.InputStream(samplerate=samplerate, channels=1, callback=callback):
            while self.is_recording:
                time.sleep(0.1)

    def process_audio(self):
        audio = np.concatenate(self.audio_data).flatten()
        model = whisper.load_model("base")
        result = model.transcribe(audio, fp16=False)
        transcript = result['text'].strip()
        self.transcript_input.text = transcript

if __name__ == '__main__':
    AudioRecorderApp().run()
