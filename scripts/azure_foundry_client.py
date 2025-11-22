import os
from openai import OpenAI

client = OpenAI(
    base_url="https://jerem-md7wzrrg-eastus2.services.ai.azure.com/openai/v1/",
    api_key=os.environ["AZURE_OPENAI_API_KEY"],
)

response = client.chat.completions.create(
    model="gpt-5-mini",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is the capital of France?"},
    ],
    temperature=0.7,
)

print(response.choices[0].message["content"])
