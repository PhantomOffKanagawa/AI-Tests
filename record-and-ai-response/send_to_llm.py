import openai

def send_to_llm(prompt):
    openai.api_key = 'YOUR_OPENAI_API_KEY'
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500
    )
    return response.choices[0].message['content'].strip()
