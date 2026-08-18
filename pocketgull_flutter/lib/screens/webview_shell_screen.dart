import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../bridge/native_bridge.dart';

/// Fullscreen Hybrid Shell Host wrapping the Angular Web Application
class WebViewShellScreen extends StatefulWidget {
  final String initialUrl;

  const WebViewShellScreen({
    super.key,
    this.initialUrl = 'https://pocketgull.app',
  });

  @override
  State<WebViewShellScreen> createState() => _WebViewShellScreenState();
}

class _WebViewShellScreenState extends State<WebViewShellScreen> {
  late final WebViewController _controller;
  NativeBridgeController? _bridgeController;
  
  bool _isLoading = true;
  double _loadingProgress = 0.0;
  bool _hasError = false;
  String _errorMessage = '';
  bool _isOffline = false;
  StreamSubscription<List<ConnectivityResult>>? _connectivitySubscription;

  @override
  void initState() {
    super.initState();
    _initConnectivity();
    _initWebViewController();
  }

  Future<void> _initConnectivity() async {
    final connectivity = Connectivity();
    final results = await connectivity.checkConnectivity();
    _updateConnectionStatus(results);

    _connectivitySubscription = connectivity.onConnectivityChanged.listen(_updateConnectionStatus);
  }

  void _updateConnectionStatus(List<ConnectivityResult> results) {
    final isOffline = results.every((r) => r == ConnectivityResult.none);
    if (mounted && isOffline != _isOffline) {
      setState(() {
        _isOffline = isOffline;
      });
      if (!isOffline && _hasError) {
        _retryLoad();
      }
    }
  }

  void _initWebViewController() {
    final controller = WebViewController();

    // Set JavaScript execution mode
    controller.setJavaScriptMode(JavaScriptMode.unrestricted);

    // Set custom User-Agent identifying the mobile hybrid shell
    controller.setUserAgent('PocketGullMobile/2.0 (Hybrid-Shell)');

    // Background color matching dark mode canvas
    controller.setBackgroundColor(const Color(0xFF09090B));

    // Initialize Native Bridge
    _bridgeController = NativeBridgeController(webViewController: controller);

    // Add JavaScript Channel
    controller.addJavaScriptChannel(
      'PocketGullNativeBridge',
      onMessageReceived: (JavaScriptMessage message) {
        _bridgeController?.handleMessage(message);
      },
    );

    // Set navigation and page lifecycle delegate
    controller.setNavigationDelegate(
      NavigationDelegate(
        onProgress: (int progress) {
          if (mounted) {
            setState(() {
              _loadingProgress = progress / 100.0;
            });
          }
        },
        onPageStarted: (String url) {
          if (mounted) {
            setState(() {
              _isLoading = true;
              _hasError = false;
            });
          }
        },
        onPageFinished: (String url) {
          if (mounted) {
            setState(() {
              _isLoading = false;
            });
          }
          final platformName = kIsWeb ? 'web' : defaultTargetPlatform.name;
          controller.runJavaScript(
            'window.isPocketGullNativeHost = true; '
            'window.pocketGullNativeClient = { version: "2.0.0", platform: "$platformName", isHybrid: true };',
          );
        },
        onWebResourceError: (WebResourceError error) {
          if (error.isForMainFrame ?? true) {
            if (mounted) {
              setState(() {
                _isLoading = false;
                _hasError = true;
                _errorMessage = error.description;
              });
            }
          }
        },
        onNavigationRequest: (NavigationRequest request) {
          return NavigationDecision.navigate;
        },
      ),
    );

    controller.loadRequest(Uri.parse(widget.initialUrl));
    _controller = controller;
  }

  Future<void> _retryLoad() async {
    setState(() {
      _isLoading = true;
      _hasError = false;
    });
    await _controller.reload();
  }

  @override
  void dispose() {
    _connectivitySubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF09090B),
      body: SafeArea(
        top: true,
        bottom: true,
        child: Stack(
          children: [
            // Main Web View
            if (!_hasError && !_isOffline)
              RefreshIndicator(
                onRefresh: () async {
                  await _controller.reload();
                },
                color: const Color(0xFF6366F1),
                backgroundColor: const Color(0xFF18181B),
                child: WebViewWidget(controller: _controller),
              ),

            // Loading Progress Bar
            if (_isLoading)
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: LinearProgressIndicator(
                  value: _loadingProgress > 0.05 ? _loadingProgress : null,
                  backgroundColor: Colors.transparent,
                  valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF6366F1)),
                  minHeight: 2.5,
                ),
              ),

            // Offline / Error Overlay
            if (_hasError || _isOffline)
              _buildErrorView(),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 28.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF27272A),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFF3F3F46)),
              ),
              child: Icon(
                _isOffline ? Icons.wifi_off_rounded : Icons.cloud_off_rounded,
                size: 36,
                color: const Color(0xFFA1A1AA),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              _isOffline ? 'No Internet Connection' : 'Unable to Connect',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w700,
                letterSpacing: -0.3,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _isOffline
                  ? 'Please check your Wi-Fi or cellular network settings and try again.'
                  : _errorMessage.isNotEmpty
                      ? _errorMessage
                      : 'Could not reach the clinical care strategy engine.',
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Color(0xFF71717A),
                fontSize: 13,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _retryLoad,
              icon: const Icon(Icons.refresh_rounded, size: 18),
              label: const Text('Try Again'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4F46E5),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
