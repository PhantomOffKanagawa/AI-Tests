import os
import whisper
import pyaudio
import wave
from datetime import datetime

# Constants
ACTIONS = ["summarize", "todo", "interrogate", "prototype"]
RECORD_SECONDS = 10
WAVE_OUTPUT_FILENAME = "recording.wav"

# Function to record audio
def record_audio():
    chunk = 1024  # Record in chunks of 1024 samples
    sample_format = pyaudio.paInt16  # 16 bits per sample
    channels = 1
    fs = 44100  # Record at 44100 samples per second
    p = pyaudio.PyAudio()  # Create an interface to PortAudio

    print("Recording...")
    stream = p.open(format=sample_format,
                    channels=channels,
                    rate=fs,
                    frames_per_buffer=chunk,
                    input=True)
    frames = []  # Initialize array to store frames

    # Store data in chunks for RECORD_SECONDS seconds
    for i in range(0, int(fs / chunk * RECORD_SECONDS)):
        data = stream.read(chunk)
        frames.append(data)

    # Stop and close the stream
    stream.stop_stream()
    stream.close()
    p.terminate()

    print("Finished recording.")

    # Save the recorded data as a WAV file
    wf = wave.open(WAVE_OUTPUT_FILENAME, 'wb')
    wf.setnchannels(channels)
    wf.setsampwidth(p.get_sample_size(sample_format))
    wf.setframerate(fs)
    wf.writeframes(b''.join(frames))
    wf.close()

# Function to transcribe audio using Whisper
def transcribe_audio(model):
    print("Transcribing audio...")
    result = model.transcribe(WAVE_OUTPUT_FILENAME)
    transcript = result["text"]
    print(f"Transcript: {transcript}")
    return transcript

# Function to detect action keywords
def detect_action(transcript):
    transcript_lower = transcript.lower()
    for action in ACTIONS:
        if action in transcript_lower:
            return action
    return None

# Function to generate prompts based on action
def generate_prompt(transcript, action):
    if action == "summarize":
        return f"Summarize the following text: {transcript}"
    elif action == "todo":
        return f"Create a todo list from the following text: {transcript}"
    elif action == "interrogate":
        return f"Ask questions about the following text to get more details: {transcript}"
    elif action == "prototype":
        return f"Outline steps to start the idea, including code examples in mentioned languages: {transcript}"
    return None

# Save transcript and response
def save_transcript_and_response(transcript, response, action):
    timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    filename = f"transcript_{timestamp}.txt"
    with open(filename, "w") as file:
        file.write(f"Original Transcript:\n{transcript}\n")
        file.write(f"\nAction: {action}\nResponse:\n{response}\n")
    print(f"Transcript and response saved as {filename}")

# Simulated LLM interaction (for now)
def get_response_from_llm(prompt):
    # Simulated response generation (replace this with actual LLM calls)
    return f"Simulated response to: {prompt}"

# Main function
def main():
    # Load Whisper model
    model = whisper.load_model("base")

    # Step 1: Record audio
    record_audio()

    # Step 2: Transcribe audio
    transcript = transcribe_audio(model)

    # Step 3: Detect action from transcript
    action = detect_action(transcript)
    if not action:
        print("No valid action detected in transcript.")
        return
    
    # Step 4: Generate the appropriate prompt
    prompt = generate_prompt(transcript, action)
    print(f"Generated Prompt: {prompt}")

    # Step 5: (Simulated) Send prompt to LLM and get response
    response = get_response_from_llm(prompt)
    print(f"Response from LLM: {response}")

    # Step 6: Save transcript and response
    save_transcript_and_response(transcript, response, action)

if __name__ == "__main__":
    main()
