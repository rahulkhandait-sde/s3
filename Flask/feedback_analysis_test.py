import json
import torch
import torch.nn as nn
from transformers import DistilBertTokenizer, DistilBertModel
from sentence_transformers import SentenceTransformer, util
from collections import defaultdict
from dotenv import load_dotenv
import google.generativeai as genai
import os

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Define Sentiment Analysis Model
class SentimentModel(nn.Module):
    def __init__(self):
        super(SentimentModel, self).__init__()
        self.bert = DistilBertModel.from_pretrained("distilbert-base-uncased")
        self.fc = nn.Linear(self.bert.config.hidden_size, 3)  # 3 classes: Positive, Negative, Neutral

    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        hidden_state = outputs.last_hidden_state[:, 0, :]  # CLS token representation
        return self.fc(hidden_state)
    
# Load tokenizer and model
tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")
model = SentimentModel()

device = ("cuda" if torch.cuda.is_available() else "cpu")
model.load_state_dict(torch.load("feedback_analysis_bert.pth", map_location=device))
model.to(device)
model.eval()

# Load dataset with existing feedbacks and policy matches
with open("training_nlp.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Extract feedback texts and policy matches
feedback_texts = [item["feedback"] for item in data]
policy_matches = [item["policy_match"] for item in data]

# Load Sentence Transformer Model for Policy Matching
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# Encode all existing feedbacks
feedback_embeddings = embedding_model.encode(feedback_texts, convert_to_tensor=True)

def predict_sentiment(feedback_text):
    """Predicts sentiment class for a given feedback."""
    tokens = tokenizer(feedback_text, padding="max_length", truncation=True, max_length=50, return_tensors="pt")
    tokens = {key: val.to(device) for key, val in tokens.items()}  # Move to device

    with torch.no_grad():
        output = model(tokens["input_ids"], tokens["attention_mask"])
        sentiment_idx = torch.argmax(output).item()

    return {1: "Positive", 0: "Negative", 2: "Neutral"}[sentiment_idx]

def predict_policy_match(new_feedback):
    """Finds the closest policy match using text similarity."""
    new_feedback_embedding = embedding_model.encode(new_feedback, convert_to_tensor=True)

    # Compute cosine similarities
    similarities = util.pytorch_cos_sim(new_feedback_embedding, feedback_embeddings)

    # Get the index of the most similar feedback
    best_match_idx = torch.argmax(similarities).item()

    # Return the corresponding policy match
    return policy_matches[best_match_idx]

# Example Feedback to Test
# new_feedback = "The Washroom facility is simply horrible."

# Predict Sentiment
# predicted_sentiment = predict_sentiment(new_feedback)

# Predict Policy Match
# predicted_policy = predict_policy_match(new_feedback)

# Output Results
# print("New Feedback:", new_feedback)
# print("Predicted Sentiment:", predicted_sentiment)
# print("Predicted Policy Match:", predicted_policy)

def cluster_by_policy(objects):
    clustered = defaultdict(list)  # Use defaultdict for easy grouping

    for obj in objects:
        policy = obj['predicted_policy']
        clustered[policy].append(obj)

    result = []
    for policy, group in clustered.items():
        result.append(group)  # Each group is a list of objects

    return result



def analyze_feedback(feed_back_arr):
    feedback_analysis_data = []
    for feedback in feed_back_arr:
        predicted_sentiment = predict_sentiment(feedback)
        predicted_policy = predict_policy_match(feedback)
        feedback_analysis_data.append({'predicted_sentiment': predicted_sentiment, 'predicted_policy': predicted_policy[0], 'feedback': feedback})

    feedback_analysis_data = [fb for fb in feedback_analysis_data if fb['predicted_sentiment'] != 'Positive']
    
    feedback_analysis_data_clustered = cluster_by_policy(feedback_analysis_data)

    gen_response_summary = []
    for certain_policy_feedback_arr in feedback_analysis_data_clustered:
        policy = certain_policy_feedback_arr[0]['predicted_policy']
        fb_list = []
        for i in certain_policy_feedback_arr:
            fb_list.append(i['feedback'])
        fb = " ".join(fb_list)
        sentiment = certain_policy_feedback_arr[0]['predicted_sentiment']
        prompt = f"""I'm giving you a string of feedbacks where the feedbacks are seperated by space. It is given here: ***{fb}***. Here all these feedback have negative sentiments i.e they are complaints or bad reviews. You have to give me a summarised form of all these feedbacks and that would be a string. *** You must follow these instructions ***
        1. You have to return a meaningfull summarised form of the feedbacks as a string.
        2. You must remember that these feedbacks are about school policies imposed by the government.
        3. You have to use the policy {policy} to generate the summary of the feedbacks.
        4. You must not use greeting or other words. You just have to return the summarised string.
        """
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        gen_response_summary.append(response.text.strip())
    
    return gen_response_summary


feedback_list = [
    "The midday meal quality needs improvement.",
    "There aren't enough teachers for science subjects.",
    "Sports facilities are outdated and inadequate.",
    "The school library lacks sufficient books for higher studies.",
    "Students with disabilities are not getting proper support.",
    "Scholarship distribution is often delayed.",
    "Teachers are not well-trained in modern teaching methods.",
    "Sanitation facilities in the school are poorly maintained.",
    "Extracurricular activities should be encouraged more.",
]


summary = analyze_feedback(feedback_list)
print(summary)
