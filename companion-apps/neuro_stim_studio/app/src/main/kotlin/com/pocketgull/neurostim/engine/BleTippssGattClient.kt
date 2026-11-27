// SPDX-License-Identifier: Apache-2.0
package com.pocketgull.neurostim.engine

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCallback
import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothGattDescriptor
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothProfile
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.Context
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.nio.charset.StandardCharsets
import java.util.UUID
import kotlin.math.roundToInt

enum class BleConnectionState(val badge: String) {
    DISCONNECTED("DISCONNECTED"),
    SCANNING("SCANNING BLE SPECTRUM..."),
    CONNECTING("GATT HANDSHAKE..."),
    CONNECTED_LIVE("LIVE HARDWARE GATT LINK"),
    VIRTUAL_PHANTOM_LOOPBACK("VIRTUAL PHANTOM LOOPBACK (10 kOhm RIG)")
}

data class DiscoveredBleNode(
    val name: String,
    val address: String,
    val rssiDbm: Int,
    val profileBadge: String,
    val device: BluetoothDevice? = null
)

data class ParsedBleTelemetry(
    val impedanceKOhm: Float,
    val sqiPct: Float,
    val thetaAlphaRatio: Float
)

data class BleTelemetryUiState(
    val connectionState: BleConnectionState = BleConnectionState.DISCONNECTED,
    val connectedDeviceName: String = "None",
    val discoveredNodes: List<DiscoveredBleNode> = emptyList(),
    val liveRssiDbm: Int = -62,
    val liveImpedanceKOhm: Float = 4.8f,
    val liveSqiPct: Float = 96.4f,
    val liveThetaAlphaRatio: Float = 1.42f,
    val packetsReceived: Int = 0,
    val lastPayloadPreview: String = "Z=4.8kOhm,SQI=96.4%,TAR=1.42",
    val statusMessage: String = "Ready to scan for IEEE P2933 TIPPSS / OpenBCI / Muse / Arduino BLE nodes."
)

/**
 * IEEE P2933™ TIPPSS Bluetooth Low Energy (BLE) GATT Scanner & Telemetry Client.
 *
 * Supports:
 * 1. PocketGull Benchtop Phantom GATT Service (`00002933-0000-1000-8000-00805f9b34fb`)
 * 2. Nordic UART Service (`6e400001-b5a3-f393-e0a9-e50e24dcca9e`) for Arduino / ESP32 boards
 * 3. OpenBCI Ganglion (`0000fe84-0000-1000-8000-00805f9b34fb`) & Muse headbands
 * 4. Virtual Benchtop Phantom Loopback using NIST SP 800-90A 53-bit CSPRNG
 */
class BleTippssGattClient(private val context: Context) {

    companion object {
        val UUID_SERVICE_TIPPSS: UUID = UUID.fromString("00002933-0000-1000-8000-00805f9b34fb")
        val UUID_CHAR_TELEMETRY: UUID = UUID.fromString("00002934-0000-1000-8000-00805f9b34fb")
        val UUID_CHAR_COMMAND: UUID = UUID.fromString("00002935-0000-1000-8000-00805f9b34fb")

        val UUID_SERVICE_NORDIC_UART: UUID = UUID.fromString("6e400001-b5a3-f393-e0a9-e50e24dcca9e")
        val UUID_CHAR_NORDIC_TX: UUID = UUID.fromString("6e400003-b5a3-f393-e0a9-e50e24dcca9e")
        val UUID_CCCD: UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb")

        /**
         * Pure deterministic parser for ASCII CSV/KV telemetry packets from Arduino/ESP32 phantom
         * or OpenBCI bridge. Accepts formats like:
         * - `Z=5.2,SQI=97.1,TAR=1.38`
         * - `5.2,97.1,1.38`
         */
        fun parseTelemetryPayload(raw: String): ParsedBleTelemetry? {
            val cleaned = raw.trim()
            if (cleaned.isEmpty()) return null
            return try {
                if (cleaned.contains("=")) {
                    val map = cleaned.split(",", ";", "|").associate { token ->
                        val parts = token.split("=")
                        if (parts.size == 2) {
                            parts[0].trim().uppercase() to parts[1].trim()
                                .replace("KOHM", "", ignoreCase = true)
                                .replace("%", "")
                        } else {
                            "" to ""
                        }
                    }
                    val z = map["Z"]?.toFloatOrNull() ?: map["IMP"]?.toFloatOrNull() ?: 4.8f
                    val sqi = map["SQI"]?.toFloatOrNull() ?: 96.0f
                    val tar = map["TAR"]?.toFloatOrNull() ?: 1.40f
                    ParsedBleTelemetry(
                        impedanceKOhm = z.coerceIn(0.4f, 25.0f),
                        sqiPct = sqi.coerceIn(0.0f, 100.0f),
                        thetaAlphaRatio = tar.coerceIn(0.2f, 5.0f)
                    )
                } else {
                    val nums = cleaned.split(",").mapNotNull { it.trim().toFloatOrNull() }
                    if (nums.isEmpty()) return null
                    ParsedBleTelemetry(
                        impedanceKOhm = nums.getOrElse(0) { 4.8f }.coerceIn(0.4f, 25.0f),
                        sqiPct = nums.getOrElse(1) { 96.0f }.coerceIn(0.0f, 100.0f),
                        thetaAlphaRatio = nums.getOrElse(2) { 1.40f }.coerceIn(0.2f, 5.0f)
                    )
                }
            } catch (_: Throwable) {
                null
            }
        }

        fun classifyDeviceProfile(name: String): String {
            val upper = name.uppercase()
            return when {
                upper.contains("POCKETGULL") || upper.contains("PHANTOM") || upper.contains("TIPPSS") ->
                    "IEEE P2933 TIPPSS Phantom"
                upper.contains("GANGLION") || upper.contains("OPENBCI") ->
                    "OpenBCI Passive EEG"
                upper.contains("MUSE") ->
                    "Muse Headband EEG"
                upper.contains("ARDUINO") || upper.contains("UNO") || upper.contains("ESP32") ->
                    "Arduino / ESP32 Benchtop Rig"
                else -> "BLE GATT Peripheral"
            }
        }
    }

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var virtualLoopJob: Job? = null
    private var activeGatt: BluetoothGatt? = null
    private var isScannerActive = false

    private val _uiState = MutableStateFlow(BleTelemetryUiState())
    val uiState: StateFlow<BleTelemetryUiState> = _uiState.asStateFlow()

    private val bluetoothAdapter: BluetoothAdapter? by lazy {
        val manager = context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
        manager?.adapter
    }

    private val scanCallback = object : ScanCallback() {
        @SuppressLint("MissingPermission")
        override fun onScanResult(callbackType: Int, result: ScanResult) {
            val device = result.device ?: return
            val rawName = try {
                device.name ?: result.scanRecord?.deviceName ?: "BLE Node (${device.address.takeLast(5)})"
            } catch (_: SecurityException) {
                "BLE Node"
            }
            val node = DiscoveredBleNode(
                name = rawName,
                address = device.address ?: "00:00:00:00:00:00",
                rssiDbm = result.rssi,
                profileBadge = classifyDeviceProfile(rawName),
                device = device
            )
            val current = _uiState.value.discoveredNodes.toMutableList()
            val existingIdx = current.indexOfFirst { it.address == node.address }
            if (existingIdx >= 0) {
                current[existingIdx] = node
            } else if (current.size < 18) {
                current.add(node)
            }
            _uiState.value = _uiState.value.copy(
                discoveredNodes = current.sortedByDescending { it.rssiDbm },
                liveRssiDbm = result.rssi
            )
        }

        override fun onScanFailed(errorCode: Int) {
            isScannerActive = false
            _uiState.value = _uiState.value.copy(
                connectionState = BleConnectionState.DISCONNECTED,
                statusMessage = "BLE scan failed (code $errorCode). Check Bluetooth & permissions."
            )
        }
    }

    private val gattCallback = object : BluetoothGattCallback() {
        @SuppressLint("MissingPermission")
        override fun onConnectionStateChange(gatt: BluetoothGatt, status: Int, newState: Int) {
            if (newState == BluetoothProfile.STATE_CONNECTED) {
                val devName = try {
                    gatt.device.name ?: gatt.device.address
                } catch (_: SecurityException) {
                    gatt.device.address
                }
                _uiState.value = _uiState.value.copy(
                    connectionState = BleConnectionState.CONNECTED_LIVE,
                    connectedDeviceName = devName,
                    statusMessage = "Connected to $devName. Discovering IEEE P2933 / UART services..."
                )
                gatt.discoverServices()
                gatt.readRemoteRssi()
            } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                _uiState.value = _uiState.value.copy(
                    connectionState = BleConnectionState.DISCONNECTED,
                    connectedDeviceName = "None",
                    statusMessage = "BLE peripheral disconnected."
                )
            }
        }

        override fun onReadRemoteRssi(gatt: BluetoothGatt, rssi: Int, status: Int) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                _uiState.value = _uiState.value.copy(liveRssiDbm = rssi)
            }
        }

        @SuppressLint("MissingPermission")
        override fun onServicesDiscovered(gatt: BluetoothGatt, status: Int) {
            if (status != BluetoothGatt.GATT_SUCCESS) return
            val tippssChar = gatt.getService(UUID_SERVICE_TIPPSS)?.getCharacteristic(UUID_CHAR_TELEMETRY)
            val uartChar = gatt.getService(UUID_SERVICE_NORDIC_UART)?.getCharacteristic(UUID_CHAR_NORDIC_TX)
            val targetChar = tippssChar ?: uartChar
            if (targetChar != null) {
                gatt.setCharacteristicNotification(targetChar, true)
                val descriptor = targetChar.getDescriptor(UUID_CCCD)
                if (descriptor != null) {
                    @Suppress("DEPRECATION")
                    descriptor.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
                    @Suppress("DEPRECATION")
                    gatt.writeDescriptor(descriptor)
                }
                _uiState.value = _uiState.value.copy(
                    statusMessage = "Subscribed to telemetry notifications (${targetChar.uuid.toString().take(8)})."
                )
            } else {
                _uiState.value = _uiState.value.copy(
                    statusMessage = "Connected (${gatt.services.size} GATT services). Polling live RSSI."
                )
            }
        }

        @Deprecated("Deprecated in API 33")
        override fun onCharacteristicChanged(
            gatt: BluetoothGatt,
            characteristic: BluetoothGattCharacteristic
        ) {
            @Suppress("DEPRECATION")
            val bytes = characteristic.value ?: return
            handleIncomingTelemetryBytes(bytes)
            @SuppressLint("MissingPermission")
            try {
                gatt.readRemoteRssi()
            } catch (_: SecurityException) {
            }
        }

        override fun onCharacteristicChanged(
            gatt: BluetoothGatt,
            characteristic: BluetoothGattCharacteristic,
            value: ByteArray
        ) {
            handleIncomingTelemetryBytes(value)
        }
    }

    private fun handleIncomingTelemetryBytes(bytes: ByteArray) {
        val raw = String(bytes, StandardCharsets.UTF_8).trim()
        val parsed = parseTelemetryPayload(raw)
        if (parsed != null) {
            val nextCount = _uiState.value.packetsReceived + 1
            _uiState.value = _uiState.value.copy(
                liveImpedanceKOhm = round2(parsed.impedanceKOhm),
                liveSqiPct = round1(parsed.sqiPct),
                liveThetaAlphaRatio = round2(parsed.thetaAlphaRatio),
                packetsReceived = nextCount,
                lastPayloadPreview = raw.take(48)
            )
        }
    }

    @SuppressLint("MissingPermission")
    fun startBleScan() {
        stopVirtualLoopback()
        val adapter = bluetoothAdapter
        if (adapter == null || !adapter.isEnabled) {
            _uiState.value = _uiState.value.copy(
                statusMessage = "Bluetooth is disabled or unavailable on this device."
            )
            return
        }
        val scanner = adapter.bluetoothLeScanner
        if (scanner == null) {
            _uiState.value = _uiState.value.copy(
                statusMessage = "BLE Scanner unavailable."
            )
            return
        }
        try {
            if (isScannerActive) {
                scanner.stopScan(scanCallback)
            }
            val settings = ScanSettings.Builder()
                .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
                .build()
            scanner.startScan(null, settings, scanCallback)
            isScannerActive = true
            _uiState.value = _uiState.value.copy(
                connectionState = BleConnectionState.SCANNING,
                discoveredNodes = emptyList(),
                statusMessage = "Scanning BLE spectrum for TIPPSS Phantom, Arduino/ESP32, OpenBCI, or Muse..."
            )
        } catch (se: SecurityException) {
            _uiState.value = _uiState.value.copy(
                statusMessage = "Bluetooth permission required: ${se.message}"
            )
        }
    }

    @SuppressLint("MissingPermission")
    fun stopBleScan() {
        if (!isScannerActive) return
        try {
            bluetoothAdapter?.bluetoothLeScanner?.stopScan(scanCallback)
        } catch (_: Throwable) {
        }
        isScannerActive = false
        if (_uiState.value.connectionState == BleConnectionState.SCANNING) {
            _uiState.value = _uiState.value.copy(
                connectionState = BleConnectionState.DISCONNECTED,
                statusMessage = "Scan stopped (${_uiState.value.discoveredNodes.size} nodes found)."
            )
        }
    }

    @SuppressLint("MissingPermission")
    fun connectToNode(node: DiscoveredBleNode) {
        stopBleScan()
        stopVirtualLoopback()
        val dev = node.device ?: return
        try {
            activeGatt?.close()
            _uiState.value = _uiState.value.copy(
                connectionState = BleConnectionState.CONNECTING,
                connectedDeviceName = node.name,
                statusMessage = "Connecting GATT to ${node.name} (${node.address})..."
            )
            activeGatt = dev.connectGatt(context, false, gattCallback, BluetoothDevice.TRANSPORT_LE)
        } catch (se: SecurityException) {
            _uiState.value = _uiState.value.copy(
                connectionState = BleConnectionState.DISCONNECTED,
                statusMessage = "GATT connect permission error: ${se.message}"
            )
        }
    }

    /**
     * Starts a 1 Hz NIST SP 800-90A CSPRNG Benchtop Phantom Loopback stream so the user can test
     * live impedance & RSSI telemetry pipelines before external hardware is attached.
     */
    fun startVirtualPhantomLoopback() {
        stopBleScan()
        disconnect()
        _uiState.value = _uiState.value.copy(
            connectionState = BleConnectionState.VIRTUAL_PHANTOM_LOOPBACK,
            connectedDeviceName = "PocketGull Virtual 10kOhm Phantom",
            statusMessage = "Streaming 1 Hz NIST SP 800-90A benchtop resistor phantom telemetry."
        )
        virtualLoopJob = scope.launch {
            var count = _uiState.value.packetsReceived
            while (true) {
                val u1 = TippssFhirExporter.nextUniform53Bit().toFloat()
                val u2 = TippssFhirExporter.nextUniform53Bit().toFloat()
                val u3 = TippssFhirExporter.nextUniform53Bit().toFloat()

                val z = round2(4.4f + u1 * 1.4f) // 4.4 - 5.8 kOhm nominal sponge load
                val sqi = round1(94.5f + u2 * 5.0f) // 94.5% - 99.5% SQI
                val tar = round2(1.25f + u3 * 0.45f) // Theta/Alpha spectral ratio
                val rssi = -64 + ((u1 * 8f).roundToInt() - 4)
                count += 1
                val packet = "Z=${z}kOhm,SQI=${sqi}%,TAR=$tar"

                _uiState.value = _uiState.value.copy(
                    liveRssiDbm = rssi,
                    liveImpedanceKOhm = z,
                    liveSqiPct = sqi,
                    liveThetaAlphaRatio = tar,
                    packetsReceived = count,
                    lastPayloadPreview = packet
                )
                delay(1000L)
            }
        }
    }

    private fun stopVirtualLoopback() {
        virtualLoopJob?.cancel()
        virtualLoopJob = null
    }

    @SuppressLint("MissingPermission")
    fun disconnect() {
        stopBleScan()
        stopVirtualLoopback()
        try {
            activeGatt?.disconnect()
            activeGatt?.close()
        } catch (_: Throwable) {
        }
        activeGatt = null
        _uiState.value = _uiState.value.copy(
            connectionState = BleConnectionState.DISCONNECTED,
            connectedDeviceName = "None",
            statusMessage = "BLE link idle."
        )
    }

    private fun round1(v: Float): Float = (v * 10f).roundToInt() / 10f
    private fun round2(v: Float): Float = (v * 100f).roundToInt() / 100f
}
