import whisper
import sounddevice as sd
import numpy as np
import difflib
import time
import wave
import keyboard
import os
import re

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

# 2. Transcription using Whisper
def transcribe_audio(audio_file):
    
    print(f"Transcribing audio... {os.path.exists(audio_file)}")
    model = whisper.load_model("base")  # Use the base model for quick results
    result = model.transcribe(audio_file, fp16=False)
    transcription = result['text'].strip()
    print("Transcription complete.")
    return transcription

# 3. Compare Script to Transcription
def compare_scripts(original_script, transcribed_script):
    # Tokenize and compare using difflib
    original_words = original_script.split()
    transcribed_words = transcribed_script.split()
    
    # Calculate accuracy
    matcher = difflib.SequenceMatcher(None, original_words, transcribed_words)
    accuracy = matcher.ratio() * 100  # Percentage match
    
    # Visual representation of what was wrong
    diff = difflib.ndiff(original_words, transcribed_words)
    diff_output = "\n".join(diff)
    
    return accuracy, diff_output

# 4. Display Result
def display_result(accuracy, diff_output):
    print(f"\nAccuracy: {accuracy:.2f}%")
    print("\nDifferences between original and transcription:")
    print(diff_output)

# Main function
def main():
    # Step 1: Input script
    original_script = re.sub(r'\W+', '', input("Enter the script to be read: ")).lower()

    # Step 2: Record audio
    audio_file = record_audio()

    time.sleep(1)

    # Step 3: Transcribe the recorded audio
    transcribed_script = re.sub(r'\W+', '', transcribe_audio(audio_file)).lower()

    print("Transcribed: " + transcribed_script)

    # Step 4: Compare original script with transcribed script
    accuracy, diff_output = compare_scripts(original_script, transcribed_script)

    # Step 5: Show the results
    display_result(accuracy, diff_output)

if __name__ == "__main__":
    main()
