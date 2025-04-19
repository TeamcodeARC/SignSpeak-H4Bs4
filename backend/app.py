import os
import base64
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
import logging
import tensorflow as tf
import cv2
import mediapipe as mp
from gtts import gTTS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# --- MediaPipe Hands Setup ---
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=True, # Process static images
    max_num_hands=2,        # Detect up to two hands
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5 # Although static_image_mode=True, these might still be relevant
)
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# --- Keras Model Setup ---
MODEL_DIR = "models"
MODEL_PATHS = {
    "digit": os.path.join(MODEL_DIR, "digitSignLanguage.h5"),
    "asl": os.path.join(MODEL_DIR, "americanSignLanguage.h5"),
    "isl": os.path.join(MODEL_DIR, "indianSignLanguage.h5")
}
KERAS_CONFIDENCE_THRESHOLD = 0.6

models = {}
for name, path in MODEL_PATHS.items():
    try:
        if os.path.exists(path):
            models[name] = tf.keras.models.load_model(path)
            logger.info(f"Keras model '{name}' loaded successfully from {path}.")
        else:
            logger.error(f"Keras model file not found at {path}. Model '{name}' disabled.")
            models[name] = None
    except Exception as e:
        logger.error(f"Failed to load Keras model '{name}' from {path}: {e}")
        models[name] = None

# --- Label Mappings ---
DIGIT_LABELS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
ASL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y']
ISL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

LABEL_MAPS = {
    "digit": DIGIT_LABELS,
    "asl": ASL_LABELS,
    "isl": ISL_LABELS
}

def preprocess_image_for_keras(image_bytes, model_type):
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if model_type == "asl":
            img = img.resize((28, 28)).convert('L')
            img_array = np.array(img)
            img_array = np.expand_dims(img_array, axis=-1)
        elif model_type in ["digit", "isl"]:
            img = img.resize((32, 32)).convert('RGB')
            img_array = np.array(img)
        else:
            raise ValueError("Invalid model_type specified")
        img_array = img_array.astype('float32') / 255.0
        img_batch = np.expand_dims(img_array, axis=0)
        return img_batch
    except Exception as e:
        logger.error(f"Error preprocessing image for model {model_type}: {e}")
        return None

@app.route('/api/interpret-sign', methods=['POST'])
def interpret_sign():
    try:
        data = request.json
        # Remove model_type requirement from the request
        if not data or 'image' not in data:
            return jsonify({'error': 'Image data is required'}), 400

        image_data = data['image']
        if 'base64,' in image_data:
            image_data = image_data.split('base64,')[1]
        image_bytes = base64.b64decode(image_data)

        results = []

        # Iterate through all loaded models
        for model_type, model in models.items():
            if model is None:
                logger.warning(f"Skipping unloaded model: {model_type}")
                continue # Skip if model failed to load

            processed_image = preprocess_image_for_keras(image_bytes, model_type)
            if processed_image is None:
                logger.error(f"Preprocessing failed for model {model_type}")
                continue # Skip if preprocessing fails for this model

            try:
                predictions = model.predict(processed_image)
                confidence = float(np.max(predictions[0]))
                predicted_index = int(np.argmax(predictions[0]))

                label_map = LABEL_MAPS.get(model_type, [])
                if predicted_index < len(label_map):
                    predicted_label = label_map[predicted_index]
                    logger.info(f"Prediction ({model_type}): Label='{predicted_label}', Confidence={confidence:.4f}")
                    results.append({
                        "model": model_type,
                        "label": predicted_label,
                        "confidence": confidence
                    })
                else:
                    logger.error(f"Predicted index {predicted_index} out of bounds for {model_type} labels (len={len(label_map)}).")

            except Exception as e:
                logger.error(f"Error during prediction with model {model_type}: {e}")
                # Optionally add a placeholder result or just skip
                continue

        if not results:
            logger.error("No models produced a valid prediction.")
            return jsonify({"text": "Unable to interpret sign (Prediction failed for all models)", "confidence": 0, "model": "none"}), 500

        # Find the best result (highest confidence)
        best_result = max(results, key=lambda x: x['confidence'])

        logger.info(f"Best result from model '{best_result['model']}': Label='{best_result['label']}', Confidence={best_result['confidence']:.4f}")

        if best_result['confidence'] >= KERAS_CONFIDENCE_THRESHOLD:
            return jsonify({
                "text": best_result['label'],
                "confidence": best_result['confidence'],
                "model": best_result['model'] # Include which model gave the best result
            })
        else:
            # Even if below threshold, return the best guess but indicate low confidence
            logger.info(f"Best result confidence ({best_result['confidence']:.4f}) is below threshold ({KERAS_CONFIDENCE_THRESHOLD}).")
            return jsonify({
                "text": f"Unable to interpret sign (Low Confidence: {best_result['label']}?)",
                "confidence": best_result['confidence'],
                "model": best_result['model']
            })

    except base64.binascii.Error:
        logger.error("Invalid base64 data received.")
        return jsonify({'error': 'Invalid base64 data'}), 400
    except Exception as e:
        logger.error(f"Error in interpret_sign endpoint: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({'error': f'Internal server error processing sign interpretation'}), 500

@app.route('/api/detect-hands', methods=['POST']) # CORS should handle OPTIONS
def detect_hands_endpoint():
    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({'error': 'Image data is required'}), 400

        image_data = data['image']
        if 'base64,' in image_data:
            image_data = image_data.split('base64,')[1]
        image_bytes = base64.b64decode(image_data)

        # Decode image using OpenCV
        nparr = np.frombuffer(image_bytes, np.uint8)
        img_np = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img_np is None:
             return jsonify({'error': 'Could not decode image'}), 400

        # Convert the BGR image to RGB and process it with MediaPipe Hands
        img_rgb = cv2.cvtColor(img_np, cv2.COLOR_BGR2RGB)
        results = hands.process(img_rgb)

        # Prepare response data
        hands_detected = False
        num_hands = 0
        hand_landmarks_list = []
        annotated_image_bgr = img_np.copy() # Work on a copy for drawing

        if results.multi_hand_landmarks:
            hands_detected = True
            num_hands = len(results.multi_hand_landmarks)
            for hand_landmarks in results.multi_hand_landmarks:
                # Draw landmarks and connections
                mp_drawing.draw_landmarks(
                    annotated_image_bgr,
                    hand_landmarks,
                    mp_hands.HAND_CONNECTIONS,
                    mp_drawing_styles.get_default_hand_landmarks_style(),
                    mp_drawing_styles.get_default_hand_connections_style())

                # Extract landmark coordinates
                landmarks_for_this_hand = []
                for landmark in hand_landmarks.landmark:
                    landmarks_for_this_hand.append({
                        'x': landmark.x,
                        'y': landmark.y,
                        'z': landmark.z # z is depth, with the depth at the wrist being the origin
                    })
                hand_landmarks_list.append(landmarks_for_this_hand)

        # Encode the annotated image back to base64
        _, buffer = cv2.imencode('.png', annotated_image_bgr)
        annotated_image_base64 = base64.b64encode(buffer).decode('utf-8')

        return jsonify({
            'handsDetected': hands_detected,
            'numHands': num_hands,
            'handLandmarks': hand_landmarks_list, # List of lists of landmarks
            'annotatedImage': f"data:image/png;base64,{annotated_image_base64}"
        })

    except base64.binascii.Error:
        logger.error("Invalid base64 data received for hand detection.")
        return jsonify({'error': 'Invalid base64 data'}), 400
    except Exception as e:
        logger.error(f"Error in detect_hands endpoint: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({'error': f'Internal server error processing hand detection'}), 500

@app.route('/api/text-to-speech', methods=['POST'])
def text_to_speech_endpoint():
    """
    Convert text to speech using gTTS (Google Text-to-Speech)
    
    Request body:
    {
        "text": "Text to convert to speech",
        "language": "en-US" (language code)
    }
    
    Returns:
    {
        "audio": "data:audio/mpeg;base64,..." (base64 encoded MP3)
    }
    """
    try:
        data = request.json
        if not data or 'text' not in data or 'language' not in data:
            return jsonify({'error': 'Text and language are required'}), 400

        text = data['text']
        language = data['language']
        
        # Convert language code format if needed (e.g., "en-US" to "en")
        if '-' in language:
            language = language.split('-')[0]
            
        # Create a temporary file to store the audio
        temp_filename = "temp_audio.mp3"
        
        # Generate the audio using gTTS
        tts = gTTS(text=text, lang=language, slow=False)
        tts.save(temp_filename)
        
        # Read the generated audio file and convert to base64
        with open(temp_filename, "rb") as audio_file:
            encoded_audio = base64.b64encode(audio_file.read()).decode('utf-8')
            
        # Remove the temporary file
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
            
        return jsonify({
            'audio': f"data:audio/mpeg;base64,{encoded_audio}"
        })

    except Exception as e:
        logger.error(f"Error in text-to-speech endpoint: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({'error': f'Internal server error processing text-to-speech'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
