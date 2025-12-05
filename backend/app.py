from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from llama_cpp import Llama
import os

# --- Flask setup ---
app = Flask(__name__)
CORS(app)  # allow cross-origin requests from frontend

# --- SQLite configuration ---
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'writing_samples.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

#llama model setup
llama_model_path = os.path.join(basedir, "LLMmodels", "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf")
llm = Llama(model_path=llama_model_path)
#IMPORTANT: LLM TOO LARGE FOR GITHUB- MANUAL DOWNLOAD AND CONFIGURATION MAY BE REQUIRED

# --- Model for Writing Samples ---
class WritingSample(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(120), nullable=False)
    filepath = db.Column(db.String(200), nullable=False)

    def serialize(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'filepath': self.filepath
        }

# --- Ensure upload folder exists ---
UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# --- Routes ---
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    # Save file info to DB
    sample = WritingSample(filename=file.filename, filepath=filepath)
    db.session.add(sample)
    db.session.commit()

    return jsonify({'message': 'File uploaded successfully', 'file': sample.serialize()}), 200

@app.route('/samples', methods=['GET'])
def get_samples():
    samples = WritingSample.query.all()
    return jsonify([s.serialize() for s in samples])

@app.route('/generate', methods=['POST'])
def generate_text():
    data = request.json
    prompt = data.get('prompt', '')
    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400

    chat_prompt = f"<s><|user|>\n{prompt}</s>\n<|assistant|>"

    response = llm(chat_prompt, max_tokens=200, temperature=0.7)

    try:
        output = response["choices"][0]["text"]
    except Exception as e:
        print("Bad LLM response:", response)
        return jsonify({'error': 'Unexpected LLM response format'}), 500

    return jsonify({'output': output})

# --- Initialize DB ---
with app.app_context():
    db.create_all()

# --- Run server ---
if __name__ == '__main__':
    app.run(debug=True)
