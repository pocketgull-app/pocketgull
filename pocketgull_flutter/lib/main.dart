import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/webview_shell_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Dark edge-to-edge system navigation & status bar
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF09090B),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  runApp(const PocketGullApp());
}

class PocketGullApp extends StatelessWidget {
  const PocketGullApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Pocket Gull',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF09090B),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF6366F1),
          surface: Color(0xFF18181B),
        ),
      ),
      home: const WebViewShellScreen(),
    );
  }
}
