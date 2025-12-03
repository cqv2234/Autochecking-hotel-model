import torch
import torch.nn as nn
import torchvision.models as models
from torchvision import transforms
import cv2
import numpy as np
import os
from PIL import Image
import torch.nn.functional as F
import insightface
from numpy.linalg import norm
import base64
import io
import re
import time
from functools import wraps

# --- Flask Imports ---
from flask import Flask, request, jsonify, Response
from flask_cors import CORS # Quan trọng để React gọi được

def measure_time(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"⏱️ [TOTAL TIME] API '{func.__name__}' took: {(end_time - start_time) * 1000:.2f} ms")
        return result
    return wrapper

print("--- Initializing server ---")

# =====================================================================
# 1. SAO CHÉP TẤT CẢ CÀI ĐẶT VÀ BIẾN TOÀN CỤC TỪ NOTEBOOK
# =====================================================================

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {DEVICE}")

# --- Cập nhật đường dẫn ---
FAS_MODEL_PATH = "./Face_Anti_Spoofing_Model_StandardVersion_WCE.pth" 
DB_PATH = "./database/"
RECOGNITION_THRESHOLD = 0.38 # Ngưỡng Cosine Sim
CUSTOM_THRESHOLD = 0.613 # Ngưỡng EER cho FAS
CLASS_NAMES = ['real', 'spoof'] 
INPUT_SIZE = 224

# =====================================================================
# 2. LOAD TẤT CẢ MODEL (CHỈ CHẠY 1 LẦN KHI SERVER START)
# =====================================================================

# --- Load Model FAS (ResNet-18) ---
try:
    fas_model = models.resnet18(weights=None) 
    num_ftrs = fas_model.fc.in_features
    fas_model.fc = nn.Linear(num_ftrs, len(CLASS_NAMES))
    fas_model.load_state_dict(torch.load(FAS_MODEL_PATH, map_location=DEVICE))
    fas_model.to(DEVICE)
    fas_model.eval()
    print(f"Has been downloaded FAS model from '{FAS_MODEL_PATH}'.")
except Exception as e:
    print(f"ERROR: Cannot download FAS model: {e}")
    fas_model = None

# --- Load FAS Transforms ---
fas_transforms = transforms.Compose([
    transforms.Resize((INPUT_SIZE, INPUT_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])
print("FAS transforms have been prepared.")

# --- Load InsightFace App ---
try:
    app_insight = insightface.app.FaceAnalysis(
        name='buffalo_l', 
        providers=['CUDAExecutionProvider' if DEVICE.type == 'cuda' else 'CPUExecutionProvider']
    )
    app_insight.prepare(ctx_id=0 if DEVICE.type == 'cuda' else -1, det_size=(640, 640))
    print("Has been downloaded InsightFace model (buffalo_l).")
except Exception as e:
    print(f"ERROR with InsightFace: {e}")
    app_insight = None

print("--- Initialization complete. Server is ready ---")


# =====================================================================
# 3. SAO CHÉP CÁC HÀM XỬ LÝ TỪ NOTEBOOK
# =====================================================================

def check_liveness_pytorch(image_bgr, model, transform, device, threshold):
    if model is None: return True, 1.0, "Real" # Bỏ qua nếu model lỗi
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    image_pil = Image.fromarray(image_rgb)
    image_tensor = transform(image_pil).unsqueeze(0).to(device) 
    
    with torch.no_grad():
        outputs = model(image_tensor)
        probabilities = F.softmax(outputs, dim=1)[0] 
        
    score_spoof = probabilities[1].item() # Giả sử 1 là spoof

    if score_spoof >= threshold:
        return False, score_spoof, "spoof" # IS_REAL = False
    else:
        return True, probabilities[0].item(), "real" # IS_REAL = True

def compare_embeddings(live_emb, stored_emb_list):
    """So sánh 1 embedding (live) với 1 embedding (đã lưu)."""
    try:
        # Chuyển embedding (dạng list) nhận từ request thành numpy array
        stored_emb = np.array(stored_emb_list)
        
        # Chuẩn hóa (Normalize)
        live_emb_norm = live_emb / norm(live_emb)
        stored_emb_norm = stored_emb / norm(stored_emb)
        
        # Tính Cosine Similarity
        sim = np.dot(live_emb_norm, stored_emb_norm)
        return sim
    except Exception as e:
        print(f"Error with embedding comparison: {e}")
        return 0 # Trả về 0 nếu có lỗi

# =====================================================================
# 4. HÀM TIỆN ÍCH API (GIẢI MÃ BASE64)
# =====================================================================

def decode_base64_to_cv2(base64_string):
    """Giải mã 1 ảnh base64 (có header) thành ảnh cv2 BGR"""
    try:
        # Xóa header "data:image/jpeg;base64,"
        img_data = re.sub('^data:image/.+;base64,', '', base64_string)
        # Giải mã
        img_data_decoded = base64.b64decode(img_data)
        # Chuyển thành mảng numpy
        nparr = np.frombuffer(img_data_decoded, np.uint8)
        # Đọc thành ảnh cv2
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img_bgr
    except Exception as e:
        print(f"Error with base64 string: {e}")
        return None

# =====================================================================
# 5. KHỞI TẠO FLASK VÀ ĐỊNH NGHĨA API ROUTE
# =====================================================================

app = Flask(__name__)
# Cho phép React (chạy ở localhost:5173) gọi đến API (chạy ở localhost:5000)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

@app.route("/api/authenticate", methods=["POST"])
@measure_time
def api_authenticate_face():
    
    # --- 1. Nhận dữ liệu ---
    data = request.get_json()
    if not data or 'image_data' not in data or 'stored_embedding' not in data:
        return jsonify({"status": "fail", "message": "Missing 'image_data' or 'stored_embedding'."}), 400

    # --- 2. Giải mã ảnh và lấy embedding đã lưu ---
    t1 = time.time()
    frame_orig = decode_base64_to_cv2(data['image_data'])
    stored_embedding_list = data['stored_embedding'] # Đây là một list [0.1, 0.2, ...]
    print(f"   + Decode: {(time.time() - t1) * 1000:.2f} ms")

    if frame_orig is None:
        return jsonify({"status": "fail", "message": "The image data is not valid."}), 400

    frame_height, frame_width, _ = frame_orig.shape

    # --- 3. Phát hiện khuôn mặt (InsightFace) ---
    if app_insight is None:
        return jsonify({"status": "error", "message": "Server error: InsightFace model is not downloaded."}), 500

    t3 = time.time()    
    faces = app_insight.get(frame_orig)
    print(f"   + InsightFace: {(time.time() - t3) * 1000:.2f} ms")

    if not faces:
        return jsonify({"status": "fail", "message": "No faces found in the image."}), 400
    
    face = faces[0] 

    # --- 4. Cắt mặt ---
    bbox = face.bbox.astype(int)
    x1, y1 = max(0, bbox[0]), max(0, bbox[1])
    x2, y2 = min(frame_width, bbox[2]), min(frame_height, bbox[3])
    cropped_face = frame_orig[y1:y2, x1:x2]

    if cropped_face.size == 0:
        return jsonify({"status": "fail", "message": "Error with processing image (Crop image is empty)."}), 400

    # --- 5. Kiểm tra Liveness (FAS) ---
    if fas_model is None:
         return jsonify({"status": "error", "message": "Server error: FAS model is not downloaded."}), 500

    t5 = time.time()     
    is_real, fas_score, fas_label = check_liveness_pytorch(
        cropped_face, fas_model, fas_transforms, DEVICE, CUSTOM_THRESHOLD
    )
    print(f"   + Liveness: {(time.time() - t5) * 1000:.2f} ms")

    if not is_real:
        print(f"Detect SPOOF (Score: {fas_score:.2f})")
        return jsonify({
            "status": "fail", 
            "message": f"Detect fake faces (Spoof). Score: {fas_score:.2f}"
        }), 403 # 403 Forbidden

    # --- 6. So sánh Embedding (Nếu REAL) ---
    live_embedding = face.embedding
    similarity = compare_embeddings(live_embedding, stored_embedding_list)

    if similarity <= RECOGNITION_THRESHOLD:
        print(f"Detected REAL but DOES NOT MATCH (Sim: {similarity:.2f})")
        return jsonify({
            "status": "fail", 
            "message": f"Real face, but does not match with the profile (Sim: {similarity:.2f})."
        }), 401 # 401 Unauthorized

    # --- 7. THÀNH CÔNG ---
    print(f"Authentication successful (Sim: {similarity:.2f})")
    return jsonify({
        "status": "success", 
        "message": "Check-in successfully!",
        "similarity": float(similarity)
    }), 200 # 200 OK

# === API MỚI: TRÍCH XUẤT EMBEDDING (VỚI LIVENESS CHECK) ===
@app.route("/api/extract-embedding", methods=["POST"])
@measure_time
def api_extract_embedding_with_liveness():
    
    # --- 1. Nhận và giải mã ảnh ---
    data = request.get_json()
    if not data or 'image_data' not in data:
        return jsonify({"status": "fail", "message": "Missing image data (image_data)."}), 400

    t_decode_start = time.time()
    frame_orig = decode_base64_to_cv2(data['image_data'])
    print(f"   >> [Step 1] Decode Image: {(time.time() - t_decode_start) * 1000:.2f} ms")
    if frame_orig is None:
        return jsonify({"status": "fail", "message": "The image data is not valid."}), 400

    frame_height, frame_width, _ = frame_orig.shape

    # --- 2. Kiểm tra các model ---
    if app_insight is None:
        return jsonify({"status": "error", "message": "Server error: InsightFace model is not downloaded."}), 500
    if fas_model is None:
         return jsonify({"status": "error", "message": "Server error: FAS model is not downloaded."}), 500

    # --- 3. Phát hiện khuôn mặt (InsightFace) ---
    # InsightFace 'get' sẽ thực hiện cả phát hiện và trích xuất embedding 
    # trong cùng một bước.
    t_insight_start = time.time()
    try:
        faces = app_insight.get(frame_orig)
    except Exception as e:
        print(f"Lỗi khi chạy app_insight.get: {e}")
        return jsonify({"status": "error", "message": f"Error with processing image: {e}"}), 500
    print(f"   >> [Step 2] InsightFace (Detect + Embed): {(time.time() - t_insight_start) * 1000:.2f} ms")

    if not faces:
        return jsonify({"status": "fail", "message": "No faces found in the image."}), 400
    
    if len(faces) > 1:
        return jsonify({"status": "fail", "message": "Found more than one face. Please provide an image contains only one face."}), 400
    
    face = faces[0]

    # --- 4. Cắt mặt để kiểm tra Liveness ---
    bbox = face.bbox.astype(int)
    x1, y1 = max(0, bbox[0]), max(0, bbox[1])
    x2, y2 = min(frame_width, bbox[2]), min(frame_height, bbox[3])
    cropped_face = frame_orig[y1:y2, x1:x2]

    if cropped_face.size == 0:
        return jsonify({"status": "fail", "message": "Error with processing image (Crop image is empty)."}), 400

    # --- 5. KIỂM TRA LIVENESS (FAS) ---
    # Bước này chạy TRƯỚC KHI chúng ta trả về embedding
    t_fas_start = time.time()
    is_real, fas_score, fas_label = check_liveness_pytorch(
        cropped_face, fas_model, fas_transforms, DEVICE, CUSTOM_THRESHOLD
    )
    print(f"   >> [Step 3] Liveness Check: {(time.time() - t_fas_start) * 1000:.2f} ms")

    if not is_real:
        print(f"Phát hiện SPOOF (Score: {fas_score:.2f})")
        return jsonify({
            "status": "fail", 
            "message": f"Detect fake faces (Spoof). Cannot extract face embedding."
        }), 403 # 403 Forbidden (Bị cấm)

    # --- 6. TRẢ VỀ EMBEDDING (Nếu là REAL) ---
    # Lấy embedding đã được trích xuất ở Bước 3
    live_embedding = face.embedding
    embedding_as_list = live_embedding.tolist() 

    return jsonify({
        "status": "success", 
        "message": "Real face. Extract face embedding successfully.",
        "embedding": embedding_as_list
    }), 200
# ==========================================

# =====================================================================
# 6. CHẠY SERVER
# =====================================================================
if __name__ == '__main__':
    # Chạy server Flask
    # debug=True: Tự động tải lại server khi bạn thay đổi code
    # host='0.0.0.0': Cho phép truy cập từ bên ngoài (không chỉ localhost)
    app.run(host='0.0.0.0', port=5000, debug=False)