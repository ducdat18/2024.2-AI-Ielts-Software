from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer, AutoModelForSequenceClassification
from fastapi.middleware.cors import CORSMiddleware
import torch

# create structure for body request
class EssayRequest(BaseModel):
    question: str
    score: str

class EssayEvaluateScore(BaseModel):
    question: str
    essay: str

checkpoint_gen_path = "./gpt_ielts/checkpoint-8170"
checkpoint_evalscore_path = "./eval_score"

# Load the tokenizer
gen_tokenizer = AutoTokenizer.from_pretrained(checkpoint_gen_path)
eval_tokenizer = AutoTokenizer.from_pretrained(checkpoint_evalscore_path)

# Load the model
gen_model = AutoModelForCausalLM.from_pretrained(checkpoint_gen_path)
eval_model = AutoModelForSequenceClassification.from_pretrained(checkpoint_evalscore_path)

device = "cuda" if torch.cuda.is_available() else "cpu"
# print(device)
gen_model = gen_model.to(device)
eval_model = eval_model.to(device)
app = FastAPI()

origins = [
    "http://localhost:5173",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_ielts_essay(question, overall, max_length=512):
    gen_model.eval()
    input_text = f"From the topic: {question}\n Band: {overall}.\n Please write the essay for that question: \n"
    input_ids = gen_tokenizer(input_text, return_tensors="pt").input_ids.to(device)
    output_ids = gen_model.generate(
        input_ids,
        eos_token_id=gen_tokenizer.convert_tokens_to_ids('[END]'),
        max_length=max_length,
        num_beams=5,
        no_repeat_ngram_size=3,  # To prevent repetition
        early_stopping=True,
        temperature=0.3,  # For controlled creativity
        top_p=0.85,        # Top-p sampling
        top_k=50,         # Top-k sampling
        do_sample=True    # Enable sampling
    )
    generated_text = gen_tokenizer.decode(output_ids[0], skip_special_tokens=True)
    if generated_text.startswith(input_text):
        generated_text = generated_text[len(input_text):].lstrip()
    if '[END]' in generated_text:
        generated_text = generated_text.split('[END]')[0].rstrip()
    return generated_text
def predictScore(question_text: str, answer_text: str):
    merged = question_text + eval_tokenizer.sep_token + answer_text
    id2label = {0: "3.0",
                1: "4.0",
                2: "4.5",
                3: "5.0",
                4: "5.5",
                5: "6.0",
                6: "6.5",
                7: "7.0",
                8: "7.5",
                9: "8.0",
                10: "8.5",
                11: "9.0"}
    enc = eval_tokenizer(
        merged,
        max_length=512,
        truncation=True,
        return_tensors="pt"  
    )
    enc = {k: v.to(device) for k, v in enc.items()}

    eval_model.eval()
    with torch.no_grad():
        logits = eval_model(**enc).logits.squeeze(0)   

    probs   = torch.softmax(logits, dim=-1).cpu().numpy()
    pred_id = int(probs.argmax())

    pred_label = id2label[pred_id]

    return pred_label
def generate_ielts_evaluation(prompt, essay, max_length=1024):
    gen_model.eval()
    score = predictScore(prompt, essay)
    input_text = f"From the topic: {prompt}.\n Essay: {essay}\n Band: {score}.\n Please write the evaluation for that essay: \n"
    input_ids = gen_tokenizer(input_text, return_tensors="pt").input_ids.to(device)
    output_ids = gen_model.generate(
        input_ids,
        max_length=max_length,
        no_repeat_ngram_size=4,
        temperature=0.7,
        top_p=0.9,
        top_k=50,
        do_sample=True,
        eos_token_id=gen_tokenizer.convert_tokens_to_ids('[END]'),
        early_stopping=False
    )
    generated_text = gen_tokenizer.decode(output_ids[0], skip_special_tokens=True)
    if generated_text.startswith(input_text):
        generated_text = generated_text[len(input_text):].lstrip()
    if '[END]' in generated_text:
        generated_text = generated_text.split('[END]')[0].rstrip()
    return generated_text

@app.post("/generate_essay")
def generate_essay(request: EssayRequest):
    essay = generate_ielts_essay(request.question, request.score)
    return {"essay": essay}
@app.post("/generate_evaltext")
def generate_evaltext(request: EssayEvaluateScore):
    eval_text = generate_ielts_evaluation(request.question, request.essay)
    return {"evaluation_text": eval_text}
@app.post("/evaluate")
def evaluate_essay(request: EssayEvaluateScore):
    score = predictScore(request.question, request.essay)
    return {"score": score}