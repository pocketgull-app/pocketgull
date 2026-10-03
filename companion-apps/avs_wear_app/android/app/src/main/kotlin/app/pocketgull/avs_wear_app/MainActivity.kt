package app.pocketgull.avs_wear_app

import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothGattServer
import android.bluetooth.BluetoothGattServerCallback
import android.bluetooth.BluetoothGattService
import android.bluetooth.BluetoothManager
import android.bluetooth.le.AdvertiseCallback
import android.bluetooth.le.AdvertiseData
import android.bluetooth.le.AdvertiseSettings
import android.bluetooth.le.BluetoothLeAdvertiser
import android.content.Context
import android.os.Build
import android.os.ParcelUuid
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.EventChannel
import io.flutter.plugin.common.MethodChannel
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.util.UUID

class MainActivity : FlutterActivity() {
    private val HAPTICS_CHANNEL = "app.pocketgull.avs/haptics"
    private val BLE_CHANNEL = "app.pocketgull.avs/ble"
    private val HAPTIC_EVENTS_CHANNEL = "app.pocketgull.avs/haptic_commands"

    private val SERVICE_UUID = UUID.fromString("0000avs0-0000-1000-8000-00805f9b34fb")
    private val CEDA_CHAR_UUID = UUID.fromString("0000ceda-0000-1000-8000-00805f9b34fb")
    private val HAPTIC_CHAR_UUID = UUID.fromString("0000hapt-0000-1000-8000-00805f9b34fb")

    private var vibrator: Vibrator? = null
    private var bluetoothGattServer: BluetoothGattServer? = null
    private var bluetoothLeAdvertiser: BluetoothLeAdvertiser? = null
    private var hapticEventSink: EventChannel.EventSink? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        // Initialize Vibrator
        vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibratorManager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }

        // Haptics MethodChannel
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, HAPTICS_CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "playMicroClick" -> {
                    val amplitude = call.argument<Int>("amplitude") ?: 120
                    val durationMs = (call.argument<Int>("durationMs") ?: 20).toLong()
                    playMicroClick(amplitude, durationMs)
                    result.success(true)
                }
                "playWaveform" -> {
                    val timings = (call.argument<List<Int>>("timings") ?: listOf(0, 100, 100)).map { it.toLong() }.toLongArray()
                    val amplitudes = (call.argument<List<Int>>("amplitudes") ?: listOf(0, 120, 0)).toIntArray()
                    val repeat = call.argument<Int>("repeat") ?: -1
                    playWaveform(timings, amplitudes, repeat)
                    result.success(true)
                }
                "stopHaptics" -> {
                    vibrator?.cancel()
                    result.success(true)
                }
                else -> result.notImplemented()
            }
        }

        // BLE MethodChannel
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, BLE_CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "startGattServer" -> {
                    val started = startGattServer()
                    result.success(started)
                }
                "stopGattServer" -> {
                    stopGattServer()
                    result.success(true)
                }
                "updateBiofeedback" -> {
                    val hr = (call.argument<Double>("hr") ?: 72.0).toFloat()
                    val ceda = (call.argument<Double>("ceda") ?: 1.5).toFloat()
                    val temp = (call.argument<Double>("temp") ?: 34.0).toFloat()
                    notifyGattClients(hr, ceda, temp)
                    result.success(true)
                }
                else -> result.notImplemented()
            }
        }

        // Incoming Haptic Command EventChannel (from Web Bluetooth)
        EventChannel(flutterEngine.dartExecutor.binaryMessenger, HAPTIC_EVENTS_CHANNEL).setStreamHandler(
            object : EventChannel.StreamHandler {
                override fun onListen(arguments: Any?, events: EventChannel.EventSink?) {
                    hapticEventSink = events
                }

                override fun onCancel(arguments: Any?) {
                    hapticEventSink = null
                }
            }
        )
    }

    private fun playMicroClick(amplitude: Int, durationMs: Long) {
        val amp = amplitude.coerceIn(1, 255)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val effect = VibrationEffect.createOneShot(durationMs, amp)
            vibrator?.vibrate(effect)
        } else {
            @Suppress("DEPRECATION")
            vibrator?.vibrate(durationMs)
        }
    }

    private fun playWaveform(timings: LongArray, amplitudes: IntArray, repeat: Int) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val effect = VibrationEffect.createWaveform(timings, amplitudes, repeat)
            vibrator?.vibrate(effect)
        } else {
            @Suppress("DEPRECATION")
            vibrator?.vibrate(timings, repeat)
        }
    }

    private fun startGattServer(): Boolean {
        val bluetoothManager = getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        val bluetoothAdapter = bluetoothManager.adapter ?: return false

        bluetoothLeAdvertiser = bluetoothAdapter.bluetoothLeAdvertiser ?: return false

        // Setup GATT Server
        bluetoothGattServer = bluetoothManager.openGattServer(this, object : BluetoothGattServerCallback() {
            override fun onCharacteristicWriteRequest(
                device: android.bluetooth.BluetoothDevice?,
                requestId: Int,
                characteristic: BluetoothGattCharacteristic?,
                preparedWrite: Boolean,
                responseNeeded: Boolean,
                offset: Int,
                value: ByteArray?
            ) {
                super.onCharacteristicWriteRequest(device, requestId, characteristic, preparedWrite, responseNeeded, offset, value)
                if (characteristic?.uuid == HAPTIC_CHAR_UUID && value != null) {
                    val bandCode = if (value.isNotEmpty()) value[0].toInt() else 0
                    runOnUiThread {
                        hapticEventSink?.success(bandCode)
                    }
                }
                if (responseNeeded) {
                    bluetoothGattServer?.sendResponse(device, requestId, android.bluetooth.BluetoothGatt.GATT_SUCCESS, offset, value)
                }
            }
        })

        val service = BluetoothGattService(SERVICE_UUID, BluetoothGattService.SERVICE_TYPE_PRIMARY)

        // cEDA + Biofeedback characteristic (Read / Notify)
        val cedaChar = BluetoothGattCharacteristic(
            CEDA_CHAR_UUID,
            BluetoothGattCharacteristic.PROPERTY_READ or BluetoothGattCharacteristic.PROPERTY_NOTIFY,
            BluetoothGattCharacteristic.PERMISSION_READ
        )
        service.addCharacteristic(cedaChar)

        // Haptic Command characteristic (Write)
        val hapticChar = BluetoothGattCharacteristic(
            HAPTIC_CHAR_UUID,
            BluetoothGattCharacteristic.PROPERTY_WRITE or BluetoothGattCharacteristic.PROPERTY_WRITE_NO_RESPONSE,
            BluetoothGattCharacteristic.PERMISSION_WRITE
        )
        service.addCharacteristic(hapticChar)

        bluetoothGattServer?.addService(service)

        // Start Advertising
        val settings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
            .setConnectable(true)
            .setTimeout(0)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
            .build()

        val data = AdvertiseData.Builder()
            .setIncludeDeviceName(true)
            .addServiceUuid(ParcelUuid(SERVICE_UUID))
            .build()

        bluetoothLeAdvertiser?.startAdvertising(settings, data, object : AdvertiseCallback() {
            override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
                super.onStartSuccess(settingsInEffect)
            }
        })

        return true
    }

    private fun notifyGattClients(hr: Float, ceda: Float, temp: Float) {
        val service = bluetoothGattServer?.getService(SERVICE_UUID) ?: return
        val char = service.getCharacteristic(CEDA_CHAR_UUID) ?: return

        // 12-byte payload: 3 IEEE-754 Floats (HR, cEDA, Temp)
        val buffer = ByteBuffer.allocate(12).order(ByteOrder.LITTLE_ENDIAN)
        buffer.putFloat(hr)
        buffer.putFloat(ceda)
        buffer.putFloat(temp)
        char.value = buffer.array()

        val bluetoothManager = getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        val connectedDevices = bluetoothManager.getConnectedDevices(android.bluetooth.BluetoothProfile.GATT)
        for (device in connectedDevices) {
            bluetoothGattServer?.notifyCharacteristicChanged(device, char, false)
        }
    }

    private fun stopGattServer() {
        bluetoothLeAdvertiser?.stopAdvertising(object : AdvertiseCallback() {})
        bluetoothGattServer?.close()
        bluetoothGattServer = null
        bluetoothLeAdvertiser = null
    }

    override fun onDestroy() {
        stopGattServer()
        vibrator?.cancel()
        super.onDestroy()
    }
}
