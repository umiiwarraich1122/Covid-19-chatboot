import asyncio
import os
import sys

# Change dir to backend to ensure .env is loaded correctly
os.chdir(os.path.dirname(os.path.abspath(__file__)))

import rag

async def main():
    print("Testing Upload...")
    try:
        # Create a dummy text file
        dummy_content = b"COVID-19 is an infectious disease caused by the SARS-CoV-2 virus."
        chunks_added = rag.add_document("test_covid.txt", dummy_content)
        print(f"Chunks added: {chunks_added}")
    except Exception as e:
        print(f"Upload failed: {e}")

    print("\nTesting Get Documents...")
    try:
        docs = rag.get_documents()
        print(f"Docs: {docs}")
    except Exception as e:
        print(f"Get Docs failed: {e}")

    print("\nTesting Chat...")
    try:
        async for chunk in rag.consultation_pipeline("tell me about covid 19"):
            sys.stdout.write(chunk)
            sys.stdout.flush()
        print("\nChat finished.")
    except Exception as e:
        print(f"Chat failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
