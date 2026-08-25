import 'dart:io';
import 'dart:typed_data';
import 'dart:math' as math;

void main() {
  print('🎨 Generating PocketGull Clinical Android Launcher Icons...');

  final densities = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
  };

  // 1. Patient App Icon: Cyan/Teal Bio-Rhythm Wave & Halo on Obsidian
  for (final entry in densities.entries) {
    final size = entry.value;
    final bytes = generatePatientIconPng(size);
    final targetPath = 'companion-apps/patient_app/android/app/src/main/res/${entry.key}/ic_launcher.png';
    File(targetPath).writeAsBytesSync(bytes);
    print('  ✓ Patient App: $targetPath (${size}x$size)');
  }

  // 2. Provider App Icon: Emerald & Amber Telemetry Shield on Obsidian
  for (final entry in densities.entries) {
    final size = entry.value;
    final bytes = generateProviderIconPng(size);
    final targetPath = 'companion-apps/provider_app/android/app/src/main/res/${entry.key}/ic_launcher.png';
    File(targetPath).writeAsBytesSync(bytes);
    print('  ✓ Provider App: $targetPath (${size}x$size)');
  }

  // 3. PocketGull Flutter Core Icon: Amber & Teal Monogram
  for (final entry in densities.entries) {
    final size = entry.value;
    final bytes = generateCoreIconPng(size);
    final targetPath = 'companion-apps/pocketgull_flutter/android/app/src/main/res/${entry.key}/ic_launcher.png';
    final targetFile = File(targetPath);
    if (targetFile.parent.existsSync()) {
      targetFile.writeAsBytesSync(bytes);
      print('  ✓ Core App: $targetPath (${size}x$size)');
    }
  }

  print('✨ All launcher icons generated successfully!');
}

/// Generates a Patient Companion Icon (Cyan Pulse Wave + Golden Halo)
Uint8List generatePatientIconPng(int size) {
  final pixels = Uint8List(size * size * 4);
  final center = size / 2.0;
  final radius = size * 0.44;

  for (int y = 0; y < size; y++) {
    for (int x = 0; x < size; x++) {
      final idx = (y * size + x) * 4;
      final dx = x - center;
      final dy = y - center;
      final dist = math.sqrt(dx * dx + dy * dy);

      // Squircle background shape (Obsidian #09090b with subtle dark cyan gradient)
      final cornerRadius = size * 0.22;
      final isInsideSquircle = isPointInsideSquircle(x.toDouble(), y.toDouble(), size.toDouble(), cornerRadius);

      if (!isInsideSquircle) {
        pixels[idx] = 0;     // R
        pixels[idx + 1] = 0; // G
        pixels[idx + 2] = 0; // B
        pixels[idx + 3] = 0; // Alpha 0
        continue;
      }

      // Base Obsidian Background
      int r = 9;
      int g = 12;
      int b = 18;
      int a = 255;

      // Outer Glowing Ring (Golden / Teal Accent)
      final ringDist = (dist - radius * 0.85).abs();
      if (ringDist < size * 0.04) {
        final glow = 1.0 - (ringDist / (size * 0.04));
        r = (r * (1 - glow) + 45 * glow).toInt();
        g = (g * (1 - glow) + 212 * glow).toInt(); // #2dd4bf Teal
        b = (b * (1 - glow) + 191 * glow).toInt();
      }

      // Inner Bio-Rhythm Pulse ECG Line (Cyan #00e5ff)
      final normX = (x / size) * 4.0 - 2.0; // [-2, 2]
      final ecgY = center - (math.exp(-normX * normX * 3.0) * math.sin(normX * 9.0) * (size * 0.28));
      final distToEcg = (y - ecgY).abs();

      if (distToEcg < size * 0.045 && dist < radius * 0.78) {
        final glow = 1.0 - (distToEcg / (size * 0.045));
        r = (r * (1 - glow) + 0 * glow).toInt();
        g = (g * (1 - glow) + 229 * glow).toInt(); // #00e5ff Cyan
        b = (b * (1 - glow) + 255 * glow).toInt();
      }

      // Golden Entrainment Star at peak
      final starDx = x - (center + size * 0.08);
      final starDy = y - (center - size * 0.18);
      final starDist = math.sqrt(starDx * starDx + starDy * starDy);
      if (starDist < size * 0.05) {
        final starGlow = 1.0 - (starDist / (size * 0.05));
        r = (r * (1 - starGlow) + 251 * starGlow).toInt(); // #fbbf24 Gold
        g = (g * (1 - starGlow) + 191 * starGlow).toInt();
        b = (b * (1 - starGlow) + 36 * starGlow).toInt();
      }

      pixels[idx] = r.clamp(0, 255);
      pixels[idx + 1] = g.clamp(0, 255);
      pixels[idx + 2] = b.clamp(0, 255);
      pixels[idx + 3] = a;
    }
  }

  return encodePng(size, size, pixels);
}

/// Generates a Provider CDS Icon (Emerald & Gold Diagnostic Shield)
Uint8List generateProviderIconPng(int size) {
  final pixels = Uint8List(size * size * 4);
  final center = size / 2.0;
  final radius = size * 0.44;

  for (int y = 0; y < size; y++) {
    for (int x = 0; x < size; x++) {
      final idx = (y * size + x) * 4;
      final dx = x - center;
      final dy = y - center;
      final dist = math.sqrt(dx * dx + dy * dy);

      final cornerRadius = size * 0.22;
      final isInsideSquircle = isPointInsideSquircle(x.toDouble(), y.toDouble(), size.toDouble(), cornerRadius);

      if (!isInsideSquircle) {
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 0;
        continue;
      }

      // Obsidian with dark emerald hue
      int r = 6;
      int g = 16;
      int b = 14;
      int a = 255;

      // Shield Cross / Diamond Pattern (Emerald #10b981 & Gold #f59e0b)
      final diamondDist = (dx.abs() + dy.abs());
      if (diamondDist < radius * 0.85 && diamondDist > radius * 0.65) {
        final glow = 1.0 - ((diamondDist - radius * 0.75).abs() / (radius * 0.1));
        r = (r * (1 - glow) + 16 * glow).toInt();
        g = (g * (1 - glow) + 185 * glow).toInt(); // #10b981 Emerald
        b = (b * (1 - glow) + 129 * glow).toInt();
      }

      // Central Medical Cross
      final isCrossH = (dy.abs() < size * 0.05) && (dx.abs() < size * 0.22);
      final isCrossV = (dx.abs() < size * 0.05) && (dy.abs() < size * 0.22);
      if (isCrossH || isCrossV) {
        r = 245; // #f59e0b Amber Gold
        g = 158;
        b = 11;
      }

      pixels[idx] = r.clamp(0, 255);
      pixels[idx + 1] = g.clamp(0, 255);
      pixels[idx + 2] = b.clamp(0, 255);
      pixels[idx + 3] = a;
    }
  }

  return encodePng(size, size, pixels);
}

/// Generates Core PocketGull Icon
Uint8List generateCoreIconPng(int size) {
  final pixels = Uint8List(size * size * 4);
  final center = size / 2.0;

  for (int y = 0; y < size; y++) {
    for (int x = 0; x < size; x++) {
      final idx = (y * size + x) * 4;
      final cornerRadius = size * 0.22;
      final isInside = isPointInsideSquircle(x.toDouble(), y.toDouble(), size.toDouble(), cornerRadius);

      if (!isInside) {
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 0;
        continue;
      }

      final dx = x - center;
      final dy = y - center;

      int r = 10;
      int g = 10;
      int b = 15;
      int a = 255;

      // Gull wing arcs
      final wingY = center - (math.cos((dx / (size * 0.35)) * math.pi * 0.5) * (size * 0.18));
      final distToWing = (y - wingY).abs();
      if (distToWing < size * 0.04 && dx.abs() < size * 0.35) {
        final glow = 1.0 - (distToWing / (size * 0.04));
        r = (r * (1 - glow) + 45 * glow).toInt();
        g = (g * (1 - glow) + 212 * glow).toInt();
        b = (b * (1 - glow) + 191 * glow).toInt();
      }

      pixels[idx] = r.clamp(0, 255);
      pixels[idx + 1] = g.clamp(0, 255);
      pixels[idx + 2] = b.clamp(0, 255);
      pixels[idx + 3] = a;
    }
  }

  return encodePng(size, size, pixels);
}

bool isPointInsideSquircle(double x, double y, double size, double radius) {
  final margin = size * 0.04;
  final w = size - margin * 2;
  final h = size - margin * 2;
  final localX = x - margin;
  final localY = y - margin;

  if (localX < 0 || localX > w || localY < 0 || localY > h) return false;

  if (localX < radius && localY < radius) {
    final dx = radius - localX;
    final dy = radius - localY;
    return dx * dx + dy * dy <= radius * radius;
  }
  if (localX > w - radius && localY < radius) {
    final dx = localX - (w - radius);
    final dy = radius - localY;
    return dx * dx + dy * dy <= radius * radius;
  }
  if (localX < radius && localY > h - radius) {
    final dx = radius - localX;
    final dy = localY - (h - radius);
    return dx * dx + dy * dy <= radius * radius;
  }
  if (localX > w - radius && localY > h - radius) {
    final dx = localX - (w - radius);
    final dy = localY - (h - radius);
    return dx * dx + dy * dy <= radius * radius;
  }
  return true;
}

/// Pure Dart Minimal PNG Encoder
Uint8List encodePng(int width, int height, Uint8List rgbaPixels) {
  final rawData = BytesBuilder();
  for (int y = 0; y < height; y++) {
    rawData.addByte(0); // Filter type: None
    final rowOffset = y * width * 4;
    rawData.add(rgbaPixels.sublist(rowOffset, rowOffset + width * 4));
  }

  final compressed = zlib.encode(rawData.toBytes());

  final out = BytesBuilder();
  // PNG Signature
  out.add([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR Chunk
  final ihdr = ByteData(13);
  ihdr.setUint32(0, width);
  ihdr.setUint32(4, height);
  ihdr.setUint8(8, 8); // 8-bit depth
  ihdr.setUint8(9, 6); // RGBA color type
  ihdr.setUint8(10, 0); // Compression (deflate)
  ihdr.setUint8(11, 0); // Filter
  ihdr.setUint8(12, 0); // Interlace
  writeChunk(out, 'IHDR', ihdr.buffer.asUint8List());

  // IDAT Chunk
  writeChunk(out, 'IDAT', Uint8List.fromList(compressed));

  // IEND Chunk
  writeChunk(out, 'IEND', Uint8List(0));

  return out.toBytes();
}

void writeChunk(BytesBuilder out, String type, Uint8List data) {
  final length = ByteData(4)..setUint32(0, data.length);
  out.add(length.buffer.asUint8List());

  final typeBytes = type.codeUnits;
  out.add(typeBytes);
  out.add(data);

  // CRC-32
  final crcData = Uint8List(4 + data.length);
  crcData.setRange(0, 4, typeBytes);
  crcData.setRange(4, 4 + data.length, data);
  final crc = calculateCrc32(crcData);

  final crcBytes = ByteData(4)..setUint32(0, crc);
  out.add(crcBytes.buffer.asUint8List());
}

int calculateCrc32(Uint8List data) {
  int crc = 0xFFFFFFFF;
  for (final byte in data) {
    crc ^= byte;
    for (int j = 0; j < 8; j++) {
      if ((crc & 1) != 0) {
        crc = (crc >> 1) ^ 0xEDB88320;
      } else {
        crc >>= 1;
      }
    }
  }
  return (crc ^ 0xFFFFFFFF) & 0xFFFFFFFF;
}
