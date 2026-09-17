"""
RSNA Fast Status Provider for Taskbar Monitor.
Returns JSON telemetry for kernel execution and competition submission status.
"""

import sys
import json
import time
import datetime
from pathlib import Path

STATE_FILE = Path(__file__).parent / ".taskbar_state.json"
TRAIN_KERNEL_ID = "philgear/rsna-knee-2026-training-v9"
INFER_KERNEL_ID = "philgear/rsna-knee-2026-pytorch-inference"
COMPETITION_ID = "rsna-knee-abnormality-detection"

def get_status() -> dict:
    t0 = time.time()
    now_dt = datetime.datetime.now()
    now_str = now_dt.strftime("%I:%M %p")

    # Load persistent state
    state = {}
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                state = json.load(f)
        except Exception:
            state = {}

    kernel_start_time = state.get("kernel_start_time", None)
    prev_k_status = state.get("prev_k_status", None)
    prev_sub_status = state.get("prev_sub_status", None)
    prev_sub_score = state.get("prev_sub_score", None)

    # Query Kaggle API
    k_status = "UNKNOWN"
    k_msg = None
    active_kernel_id = INFER_KERNEL_ID
    sub_id = None
    sub_status = "UNKNOWN"
    sub_score = None
    sub_desc = ""

    try:
        from kaggle.api.kaggle_api_extended import KaggleApi
        api = KaggleApi()
        api.authenticate()

        # 1. Kernel Status (Checks both inference and training, prioritizes active running kernel)
        infer_status = "UNKNOWN"
        train_status = "UNKNOWN"
        infer_msg = None
        train_msg = None

        try:
            i_res = api.kernels_status(INFER_KERNEL_ID)
            infer_status = str(getattr(i_res, "status", "UNKNOWN")).replace("KernelWorkerStatus.", "")
            infer_msg = getattr(i_res, "failure_message", getattr(i_res, "failureMessage", None))
        except Exception as e:
            infer_status = "ERROR"
            infer_msg = str(e)

        try:
            t_res = api.kernels_status(TRAIN_KERNEL_ID)
            train_status = str(getattr(t_res, "status", "UNKNOWN")).replace("KernelWorkerStatus.", "")
            train_msg = getattr(t_res, "failure_message", getattr(t_res, "failureMessage", None))
        except Exception as e:
            train_status = "ERROR"
            train_msg = str(e)

        if infer_status in ("RUNNING", "QUEUED"):
            active_kernel_id = INFER_KERNEL_ID
            k_status = f"Infer:{infer_status}" if infer_status == "RUNNING" else "Infer:QUEUED"
            k_msg = infer_msg
        elif train_status in ("RUNNING", "QUEUED"):
            active_kernel_id = TRAIN_KERNEL_ID
            k_status = f"Train:{train_status}" if train_status == "RUNNING" else "Train:QUEUED"
            k_msg = train_msg
        elif infer_status == "COMPLETE":
            active_kernel_id = INFER_KERNEL_ID
            k_status = "COMPLETE"
            k_msg = None
        else:
            active_kernel_id = TRAIN_KERNEL_ID
            k_status = train_status
            k_msg = train_msg

        # 2. Submission Status
        try:
            subs = api.competition_submissions(COMPETITION_ID)
            if subs:
                s0 = subs[0]
                sub_id = str(getattr(s0, "ref", getattr(s0, "id", "")))
                sub_status = str(s0.status).replace("SubmissionStatus.", "")
                sub_score = float(s0.public_score) if (s0.public_score and str(s0.public_score).strip()) else None
                sub_desc = str(getattr(s0, "description", ""))
        except Exception as e:
            sub_status = "ERROR"

    except Exception as e:
        k_status = "API_ERROR"
        k_msg = str(e)

    # Track elapsed time
    if "RUNNING" in k_status or "QUEUED" in k_status:
        if not kernel_start_time:
            kernel_start_time = time.time()
        elapsed_sec = max(0, time.time() - kernel_start_time)
        elapsed_min = int(elapsed_sec // 60)
        elapsed_str = f"{elapsed_min}m"
        short_text = f"{elapsed_min}m"
        icon_type = "running"
    elif k_status == "COMPLETE":
        elapsed_min = 0
        elapsed_str = "Done"
        short_text = "OK"
        icon_type = "complete"
    elif "ERROR" in k_status or k_status == "FAILED":
        elapsed_min = 0
        elapsed_str = "Fail"
        short_text = "ERR"
        icon_type = "error"
    else:
        elapsed_min = 0
        elapsed_str = "--"
        short_text = "RSNA"
        icon_type = "idle"

    # Detect state changes for desktop notifications
    notifications = []
    if prev_k_status and prev_k_status != k_status:
        if k_status == "COMPLETE":
            notifications.append(f"Kernel Complete! ({active_kernel_id.split('/')[-1]})")
        elif k_status == "FAILED" or "ERROR" in k_status:
            notifications.append(f"Kernel Alert: {k_status} ({k_msg or ''})")

    if prev_sub_status and prev_sub_status != sub_status:
        if sub_status == "COMPLETE":
            score_str = f"Score: {sub_score:.4f}" if sub_score is not None else "Scored"
            notifications.append(f"Submission {sub_id} Finished! {score_str}")
        elif "ERROR" in sub_status or sub_status == "FAILED":
            notifications.append(f"Submission {sub_id} Failed: {sub_status}")
    elif sub_score is not None and prev_sub_score is None:
        notifications.append(f"Submission {sub_id} Public Score: {sub_score:.4f}!")

    # Update state
    new_state = {
        "kernel_start_time": kernel_start_time if ("RUNNING" in k_status or "QUEUED" in k_status) else None,
        "prev_k_status": k_status,
        "prev_sub_status": sub_status,
        "prev_sub_score": sub_score,
        "last_updated": time.time()
    }
    try:
        with open(STATE_FILE, "w", encoding="utf-8") as f:
            json.dump(new_state, f, indent=2)
    except Exception:
        pass

    # Build concise tooltip (max 127 chars for WinForms NotifyIcon)
    sub_score_part = f" ({sub_score:.3f})" if sub_score is not None else ""
    tooltip_lines = [
        "RSNA Knee Monitor",
        f"Kaggle: {k_status} ({elapsed_str})",
        f"Sub: {sub_status}{sub_score_part}",
        f"Updated: {now_str}"
    ]
    tooltip = "\n".join(tooltip_lines)[:127]

    return {
        "kernel_id": active_kernel_id,
        "kernel_status": k_status,
        "kernel_msg": k_msg,
        "kernel_elapsed_min": elapsed_min,
        "kernel_elapsed_str": elapsed_str,
        "sub_id": sub_id,
        "sub_status": sub_status,
        "sub_score": sub_score,
        "sub_desc": sub_desc[:60],
        "short_text": short_text,
        "icon_type": icon_type,
        "tooltip": tooltip,
        "notifications": notifications,
        "time": now_str,
        "latency_ms": int((time.time() - t0) * 1000)
    }

if __name__ == "__main__":
    res = get_status()
    print(json.dumps(res, indent=2))
