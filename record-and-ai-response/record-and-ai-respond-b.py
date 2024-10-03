import sounddevice as sd
import numpy as np
import time
import threading
import keyboard
import requests
import json
import os
import whisper

def record_audio(samplerate=16000, silence_duration=3, window_size=10, initial_threshold_multiplier=0.2):
    """
    Records audio continuously, adjusting the silence threshold dynamically in real-time.
    :param samplerate: The sample rate for audio recording (default: 16000).
    :param silence_duration: The duration (in seconds) of silence after which recording stops.
    :param window_size: The number of seconds of audio to consider for calculating the noise level.
    :param initial_threshold_multiplier: Multiplier for setting the initial silence threshold based on ambient noise.
    :return: Numpy array of the recorded audio.
    """
    recording = []
    audio_window = []  # To keep track of recent audio samples
    is_recording = True

    def callback(indata, frames, time, status):
        nonlocal recording, audio_window
        audio_window.append(np.linalg.norm(indata) * 10)
        recording.append(indata.copy())  # Store current frame
        
        # Maintain the size of the window
        if len(audio_window) > window_size * samplerate:
            audio_window.pop(0)

    print("Recording... Press 'q' to stop manually.")

    with sd.InputStream(samplerate=samplerate, channels=1, callback=callback):
        start_time = time.time()
        duration_of_silence = 0
        silence_threshold = None

        while duration_of_silence < silence_duration:
            if keyboard.is_pressed('q'):
                print("Recording stopped by keypress.")
                is_recording = False
                break

            # Calculate the average noise level
            if len(audio_window) > 0:
                average_noise_level = np.mean(audio_window)
                if silence_threshold is None:
                    silence_threshold = average_noise_level * initial_threshold_multiplier
                else:
                    # Dynamically update the threshold based on the average noise level
                    silence_threshold = (silence_threshold + average_noise_level * initial_threshold_multiplier) / 2

            # Monitor volume and detect silence
            if len(audio_window) > 0:
                volume_norm = np.linalg.norm(recording[-1]) * 10
                if volume_norm < silence_threshold:
                    duration_of_silence += len(recording[-1]) / samplerate
                else:
                    duration_of_silence = 0  # Reset silence duration if sound is detected

            time.sleep(0.1)  # Small delay to avoid high CPU usage

    print("Recording complete.")
    return np.concatenate(recording).flatten()

def transcribe_audio_with_whisper(audio, model_name="base"):
    """
    Transcribes audio using Whisper.
    :param audio: The audio data as a numpy array.
    :param model_name: The Whisper model to use (e.g., 'base', 'small', 'medium', 'large').
    :return: The transcript of the audio.
    """
    # Load Whisper model
    model = whisper.load_model(model_name)
    
    # # Save numpy audio array to a temporary WAV file
    # temp_wav_path = "temp_audio.wav"
    # whisper.utils.save_audio(temp_wav_path, audio)

    # Transcribe audio
    result = model.transcribe(audio, fp16=False)
    
    # # Clean up temporary file
    # os.remove(temp_wav_path)
    
    return result['text'].strip()

# Function to detect action based on keywords
def detect_action(transcript):
    actions = {
        'summarize': 'summarize',
        'make a todo': 'make_todo',
        'interrogate': 'interrogate',
        'prototype': 'prototype'
    }
    for key, action in actions.items():
        if transcript.lower().startswith(key) or transcript.lower().endswith(key):
            return action
    return 'none'

# Function to generate prompt based on action
def generate_prompt(action, transcript):
    if action == 'summarize':
        return f"Please summarize the following text:\n\n{transcript}"
    elif action == 'make_todo':
        return '''The following is a list of todo items I have to complete by the end of next week, can you create a plan to tackle them including what to do what days and when relevant, what steps I should complete as part of each task?\n\n{transcript}'''
    elif action == 'interrogate':
        return f"Ask detailed questions about the following idea to gain more insights:\n\n{transcript}"
    elif action == 'prototype':
        return f"Outline the steps to start the following idea, including code examples in the mentioned languages:\n\n{transcript}"
    else:
        return transcript

def transcribe_and_process_audio(audio, ollama_api_url):
    """
    Sends the audio data to Whisper for transcription and then sends the transcript to the Ollama API for processing.
    :param audio: The audio data as a numpy array.
    :param ollama_api_url: URL of the local Ollama API.
    """
    transcript = transcribe_audio_with_whisper(audio)
    print(f"Transcript: {transcript}")

    action = detect_action(transcript)
    prompt = generate_prompt(action, transcript)

    # Now send the transcript for further processing (e.g., summarization, task creation)
    process_transcript(prompt, ollama_api_url)

def process_transcript(transcript, api_url, model="deepseek-coder-v2:16b"):
    """
    Sends the transcript to the Ollama API for further processing and saves the result to a Markdown file.
    :param transcript: The transcript text.
    :param api_url: URL of the local Ollama API.
    """
    # Send the transcript to Ollama for actions like summarization, task creation, etc.
    headers = {'Content-Type': 'application/json'}
    payload = {'prompt': transcript, 'model': model, 'stream': False}  # Example action
    response = requests.post(api_url, headers=headers, data=json.dumps(payload))

    if response.status_code == 200:
        result = response.json()
        processed_result = result.get('response', '')
        print(f"Processed result: {processed_result}")
        context = result.get('context', '')

        headers = {'Content-Type': 'application/json'}
        payload = {'prompt': "Return a title for a note containing that responses text. The title should be able to be used in a filename", 'model': model, 'stream': False, 'context': context}  # Example action
        response = requests.post(api_url, headers=headers, data=json.dumps(payload))

        result = response.json()
        title = result.get('response', '')
        title = "".join(c for c in title if c.isalpha() or c.isdigit() or c==' ').rstrip()

        # Save the result to a Markdown file
        save_to_markdown_file(transcript, processed_result, title)
    else:
        print(f"Error: {response.status_code}, {response.text}")

def save_to_markdown_file(transcript, result, title, directory="C:\\Users\\phant\\Documents\\Obsidian\\02 - Areas\\AI Notes"):
    """
    Saves the transcript and processed result to a Markdown file.
    :param transcript: The original transcript.
    :param result: The processed result (e.g., summarized text).
    :param directory: Directory where the Markdown file will be saved.
    """
    if not os.path.exists(directory):
        os.makedirs(directory)

    timestamp = time.strftime("%Y%m%d_%H%M%S")
    filename = os.path.join(directory, f"{title}_{timestamp}.md")

    with open(filename, 'w') as file:
        file.write(f"# Transcript\n\n{transcript}\n\n")
        file.write(f"# Processed Result\n\n{result}\n")

    print(f"Result saved to {filename}")

if __name__ == "__main__":
    audio = record_audio(samplerate=16000, silence_duration=1.5, window_size=10, initial_threshold_multiplier=0.8)
    ollama_api_url = "http://localhost:11434/api/generate"  # Replace with your Ollama API endpoint
    transcribe_and_process_audio(audio, ollama_api_url)
