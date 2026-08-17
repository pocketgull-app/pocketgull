import fs from 'fs';
import path from 'path';

describe('Video Showcase & 60 FPS Canvas Engine', () => {
  const showcasePath = path.resolve(__dirname, '../public/video-showcase.html');
  const framesDir = path.resolve(__dirname, '../public/assets/veo-frames');

  it('should verify that video-showcase.html exists with Canvas video engine', () => {
    expect(fs.existsSync(showcasePath)).toBe(true);
    const content = fs.readFileSync(showcasePath, 'utf-8');
    expect(content).toContain('videoCanvas');
    expect(content).toContain('scene2_gemini_live.jpg');
    expect(content).toContain('scene3_biophysical_twin.jpg');
    expect(content).toContain('scene4_organelle_mitochondria.jpg');
    expect(content).toContain('scene6_xprize_healthspan.jpg');
    expect(content).toContain('MediaRecorder');
  });

  it('should verify all 6 Veo frame images are present in public/assets/veo-frames', () => {
    expect(fs.existsSync(framesDir)).toBe(true);
    expect(fs.existsSync(path.join(framesDir, 'scene1_clerical_trap.jpg'))).toBe(true);
    expect(fs.existsSync(path.join(framesDir, 'scene2_gemini_live.jpg'))).toBe(true);
    expect(fs.existsSync(path.join(framesDir, 'scene3_biophysical_twin.jpg'))).toBe(true);
    expect(fs.existsSync(path.join(framesDir, 'scene4_organelle_mitochondria.jpg'))).toBe(true);
    expect(fs.existsSync(path.join(framesDir, 'scene5_tri_paradigm.jpg'))).toBe(true);
    expect(fs.existsSync(path.join(framesDir, 'scene6_xprize_healthspan.jpg'))).toBe(true);

    const paperDir = path.join(framesDir, 'paper');
    expect(fs.existsSync(paperDir)).toBe(true);
    expect(fs.existsSync(path.join(paperDir, 'candle_in_the_dark.jpg'))).toBe(true);
    expect(fs.existsSync(path.join(paperDir, 'scene1_clerical_trap.jpg'))).toBe(true);
    expect(fs.existsSync(path.join(paperDir, 'scene2_gemini_live.jpg'))).toBe(true);
    expect(fs.existsSync(path.join(paperDir, 'scene3_biophysical_twin.jpg'))).toBe(true);
    expect(fs.existsSync(path.join(paperDir, 'scene4_organelle_mitochondria.jpg'))).toBe(true);
    expect(fs.existsSync(path.join(paperDir, 'scene5_tri_paradigm.jpg'))).toBe(true);
    expect(fs.existsSync(path.join(paperDir, 'scene6_xprize_healthspan.jpg'))).toBe(true);
  });

  it('should verify all 24 Google Journey and Studio neural audio tracks exist in public/assets/audio', () => {
    const audioDir = path.resolve(__dirname, '../public/assets/audio');
    expect(fs.existsSync(audioDir)).toBe(true);
    
    const packs = ['journey-male', 'journey-female', 'studio-male', 'british-neural'];
    for (const pack of packs) {
      const pDir = path.join(audioDir, pack);
      expect(fs.existsSync(pDir)).toBe(true);
      for (let s = 1; s <= 6; s++) {
        const file = path.join(pDir, `scene${s}.mp3`);
        expect(fs.existsSync(file)).toBe(true);
        expect(fs.statSync(file).size).toBeGreaterThan(10000);
      }
    }
  });
});
