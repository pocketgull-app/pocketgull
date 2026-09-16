---
name: nvidia-gpu-acceleration
description: Engineering standards and battle-tested patterns for NVIDIA GPU acceleration across PyTorch, MONAI, and CUDA on Tesla T4, A100, and modern Hopper/Blackwell architectures. Use when optimizing deep learning training, medical imaging pipelines (DICOM/MRI/CT), Vision Transformers (DINOv2/ViT), or Kaggle/production GPU workloads. Do NOT use for client-side WebAssembly/WebGPU browser UI tasks.
---

# NVIDIA GPU Acceleration & Battle-Testing Standard

## 1. Quick Mental Model & Hardware Invariants

### Hardware Architecture Invariants
- **NVIDIA Tesla T4 (Turing `sm_75`)**: 16 GB GDDR6 VRAM, 320 Turing Tensor Cores, 2,560 CUDA cores.
  - FP32 Single-Precision: $\sim 8.1\text{ TFLOPS}$
  - FP16 Tensor Cores: $\sim 65.0\text{ TFLOPS}$ ($8.0\times$ theoretical peak throughput)
  - **Invariant**: FP32 math on modern NVIDIA hardware leaves $>85\%$ of silicon compute potential dormant. All convolutional, transformer, and linear matrix multiplications MUST be cast to FP16 mixed precision.
- **Modern Architectures (Ampere `sm_80`, Hopper `sm_90`, Blackwell `sm_100`)**:
  - Incorporates native BF16 (Brain Float 16), FP8 Tensor Cores, and asynchronous hardware copy engines (TMA).

### The Three Golden Rules of NVIDIA GPU Throughput
1. **Never Let the GPU Wait on CPU Disk I/O**: DICOM parsing (`pydicom.dcmread`) is strictly CPU- and disk-bound. Repetitive disk reads across training epochs cause GPU compute starvation.
2. **Compute in SRAM, Not HBM**: Vision Transformer attention matrices $A = \text{softmax}(QK^T / \sqrt{d})$ must execute via tiled SRAM FlashAttention rather than materializing $N \times N$ matrices in global VRAM.
3. **Saturate Streaming Multiprocessors (SMs)**: Micro-batches with single-item updates launch small, high-overhead CUDA kernels. Accumulate gradients over micro-batches to maintain $>90\%$ SM occupancy.

---

## 2. The 5-Pillar NVIDIA Acceleration Protocol

### Pillar 1: Automatic Mixed Precision (AMP FP16 / BF16)
Use PyTorch's native `autocast` and `GradScaler` to dynamically scale gradients, preventing underflow while utilizing Tensor Cores:
```python
scaler = torch.cuda.amp.GradScaler(enabled=torch.cuda.is_available())

for x, y in data_loader:
    x = x.to(device, non_blocking=True)
    y = y.to(device, non_blocking=True)
    optimizer.zero_grad(set_to_none=True) # set_to_none=True saves memory bandwidth
    
    with torch.cuda.amp.autocast(dtype=torch.float16):
        logits = model(x)
        loss = criterion(logits, y)
        
    scaler.scale(loss).backward()
    scaler.unscale_(optimizer)
    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
    scaler.step(optimizer)
    scaler.update()
```

### Pillar 2: MONAI SmartCache & In-Memory Preprocessing
In multi-epoch training, cache extracted high-resolution 2.5D slabs in pinned CPU memory (`pin_memory=True`):
```python
# Pin memory allows direct DMA (Direct Memory Access) transfers over PCIe
loader = DataLoader(
    dataset,
    batch_size=batch_size,
    shuffle=True,
    num_workers=4,
    pin_memory=True, # Overlaps host-to-device transfers with compute
    prefetch_factor=2
)
```

### Pillar 3: FlashAttention-2 / Scaled Dot Product Attention (SDPA)
Replace naive quadratic $O(N^2)$ manual attention in Vision Transformers:
```python
import torch.nn.functional as F_nn

class FlashAttention(nn.Module):
    def __init__(self, dim=384, num_heads=6, qkv_bias=True):
        super().__init__()
        self.num_heads = num_heads
        self.head_dim = dim // num_heads
        self.qkv = nn.Linear(dim, dim * 3, bias=qkv_bias)
        self.proj = nn.Linear(dim, dim, bias=True)

    def forward(self, x):
        B, N, C = x.shape
        qkv = self.qkv(x).reshape(B, N, 3, self.num_heads, self.head_dim).permute(2, 0, 3, 1, 4)
        q, k, v = qkv[0], qkv[1], qkv[2]
        # Native PyTorch SDPA selects FlashAttention or Memory-Efficient attention in SRAM
        x = F_nn.scaled_dot_product_attention(q, k, v, is_causal=False)
        x = x.transpose(1, 2).reshape(B, N, C)
        return self.proj(x)
```

### Pillar 4: cuDNN Auto-Tuner & Gradient Accumulation
```python
# Enables cuDNN auto-tuner to benchmark and pick the fastest CUDA convolution/GEMM algorithm
if torch.cuda.is_available():
    torch.backends.cudnn.benchmark = True
    torch.backends.cuda.matmul.allow_tf32 = True
    torch.backends.cudnn.allow_tf32 = True
```

### Pillar 5: Empirical In-Line Profiling (`torch.profiler`)
Battle-test pipelines using standard PyTorch profiling metrics:
```python
with torch.profiler.profile(
    activities=[
        torch.profiler.ProfilerActivity.CPU,
        torch.profiler.ProfilerActivity.CUDA,
    ],
    schedule=torch.profiler.schedule(wait=1, warmup=1, active=3, repeat=1),
    on_trace_ready=torch.profiler.tensorboard_trace_handler('/kaggle/working/profiler_logs'),
    record_shapes=True,
    profile_memory=True,
    with_stack=True
) as prof:
    for step, batch in enumerate(data_loader):
        train_step(batch)
        prof.step()
```

---

## 3. Verification & Battle-Testing Checklist
- [ ] `torch.cuda.amp.autocast()` active on all forward passes.
- [ ] `torch.cuda.amp.GradScaler()` scaling and unscaling gradients before clipping.
- [ ] `optimizer.zero_grad(set_to_none=True)` used instead of zero-filling memory buffers.
- [ ] Pinned memory (`pin_memory=True`) and asynchronous transfers (`non_blocking=True`).
- [ ] `torch.backends.cudnn.benchmark = True` initialized.
- [ ] FlashAttention / SDPA enabled in transformer self-attention blocks.
- [ ] Zero repeated raw DICOM file decoding from disk during secondary training phases.
