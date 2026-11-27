// SPDX-License-Identifier: Apache-2.0
package app.pocketgull.companion

import android.Manifest
import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCallback
import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothGattDescriptor
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothProfile
import android.bluetooth.le.BluetoothLeScanner
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanResult
import android.bluetooth.le.ScanSettings
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import io.flutter.embedding.android.FlutterFragmentActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.EventChannel
import io.flutter.plugin.common.MethodChannel
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.util.UUID

/**
 * Native Android BLE GATT Central bridge for [BleWearablesService].
 *
 * Scans and connects to standard Bluetooth SIG clinical peripherals
 * (HR 0x180D, SpO2 0x1822, Temp 0x1809, BP 0x1810, Glucose/CGM 0x1808)
 * as well as the PocketGull Wear OS [avs_wear_app] GATT server.
 */
class BleWearablesBridge(private val activity: FlutterFragmentActivity) {
    companion object {
        const val METHOD_CHANNEL = "com.pocketgull.flutter/ble_wearables"
        const val EVENT_CHANNEL = "com.pocketgull.flutter/ble_wearables_events"
        private const val REQUEST_BLE_PERMISSIONS = 4201

        val HR_SERVICE: UUID = UUID.fromString("0000180d-0000-1000-8000-00805f9b34fb")
        val SPO2_SERVICE: UUID = UUID.fromString("00001822-0000-1000-8000-00805f9b34fb")
        val TEMP_SERVICE: UUID = UUID.fromString("00001809-0000-1000-8000-00805f9b34fb")
        val BP_SERVICE: UUID = UUID.fromString("00001810-0000-1000-8000-00805f9b34fb")
        val CGM_SERVICE: UUID = UUID.fromString("00001808-0000-1000-8000-00805f9b34fb")
        val AVS_WEAR_SERVICE: UUID = UUID.fromString("0000a750-0000-1000-8000-00805f9b34fb")

        val HR_MEASUREMENT_CHAR: UUID = UUID.fromString("00002a37-0000-1000-8000-00805f9b34fb")
        val SPO2_CONTINUOUS_CHAR: UUID = UUID.fromString("00002a5f-0000-1000-8000-00805f9b34fb")
        val SPO2_SPOT_CHAR: UUID = UUID.fromString("00002a5e-0000-1000-8000-00805f9b34fb")
        val TEMP_MEASUREMENT_CHAR: UUID = UUID.fromString("00002a1c-0000-1000-8000-00805f9b34fb")
        val CGM_MEASUREMENT_CHAR: UUID = UUID.fromString("00002a18-0000-1000-8000-00805f9b34fb")
        val AVS_CEDA_CHAR: UUID = UUID.fromString("0000ceda-0000-1000-8000-00805f9b34fb")

        val CCCD_UUID: UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb")

        val CLINICAL_SERVICES: Set<UUID> = setOf(
            HR_SERVICE,
            SPO2_SERVICE,
            TEMP_SERVICE,
            BP_SERVICE,
            CGM_SERVICE,
            AVS_WEAR_SERVICE,
        )

        val CLINICAL_CHARACTERISTICS: Set<UUID> = setOf(
            HR_MEASUREMENT_CHAR,
            SPO2_CONTINUOUS_CHAR,
            SPO2_SPOT_CHAR,
            TEMP_MEASUREMENT_CHAR,
            CGM_MEASUREMENT_CHAR,
            AVS_CEDA_CHAR,
        )
    }

    private val mainHandler = Handler(Looper.getMainLooper())
    private var eventSink: EventChannel.EventSink? = null
    private var bluetoothAdapter: BluetoothAdapter? = null
    private var scanner: BluetoothLeScanner? = null
    private var activeGatt: BluetoothGatt? = null
    private var isScanning = false
    private val discoveredDevices = linkedMapOf<String, BluetoothDevice>()

    fun attach(flutterEngine: FlutterEngine) {
        val manager = activity.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
        bluetoothAdapter = manager?.adapter
        scanner = bluetoothAdapter?.bluetoothLeScanner

        EventChannel(flutterEngine.dartExecutor.binaryMessenger, EVENT_CHANNEL)
            .setStreamHandler(object : EventChannel.StreamHandler {
                override fun onListen(arguments: Any?, events: EventChannel.EventSink?) {
                    eventSink = events
                }

                override fun onCancel(arguments: Any?) {
                    eventSink = null
                }
            })

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, METHOD_CHANNEL)
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "startScan" -> result.success(startScan())
                    "stopScan" -> {
                        stopScan()
                        result.success(true)
                    }
                    "connect" -> {
                        val deviceId = call.argument<String>("deviceId")
                        if (deviceId.isNullOrBlank()) {
                            result.error("INVALID_DEVICE_ID", "deviceId is required", null)
                        } else {
                            result.success(connect(deviceId))
                        }
                    }
                    "disconnect" -> {
                        disconnect()
                        result.success(true)
                    }
                    else -> result.notImplemented()
                }
            }
    }

    private fun requiredPermissions(): Array<String> =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            arrayOf(
                Manifest.permission.BLUETOOTH_SCAN,
                Manifest.permission.BLUETOOTH_CONNECT,
            )
        } else {
            arrayOf(Manifest.permission.ACCESS_FINE_LOCATION)
        }

    private fun hasBlePermissions(): Boolean =
        requiredPermissions().all {
            ContextCompat.checkSelfPermission(activity, it) == PackageManager.PERMISSION_GRANTED
        }

    @SuppressLint("MissingPermission")
    private fun startScan(): Boolean {
        if (!hasBlePermissions()) {
            ActivityCompat.requestPermissions(activity, requiredPermissions(), REQUEST_BLE_PERMISSIONS)
            emitEvent(mapOf("type" to "connectionState", "state" to "disconnected"))
            return false
        }
        val activeScanner = bluetoothAdapter?.bluetoothLeScanner ?: run {
            emitEvent(mapOf("type" to "connectionState", "state" to "error"))
            return false
        }
        scanner = activeScanner
        if (isScanning) return true

        discoveredDevices.clear()
        val settings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
            .build()

        isScanning = true
        emitEvent(mapOf("type" to "connectionState", "state" to "scanning"))
        activeScanner.startScan(null, settings, scanCallback)
        mainHandler.postDelayed({ stopScan() }, 15_000L)
        return true
    }

    @SuppressLint("MissingPermission")
    fun stopScan() {
        if (!isScanning) return
        isScanning = false
        if (hasBlePermissions()) {
            runCatching { scanner?.stopScan(scanCallback) }
        }
    }

    @SuppressLint("MissingPermission")
    private fun connect(deviceId: String): Boolean {
        if (!hasBlePermissions()) {
            ActivityCompat.requestPermissions(activity, requiredPermissions(), REQUEST_BLE_PERMISSIONS)
            return false
        }
        stopScan()
        val device = discoveredDevices[deviceId]
            ?: runCatching { bluetoothAdapter?.getRemoteDevice(deviceId) }.getOrNull()
            ?: return false

        activeGatt?.disconnect()
        activeGatt?.close()
        emitEvent(mapOf("type" to "connectionState", "state" to "connecting"))
        activeGatt = device.connectGatt(activity, false, gattCallback, BluetoothDevice.TRANSPORT_LE)
        return activeGatt != null
    }

    @SuppressLint("MissingPermission")
    fun disconnect() {
        stopScan()
        if (hasBlePermissions()) {
            runCatching {
                activeGatt?.disconnect()
                activeGatt?.close()
            }
        }
        activeGatt = null
        emitEvent(mapOf("type" to "connectionState", "state" to "disconnected"))
    }

    private val scanCallback = object : ScanCallback() {
        @SuppressLint("MissingPermission")
        override fun onScanResult(callbackType: Int, result: ScanResult) {
            val device = result.device ?: return
            val uuids = result.scanRecord?.serviceUuids?.map { it.uuid } ?: emptyList()
            val name = result.scanRecord?.deviceName ?: device.name ?: "Clinical BLE"
            val isClinical = uuids.any { it in CLINICAL_SERVICES } ||
                name.contains("PocketGull", ignoreCase = true) ||
                name.contains("Polar", ignoreCase = true) ||
                name.contains("Garmin", ignoreCase = true)
            if (!isClinical && uuids.isNotEmpty()) return

            discoveredDevices[device.address] = device
            emitEvent(
                mapOf(
                    "type" to "deviceDiscovered",
                    "id" to device.address,
                    "name" to name,
                    "rssi" to result.rssi,
                    "serviceUuids" to uuids.map { it.toString() },
                )
            )
        }
    }

    private val gattCallback = object : BluetoothGattCallback() {
        @SuppressLint("MissingPermission")
        override fun onConnectionStateChange(gatt: BluetoothGatt, status: Int, newState: Int) {
            if (newState == BluetoothProfile.STATE_CONNECTED) {
                emitEvent(mapOf("type" to "connectionState", "state" to "connected"))
                gatt.discoverServices()
            } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                emitEvent(mapOf("type" to "connectionState", "state" to "disconnected"))
                gatt.close()
                if (activeGatt == gatt) activeGatt = null
            }
        }

        @SuppressLint("MissingPermission")
        override fun onServicesDiscovered(gatt: BluetoothGatt, status: Int) {
            if (status != BluetoothGatt.GATT_SUCCESS) return
            for (service in gatt.services) {
                for (characteristic in service.characteristics) {
                    if (characteristic.uuid in CLINICAL_CHARACTERISTICS) {
                        gatt.setCharacteristicNotification(characteristic, true)
                        val descriptor = characteristic.getDescriptor(CCCD_UUID)
                        if (descriptor != null) {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                gatt.writeDescriptor(descriptor, BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE)
                            } else {
                                @Suppress("DEPRECATION")
                                descriptor.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
                                @Suppress("DEPRECATION")
                                gatt.writeDescriptor(descriptor)
                            }
                        }
                    }
                }
            }
        }

        @Deprecated("Deprecated in API 33")
        override fun onCharacteristicChanged(
            gatt: BluetoothGatt,
            characteristic: BluetoothGattCharacteristic,
        ) {
            @Suppress("DEPRECATION")
            val bytes = characteristic.value ?: return
            handleCharacteristicBytes(characteristic.uuid, bytes)
        }

        override fun onCharacteristicChanged(
            gatt: BluetoothGatt,
            characteristic: BluetoothGattCharacteristic,
            value: ByteArray,
        ) {
            handleCharacteristicBytes(characteristic.uuid, value)
        }
    }

    private fun handleCharacteristicBytes(uuid: UUID, bytes: ByteArray) {
        val vitals = mutableMapOf<String, Any?>("type" to "vitals")
        when (uuid) {
            HR_MEASUREMENT_CHAR -> {
                if (bytes.size >= 2) {
                    val flags = bytes[0].toInt() and 0xFF
                    val isUint16 = (flags and 0x01) != 0
                    val hr = if (isUint16 && bytes.size >= 3) {
                        (bytes[1].toInt() and 0xFF) or ((bytes[2].toInt() and 0xFF) shl 8)
                    } else {
                        bytes[1].toInt() and 0xFF
                    }
                    vitals["hr"] = hr
                }
            }
            AVS_CEDA_CHAR -> {
                if (bytes.size >= 12) {
                    val buf = ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN)
                    vitals["hr"] = buf.getFloat().toInt()
                    buf.getFloat() // ceda microsiemens
                    vitals["temp"] = buf.getFloat().toDouble()
                }
            }
            SPO2_CONTINUOUS_CHAR, SPO2_SPOT_CHAR -> {
                if (bytes.size >= 3) {
                    val raw = (bytes[1].toInt() and 0xFF) or ((bytes[2].toInt() and 0xFF) shl 8)
                    vitals["spO2"] = raw.toDouble()
                }
            }
            else -> return
        }
        if (vitals.size > 1) emitEvent(vitals)
    }

    private fun emitEvent(payload: Map<String, Any?>) {
        mainHandler.post { eventSink?.success(payload) }
    }

    fun dispose() {
        disconnect()
    }
}
