#!/usr/bin/env python3
"""
Pocket-Gull: Google Vertex AI Veo Video Generation Pipeline
Build with Gemini + XPRIZE Hackathon Video Renderer
"""

import os
import sys
import argparse
import time
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description="Generate 4K cinematic videos using Google Veo on Vertex AI")
    parser.add_argument("--project", default="gen-lang-client-0540208645", help="GCP Project ID")
    parser.add_argument("--location", default="us-central1", help="Vertex AI Region")
    parser.add_argument("--model", default="veo-2.0-generate-001", help="Veo Model Name")
    parser.add_argument("--scene", type=int, choices=[1, 2, 3, 4], default=1, help="Scene number (1 to 4)")
    parser.add_argument("--output-dir", default="public/assets/veo-videos", help="Output directory for MP4 clips")
    parser.add_argument("--duration", type=int, default=5, help="Clip duration in seconds")
    parser.add_argument("--aspect-ratio", default="16:9", help="Aspect ratio (16:9 or 9:16)")
    
    args = parser.parse_args()

    # Pre-defined scenes from VEO_VIDEO_TREATMENT.md
    SCENES = {
        1: {
            "name": "Scene 1: Voice Awakening (Gemini Live Consult)",
            "prompt": "Cinematic high-end medical commercial shot, 35mm anamorphic lens, f/1.8. A doctor and patient having a warm, natural conversation in a sunlit Scandinavian clinic. Between them, a delicate, glowing golden-teal audio frequency waveform floats organically in mid-air, pulsing smoothly to their speech. Orbital camera rotation, soft volumetric rim lighting, photorealistic, 8k resolution, 24fps.",
            "image": "public/assets/veo-frames/scene2_gemini_live.jpg",
            "output": "scene1_gemini_live.mp4"
        },
        2: {
            "name": "Scene 2: 3D Biophysical Digital Twin",
            "prompt": "Close-up macro cinematic shot of a sleek glass tablet displaying an ultra-detailed 3D holographic human anatomical skeleton with glowing vascular pathways and neural networks. A physician's finger smoothly touches the holographic spine, triggering a radiant emerald and amber biophysical heat map. Depth of field focus pull, high-tech titanium studio lighting, octane render aesthetic, hyper-realistic, 4k.",
            "image": "public/assets/veo-frames/scene3_biophysical_twin.jpg",
            "output": "scene2_biophysical_twin.mp4"
        },
        3: {
            "name": "Scene 3: Microscopic 3D Organelles & Mitochondria",
            "prompt": "Microscopic cinematic dive inside a living human cell. Bioluminescent mitochondria with glowing golden inner cristae membranes and endoplasmic reticulum floating in deep violet-teal cellular fluid. SBF-SEM electron microscopy 3D mesh reconstruction, volumetric light rays, scientific visualization, national geographic documentary quality, photorealistic 4k.",
            "image": "public/assets/veo-frames/scene4_organelle_mitochondria.jpg",
            "output": "scene3_organelles.mp4"
        },
        4: {
            "name": "Scene 4: The XPRIZE Healthspan Horizon",
            "prompt": "Wide cinematic shot at golden hour sunrise. An active, healthy 40-year-old woman smiles confidently as she walks along a modern coastal promenade overlooking the ocean. Soft golden sun flares, gentle ocean breeze. High-end lifestyle commercial, Arri Alexa, master anamorphic lens, warm hopeful color grade, 4k 24fps.",
            "image": "public/assets/veo-frames/scene6_xprize_healthspan.jpg",
            "output": "scene4_xprize_healthspan.mp4"
        }
    }

    selected = SCENES[args.scene]
    print(f"🎬 [POCKET-GULL VEO] Initializing Vertex AI Video Generation...")
    print(f"  • Project: {args.project}")
    print(f"  • Location: {args.location}")
    print(f"  • Model: {args.model}")
    print(f"  • Selected Scene: {selected['name']}")
    print(f"  • Prompt: {selected['prompt'][:100]}...")

    output_path = Path(args.output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    target_file = output_path / selected['output']

    try:
        import vertexai
        from vertexai.preview.vision_models import VideoGenerationModel, Image

        vertexai.init(project=args.project, location=args.location)
        print("✅ [Vertex AI] Authenticated with GCP successfully.")

        model = VideoGenerationModel.from_pretrained(args.model)
        print(f"🎥 [Veo Pipeline] Submitting generation job to {args.model}...")

        start_time = time.time()
        
        # Check if source image exists for Image-to-Video
        source_image_path = Path(selected["image"])
        if source_image_path.exists():
            print(f"🖼️ [Image-to-Video] Using source frame: {source_image_path}")
            source_img = Image.load_from_file(str(source_image_path))
            videos = model.generate_videos(
                prompt=selected["prompt"],
                image=source_img,
                number_of_videos=1,
                aspect_ratio=args.aspect_ratio,
                duration_seconds=args.duration,
            )
        else:
            print("📝 [Text-to-Video] Generating video directly from prompt...")
            videos = model.generate_videos(
                prompt=selected["prompt"],
                number_of_videos=1,
                aspect_ratio=args.aspect_ratio,
                duration_seconds=args.duration,
            )

        elapsed = time.time() - start_time
        print(f"⏱️ [Render Complete] Job finished in {elapsed:.1f}s")

        videos[0].save(location=str(target_file))
        print(f"🎉 [SUCCESS] Saved video clip to: {target_file}")

    except ImportError:
        print("\n⚠️ [NOTE] The 'google-cloud-aiplatform' package is required.")
        print("To install: pip install google-cloud-aiplatform\n")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ [Vertex AI Error] {e}")
        print("Ensure the Vertex AI API (aiplatform.googleapis.com) is enabled on gen-lang-client-0540208645.")
        sys.exit(1)

if __name__ == "__main__":
    main()
