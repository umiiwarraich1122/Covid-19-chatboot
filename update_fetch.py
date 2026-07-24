import os, glob, re

base = 'd:/Internship/rag-chatbot-main/covid-intel-frontend/src/components'
for filepath in glob.glob(base + '/*.jsx'):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace fetch('/path') with fetch(`${import.meta.env.VITE_API_URL || ''}/path`)
    content = re.sub(r"fetch\(\s*'\/([^']+)'\s*([,\)])", r"fetch(`${import.meta.env.VITE_API_URL || ''}/\1`\2", content)
    
    # Replace fetch(`/path/...`) with fetch(`${import.meta.env.VITE_API_URL || ''}/path/...`)
    content = re.sub(r"fetch\(\s*`\/([^`]+)`\s*([,\)])", r"fetch(`${import.meta.env.VITE_API_URL || ''}/\1`\2", content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print('Updated frontend fetch calls')
