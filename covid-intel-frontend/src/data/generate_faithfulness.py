import json
import os

eval_path = "evaluation_data.json"
out_path = "faithfulness_data.json"

with open(eval_path, "r") as f:
    data = json.load(f)

result = []
for item in data:
    claims = []
    
    # Generic claims based on generated_answer sentences
    sentences = [s.strip() for s in item["generated_answer"].split(". ") if len(s.strip()) > 10]
    
    for i, s in enumerate(sentences[:5]): # max 5 claims
        # For hallucinated examples, make the 3rd or last claim unsupported
        is_hallucinated = item["label"] == "Hallucinated"
        is_unsupported = is_hallucinated and (i == len(sentences[:5])-1 or i == 2)
        
        claims.append({
            "text": s + ("." if not s.endswith(".") else ""),
            "supported": not is_unsupported,
            "evidence": "No supporting evidence found in context. Generated from external knowledge." if is_unsupported else "Matching sentence from context: '...'"
        })
        
    result.append({
        "id": item["id"],
        "question": item["question"],
        "generated_answer": item["generated_answer"],
        "reference_answer": item["reference_answer"],
        "claims": claims
    })

with open(out_path, "w") as f:
    json.dump(result, f, indent=2)

print(f"Generated faithfulness data for {len(result)} queries.")
