"""
YOLO Vehicle Detector
Phase 2 module — connects to real video feeds and runs YOLOv8 detection.

Usage:
    python detection/detector.py --source traffic.mp4
    python detection/detector.py --source rtsp://camera-ip/stream
    python detection/detector.py --source 0   (webcam)
"""

import argparse
import cv2
import requests
from datetime import datetime

# --- Uncomment when ultralytics is installed ---
# from ultralytics import YOLO

# Vehicle classes in COCO dataset (used by YOLOv8)
VEHICLE_CLASSES = {
    2:  'car',
    3:  'motorcycle',
    5:  'bus',
    7:  'truck',
    # Note: auto-rickshaw not in COCO — needs custom fine-tuning
}

BACKEND_URL = "http://localhost:8000/api/traffic/ingest"

def compute_congestion_score(vehicle_count: int, avg_speed: float, queue: float) -> float:
    v_norm = min(vehicle_count / 200.0, 1.0)
    s_norm = max(0, 1.0 - (avg_speed / 60.0))
    q_norm = min(queue / 500.0, 1.0)
    return round((v_norm * 0.5) + (s_norm * 0.3) + (q_norm * 0.2), 3)

def run_detector(source, zone_id: str = "unknown", show: bool = True):
    """
    Main detection loop.
    Reads video frame by frame, runs YOLO, counts vehicles,
    and posts data to the FastAPI backend.
    """

    # model = YOLO("yolov8n.pt")   # Uncomment in Phase 2
    cap = cv2.VideoCapture(source)

    if not cap.isOpened():
        print(f"❌ Cannot open source: {source}")
        return

    frame_count = 0
    vehicle_counts = {'car': 0, 'motorcycle': 0, 'bus': 0, 'truck': 0, 'auto': 0}

    print(f"✅ Detector running on: {source}")
    print("Press 'q' to quit")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1

        # --- Phase 2: Uncomment to enable real YOLO detection ---
        # results = model(frame, verbose=False)
        # for r in results:
        #     for box in r.boxes:
        #         cls_id = int(box.cls[0])
        #         if cls_id in VEHICLE_CLASSES:
        #             label = VEHICLE_CLASSES[cls_id]
        #             vehicle_counts[label] = vehicle_counts.get(label, 0) + 1
        #
        # annotated = results[0].plot()

        # Placeholder: show raw frame until Phase 2
        annotated = frame.copy()
        cv2.putText(
            annotated,
            "YOLO Detection — Phase 2 (install ultralytics to activate)",
            (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2
        )

        # Every 30 frames, post data to backend
        if frame_count % 30 == 0:
            payload = {
                "zone_id": zone_id,
                "vehicle_count": vehicle_counts,
                "timestamp": datetime.now().isoformat(),
            }
            try:
                requests.post(BACKEND_URL, json=payload, timeout=1)
            except Exception:
                pass  # Backend may not be running during standalone testing

        if show:
            cv2.imshow(f"Chennai Traffic — {zone_id}", annotated)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    cap.release()
    cv2.destroyAllWindows()
    print("✅ Detector stopped.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Chennai Traffic YOLO Detector")
    parser.add_argument("--source",  default="0",         help="Video source: file path, RTSP URL, or 0 for webcam")
    parser.add_argument("--zone_id", default="kathipara", help="Zone ID to report data for")
    parser.add_argument("--no-show", action="store_true", help="Don't display video window")
    args = parser.parse_args()

    run_detector(
        source=int(args.source) if args.source == "0" else args.source,
        zone_id=args.zone_id,
        show=not args.no_show,
    )
