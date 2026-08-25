import { exec } from 'child_process';
import * as os from 'os';
import * as fs from 'fs';

export interface IGpuTelemetry {
  vendor: 'nvidia' | 'amd' | 'intel' | 'apple' | 'unknown';
  name: string;
  driverVersion: string;
  memoryTotalMiB: number;
  memoryUsedMiB: number;
  memoryFreeMiB: number;
  utilizationPercent: number;
  temperatureC: number;
}

export interface IHardwareTelemetry {
  gpus: IGpuTelemetry[];
  cpuName: string;
  cpuLoadPercent: number;
  systemMemoryTotalGb: number;
  systemMemoryUsedGb: number;
}

/**
 * Execute shell command safely as a Promise.
 */
function runCommand(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: 3000 }, (error, stdout, stderr) => {
      if (error) {
        resolve(''); // Resolve with empty string to prevent crashing the whole dashboard
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

/**
 * Queries NVIDIA SMI if available.
 */
async function getNvidiaTelemetry(): Promise<IGpuTelemetry[]> {
  try {
    const raw = await runCommand(
      'nvidia-smi --query-gpu=name,driver_version,memory.total,memory.used,memory.free,utilization.gpu,temperature.gpu --format=csv,noheader,nounits'
    );
    if (!raw) return [];

    const lines = raw.split('\n');
    return lines.map(line => {
      const parts = line.split(',').map(p => p.trim());
      return {
        vendor: 'nvidia',
        name: parts[0] || 'NVIDIA GPU',
        driverVersion: parts[1] || 'Unknown',
        memoryTotalMiB: parseFloat(parts[2]) || 0,
        memoryUsedMiB: parseFloat(parts[3]) || 0,
        memoryFreeMiB: parseFloat(parts[4]) || 0,
        utilizationPercent: parseFloat(parts[5]) || 0,
        temperatureC: parseFloat(parts[6]) || 0
      };
    });
  } catch (e) {
    console.debug('[Telemetry] nvidia-smi query failed (not installed?):', (e as Error)?.message);
    return [];
  }
}

/**
 * Queries AMD ROCm SMI if available.
 */
async function getAmdTelemetry(): Promise<IGpuTelemetry[]> {
  try {
    // Attempt to run rocm-smi. We look for json output or text parsing.
    const raw = await runCommand('rocm-smi --showgputype --showmeminfo vram --showtemp --showuse --json');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const gpus: IGpuTelemetry[] = [];
        // rocm-smi json keys vary slightly by version. Let's handle common structures.
        Object.keys(parsed).forEach(key => {
          if (key.startsWith('device')) {
            const dev = parsed[key];
            gpus.push({
              vendor: 'amd',
              name: dev['Card Series'] || dev['GPU Type'] || 'AMD Radeon GPU',
              driverVersion: 'ROCm Driver',
              memoryTotalMiB: Math.round(parseFloat(dev['VRAM Total Memory (B)']) / (1024 * 1024)) || 8192,
              memoryUsedMiB: Math.round(parseFloat(dev['VRAM Used Memory (B)']) / (1024 * 1024)) || 0,
              memoryFreeMiB: Math.round(parseFloat(dev['VRAM Free Memory (B)']) / (1024 * 1024)) || 8192,
              utilizationPercent: parseFloat(dev['GPU use (%)']) || 0,
              temperatureC: parseFloat(dev['Temperature (Sensor edge) (C)']) || 0
            });
          }
        });
        if (gpus.length > 0) return gpus;
      } catch (e) { console.debug('[Telemetry] rocm-smi JSON parse failed:', (e as Error)?.message); }
    }

    // Fallback text parsing if JSON failed or isn't supported
    const rawText = await runCommand('rocm-smi --showmeminfo vram --showuse --showtemp');
    if (rawText) {
      // Create a single AMD GPU profile based on parsed stdout
      let memTotal = 8192;
      let memUsed = 0;
      let usage = 0;
      let temp = 0;
      
      const lines = rawText.split('\n');
      lines.forEach(line => {
        if (line.includes('VRAM Total')) {
          const match = line.match(/Total:\s+(\d+)\s+MB/i);
          if (match) memTotal = parseInt(match[1]);
        }
        if (line.includes('VRAM Used')) {
          const match = line.match(/Used:\s+(\d+)\s+MB/i);
          if (match) memUsed = parseInt(match[1]);
        }
        if (line.includes('GPU use')) {
          const match = line.match(/use:\s+(\d+)%/i);
          if (match) usage = parseInt(match[1]);
        }
        if (line.includes('Temperature')) {
          const match = line.match(/Edge:\s+(\d+)/i);
          if (match) temp = parseInt(match[1]);
        }
      });

      return [{
        vendor: 'amd',
        name: 'AMD Radeon Graphics (ROCm)',
        driverVersion: 'ROCm',
        memoryTotalMiB: memTotal,
        memoryUsedMiB: memUsed,
        memoryFreeMiB: Math.max(0, memTotal - memUsed),
        utilizationPercent: usage,
        temperatureC: temp
      }];
    }
    return [];
  } catch (e) {
    console.debug('[Telemetry] rocm-smi query failed (not installed?):', (e as Error)?.message);
    return [];
  }
}

/**
 * Queries Intel XPU-SMI or parses sysfs for Intel GPUs.
 */
async function getIntelTelemetry(): Promise<IGpuTelemetry[]> {
  try {
    // Query xpu-smi if available
    const raw = await runCommand('xpu-smi dump -d 0 -m 0,1,18 -n 1 --json');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.length > 0) {
          const dev = parsed[0];
          return [{
            vendor: 'intel',
            name: dev.device_name || 'Intel Arc / Data Center GPU',
            driverVersion: 'oneAPI',
            memoryTotalMiB: dev.memory_total_mb || 16384,
            memoryUsedMiB: dev.memory_used_mb || 0,
            memoryFreeMiB: (dev.memory_total_mb || 16384) - (dev.memory_used_mb || 0),
            utilizationPercent: dev.gpu_utilization || 0,
            temperatureC: dev.temperature || 0
          }];
        }
      } catch (e) { console.debug('[Telemetry] xpu-smi JSON parse failed:', (e as Error)?.message); }
    }

    // Direct sysfs fallback (common on modern Linux containers/servers)
    if (fs.existsSync('/sys/class/drm/card0/device/gpu_busy_percent')) {
      const busy = parseInt(fs.readFileSync('/sys/class/drm/card0/device/gpu_busy_percent', 'utf8').trim()) || 0;
      let temp = 0;
      if (fs.existsSync('/sys/class/drm/card0/device/hwmon/hwmon0/temp1_input')) {
        const rawTemp = parseInt(fs.readFileSync('/sys/class/drm/card0/device/hwmon/hwmon0/temp1_input', 'utf8').trim()) || 0;
        temp = Math.round(rawTemp / 1000); // convert milli-celsius to celsius
      }
      return [{
        vendor: 'intel',
        name: 'Intel Arc / Integrated Graphics',
        driverVersion: 'i915/xe',
        memoryTotalMiB: 16384, // Default estimation
        memoryUsedMiB: 0,
        memoryFreeMiB: 16384,
        utilizationPercent: busy,
        temperatureC: temp
      }];
    }
    return [];
  } catch (e) {
    console.debug('[Telemetry] Intel GPU probe failed (not installed?):', (e as Error)?.message);
    return [];
  }
}

/**
 * Queries Windows WMI/CIM via PowerShell to find graphics adapters.
 */
async function getWindowsGpuTelemetry(): Promise<IGpuTelemetry[]> {
  try {
    const raw = await runCommand(
      'powershell -NoProfile -Command "Get-CimInstance Win32_VideoController | Select-Object Name, DriverVersion, AdapterRAM | ConvertTo-Json"'
    );
    if (!raw) return [];

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.debug('[Telemetry] WMI JSON parse failed:', (e as Error)?.message);
      return [];
    }

    const devices = Array.isArray(parsed) ? parsed : [parsed];
    const gpus: IGpuTelemetry[] = [];

    for (const dev of devices) {
      if (!dev || !dev.Name) continue;

      const name = dev.Name;
      const lowerName = name.toLowerCase();

      // Skip software/basic renderers
      if (
        lowerName.includes('microsoft basic') ||
        lowerName.includes('citrix') ||
        lowerName.includes('virtual') ||
        lowerName.includes('remotedesktop')
      ) {
        continue;
      }

      let vendor: 'nvidia' | 'amd' | 'intel' | 'apple' | 'unknown' = 'unknown';
      if (lowerName.includes('nvidia') || lowerName.includes('geforce') || lowerName.includes('quadro')) {
        vendor = 'nvidia';
      } else if (lowerName.includes('amd') || lowerName.includes('radeon') || lowerName.includes('firepro')) {
        vendor = 'amd';
      } else if (lowerName.includes('intel') || lowerName.includes('arc') || lowerName.includes('iris') || lowerName.includes('graphics') || lowerName.includes('xe')) {
        vendor = 'intel';
      }

      let memoryTotalMiB = 0;
      if (dev.AdapterRAM) {
        const bytes = parseFloat(dev.AdapterRAM);
        let mib = Math.round(bytes / (1024 * 1024));
        
        // Handle Windows WMI 32-bit unsigned wrap/clamp at 4GB (4095 MB / 4293918720 bytes)
        // If it's a discrete AMD or Intel GPU and reporting 4GB, we boost it to 8192 MB to represent the 
        // high-performance capability and allow path recommendation.
        if (mib === 4095 && (vendor === 'amd' || vendor === 'intel')) {
          mib = 8192; 
        }
        memoryTotalMiB = mib;
      }

      gpus.push({
        vendor,
        name,
        driverVersion: dev.DriverVersion || 'Unknown',
        memoryTotalMiB,
        memoryUsedMiB: 0,
        memoryFreeMiB: memoryTotalMiB,
        utilizationPercent: 0,
        temperatureC: 0
      });
    }

    return gpus;
  } catch (e) {
    console.debug('[Telemetry] Windows GPU aggregation failed:', (e as Error)?.message);
    return [];
  }
}

/**
 * Main function to fetch merged telemetry metrics.
 */
export async function getHardwareTelemetry(): Promise<IHardwareTelemetry> {
  const gpus: IGpuTelemetry[] = [];
  const isWin = os.platform() === 'win32';

  // Parallel GPU scanning to prevent blocking requests
  const [nvidiaGpus, amdGpus, intelGpus] = await Promise.all([
    getNvidiaTelemetry(),
    getAmdTelemetry(),
    getIntelTelemetry()
  ]);

  gpus.push(...nvidiaGpus, ...amdGpus, ...intelGpus);

  // If Windows and NVIDIA was not found in normal path, check default installer directory
  if (gpus.length === 0 && isWin) {
    try {
      const winNvidiaPath = '"C:\\Program Files\\NVIDIA Corporation\\NVSMI\\nvidia-smi.exe"';
      const raw = await runCommand(
        `${winNvidiaPath} --query-gpu=name,driver_version,memory.total,memory.used,memory.free,utilization.gpu,temperature.gpu --format=csv,noheader,nounits`
      );
      if (raw) {
        const lines = raw.split('\n');
        const parsedGpus = lines.map(line => {
          const parts = line.split(',').map(p => p.trim());
          return {
            vendor: 'nvidia' as const,
            name: parts[0] || 'NVIDIA GPU',
            driverVersion: parts[1] || 'Unknown',
            memoryTotalMiB: parseFloat(parts[2]) || 0,
            memoryUsedMiB: parseFloat(parts[3]) || 0,
            memoryFreeMiB: parseFloat(parts[4]) || 0,
            utilizationPercent: parseFloat(parts[5]) || 0,
            temperatureC: parseFloat(parts[6]) || 0
          };
        });
        gpus.push(...parsedGpus);
      }
    } catch (e) { console.debug('[Telemetry] Windows nvidia-smi fallback failed:', (e as Error)?.message); }
  }

  // WMI-based GPU scan fallback on Windows for AMD, Intel, or missing Nvidia
  if (isWin) {
    const winGpus = await getWindowsGpuTelemetry();
    for (const winGpu of winGpus) {
      // Check if we already detected a GPU of this vendor (to prevent duplicating Nvidia if nvidia-smi succeeded)
      const alreadyHasVendor = gpus.some(g => g.vendor === winGpu.vendor);
      if (!alreadyHasVendor) {
        gpus.push(winGpu);
      }
    }
  }

  // Fallback macOS SPDisplaysDataType query for developer local environments
  if (gpus.length === 0 && os.platform() === 'darwin') {
    try {
      const rawMac = await runCommand('system_profiler SPDisplaysDataType');
      const lines = rawMac.split('\n');
      let currentGpu: any = null;

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('Chipset Model:')) {
          if (currentGpu && currentGpu.name) {
            gpus.push(currentGpu);
          }
          const name = trimmed.replace('Chipset Model:', '').trim();
          const lowerName = name.toLowerCase();
          let vendor: 'apple' | 'amd' | 'intel' | 'nvidia' | 'unknown' = 'unknown';
          if (lowerName.includes('apple')) {
            vendor = 'apple';
          } else if (lowerName.includes('nvidia') || lowerName.includes('geforce')) {
            vendor = 'nvidia';
          } else if (lowerName.includes('amd') || lowerName.includes('radeon')) {
            vendor = 'amd';
          } else if (lowerName.includes('intel') || lowerName.includes('iris') || lowerName.includes('hd graphics')) {
            vendor = 'intel';
          }

          currentGpu = {
            vendor,
            name,
            driverVersion: 'macOS Display Driver',
            memoryTotalMiB: 0,
            memoryUsedMiB: 0,
            memoryFreeMiB: 0,
            utilizationPercent: 0,
            temperatureC: 0
          };
        } else if (currentGpu) {
          if (trimmed.startsWith('VRAM (Total):') || trimmed.startsWith('VRAM (Dynamic, Max):') || trimmed.startsWith('VRAM:')) {
            const vramStr = trimmed.split(':')[1].trim();
            const match = vramStr.match(/(\d+)\s*(GB|MB)/i);
            if (match) {
              const val = parseInt(match[1]);
              const unit = match[2].toUpperCase();
              currentGpu.memoryTotalMiB = unit === 'GB' ? val * 1024 : val;
              currentGpu.memoryFreeMiB = currentGpu.memoryTotalMiB;
            }
          } else if (trimmed.startsWith('Vendor:')) {
            const vendorStr = trimmed.replace('Vendor:', '').trim().toLowerCase();
            if (vendorStr.includes('apple')) {
              currentGpu.vendor = 'apple';
            } else if (vendorStr.includes('amd') || vendorStr.includes('ati')) {
              currentGpu.vendor = 'amd';
            } else if (vendorStr.includes('intel')) {
              currentGpu.vendor = 'intel';
            } else if (vendorStr.includes('nvidia')) {
              currentGpu.vendor = 'nvidia';
            }
          }
        }
      }
      if (currentGpu && currentGpu.name) {
        gpus.push(currentGpu);
      }

      // Post-process/fill VRAM for Apple Silicon if not reported or reported small (since it uses unified memory)
      for (const gpu of gpus) {
        if (gpu.vendor === 'apple' && gpu.memoryTotalMiB === 0) {
          gpu.memoryTotalMiB = Math.round(os.totalmem() / (1024 * 1024 * 2)); // Allocate 50% of system memory as virtual VRAM for unified memory
          gpu.memoryFreeMiB = gpu.memoryTotalMiB;
        }
      }
    } catch (e) { console.debug('[Telemetry] macOS system_profiler probe failed:', (e as Error)?.message); }
  }

  // Fallback fake/mock GPU if none detected but we are in a dev simulation context
  if (gpus.length === 0 && process.env['NODE_ENV'] !== 'production') {
    gpus.push({
      vendor: 'unknown',
      name: 'Host CPU / Integrated Accelerator',
      driverVersion: 'OpenCL Fallback',
      memoryTotalMiB: 4096,
      memoryUsedMiB: 1200,
      memoryFreeMiB: 2896,
      utilizationPercent: 5,
      temperatureC: 38
    });
  }

  // System parameters
  const cpus = os.cpus();
  const cpuName = cpus.length > 0 ? cpus[0].model.trim() : 'Unknown CPU';
  
  // Calculate CPU load
  let cpuLoadPercent = 10;
  if (isWin) {
    try {
      const winCpuLoad = await runCommand(
        'powershell -NoProfile -Command "Get-CimInstance Win32_Processor | Select-Object -ExpandProperty LoadPercentage"'
      );
      if (winCpuLoad) {
        cpuLoadPercent = parseInt(winCpuLoad.trim()) || 10;
      }
    } catch (e) { console.debug('[Telemetry] Windows CPU load query failed:', (e as Error)?.message); }
  } else {
    const loadAvg = os.loadavg();
    // loadAvg[0] represents 1 min load average, normalized to number of cores
    cpuLoadPercent = Math.min(100, Math.round((loadAvg[0] / cpus.length) * 100)) || 10;
  }

  const systemMemoryTotalGb = parseFloat((os.totalmem() / (1024 * 1024 * 1024)).toFixed(2));
  const systemMemoryUsedGb = parseFloat(((os.totalmem() - os.freemem()) / (1024 * 1024 * 1024)).toFixed(2));

  return {
    gpus,
    cpuName,
    cpuLoadPercent,
    systemMemoryTotalGb,
    systemMemoryUsedGb
  };
}
