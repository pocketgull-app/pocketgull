import sys

print(f"Python: {sys.version}")

try:
    import torch
    print(f"PyTorch: {torch.__version__}")
    print(f"CUDA/ROCm Available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"Device Count: {torch.cuda.device_count()}")
        print(f"Device Name: {torch.cuda.get_device_name(0)}")
except ImportError as e:
    print(f"PyTorch not installed: {e}")

try:
    import transformers
    print(f"Transformers: {transformers.__version__}")
except ImportError as e:
    print(f"Transformers not installed: {e}")

try:
    import peft
    print(f"PEFT: {peft.__version__}")
except ImportError as e:
    print(f"PEFT not installed: {e}")

try:
    import trl
    print(f"TRL: {trl.__version__}")
except ImportError as e:
    print(f"TRL not installed: {e}")
