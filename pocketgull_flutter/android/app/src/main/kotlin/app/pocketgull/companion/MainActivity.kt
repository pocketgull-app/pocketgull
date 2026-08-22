package app.pocketgull.companion

import android.os.Bundle
import io.flutter.embedding.android.FlutterFragmentActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterFragmentActivity() {
    private val CHANNEL = "app.pocketgull.companion/telemetry"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "getStoreFlavor" -> {
                    val storeName = packageManager.getApplicationInfo(packageName, 0).metaData?.getString("storeName") ?: "Standard"
                    result.success(storeName)
                }
                "getDeviceTelemetry" -> {
                    val telemetry = mapOf(
                        "osVersion" to android.os.Build.VERSION.RELEASE,
                        "sdkInt" to android.os.Build.VERSION.SDK_INT,
                        "manufacturer" to android.os.Build.MANUFACTURER,
                        "model" to android.os.Build.MODEL,
                        "isFireOS" to (android.os.Build.MANUFACTURER.equals("Amazon", ignoreCase = true))
                    )
                    result.success(telemetry)
                }
                else -> {
                    result.notImplemented()
                }
            }
        }
    }
}
