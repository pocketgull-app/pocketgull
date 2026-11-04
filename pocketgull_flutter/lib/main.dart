import 'dart:async';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'services/local_intelligence_service.dart';
import 'services/orcid_service.dart';
import 'services/circadian_sleepiness_service.dart';
import 'screens/splash_screen.dart';
import 'providers/services_providers.dart';
import 'services/theme_service.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // If you're going to use other Firebase services in the background, such as Firestore,
  // make sure you call `initializeApp` before using other Firebase services.
  await Firebase.initializeApp();
  debugPrint("Handling a background message: ${message.messageId}");
}

void main() async {
  runZonedGuarded(() async {
    WidgetsFlutterBinding.ensureInitialized();

    // Note: Uncomment after running 'flutterfire configure'
    /*
    try {
      await Firebase.initializeApp();
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
      
      final messaging = FirebaseMessaging.instance;
      await messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );
      
      final token = await messaging.getToken();
      print("FCM Token: $token");
    } catch (e) {
      print("Firebase Initialization Error: $e");
      print("Note: You must run 'flutterfire configure' to generate native config files.");
    }
    */
    debugPrint("Firebase initialization skipped. Run 'flutterfire configure' first.");
    
    // Initialize Hive local offline database
    await Hive.initFlutter();
    await Hive.openBox<dynamic>('pocket_gull_db');

    final localAI = LocalIntelligenceService();
    try {
      await localAI.initialize().timeout(
        const Duration(seconds: 5),
        onTimeout: () => debugPrint('Local AI initialization timed out.'),
      );
    } catch (e) {
      debugPrint('Critical error during Local AI initialization: $e');
    }

    final orcidService = OrcidService();
    await orcidService.initialize();
    
    final circadianService = CircadianSleepinessService();
    
    runApp(ProviderScope(
      overrides: [
        localIntelligenceProvider.overrideWithValue(localAI),
        orcidServiceProvider.overrideWithValue(orcidService),
        circadianSleepinessProvider.overrideWithValue(circadianService),
      ],
      child: const PocketGullApp(),
    ));
  }, (error, stack) {
    debugPrint('GLOBAL ERROR: $error');
    debugPrint(stack.toString());
  });
}

class PocketGullApp extends ConsumerWidget {
  const PocketGullApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeState = ref.watch(themeProvider);

    return MaterialApp(
      title: 'Pocket Gull',
      debugShowCheckedModeBanner: false,
      theme: themeState.themeData,
      home: const SplashScreen(),
    );
  }
}
