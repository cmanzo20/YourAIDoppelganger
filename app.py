from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

# --- Flask setup ---
app = Flask(__name__)
CORS(app)  # allow cross-origin requests from frontend

# --- SQLite configuration ---
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'writing_samples.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

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

# --- Initialize DB ---
with app.app_context():
    db.create_all()

# --- Run server ---
if __name__ == '__main__':
    app.run(debug=True)
