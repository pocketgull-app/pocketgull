import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_auth/firebase_auth.dart' as fb_auth;
import 'package:google_sign_in/google_sign_in.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/patient_types.dart';

/// Firestore sync — Firebase Auth + Firestore patient vault.
///
/// Flutter parity with Angular `firestore-sync.service.ts`.
/// Handles Google sign-in with clinician whitelist, and syncs patient
/// documents to Firestore under `clinicians/{uid}/patients/{id}`.

const String _cliniciansKey = 'pg_registered_clinicians';

class RegisteredClinician {
  final String name;
  final String email;
  final String clinic;
  final String pin;

  const RegisteredClinician({
    required this.name,
    required this.email,
    required this.clinic,
    required this.pin,
  });

  Map<String, dynamic> toJson() => {
        'name': name,
        'email': email,
        'clinic': clinic,
        'pin': pin,
      };

  factory RegisteredClinician.fromJson(Map<String, dynamic> json) {
    return RegisteredClinician(
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      clinic: json['clinic'] as String? ?? '',
      pin: json['pin'] as String? ?? '',
    );
  }
}

class FirestoreSyncState {
  final String? currentUser;
  final String? currentUserEmail;
  final bool isAuthLoading;

  const FirestoreSyncState({
    this.currentUser,
    this.currentUserEmail,
    this.isAuthLoading = true,
  });

  bool get isAuthenticated => currentUser != null;

  FirestoreSyncState copyWith({
    String? currentUser,
    String? currentUserEmail,
    bool? isAuthLoading,
  }) {
    return FirestoreSyncState(
      currentUser: currentUser ?? this.currentUser,
      currentUserEmail: currentUserEmail ?? this.currentUserEmail,
      isAuthLoading: isAuthLoading ?? this.isAuthLoading,
    );
  }
}

class FirestoreSyncNotifier extends Notifier<FirestoreSyncState> {
  @override
  FirestoreSyncState build() {
    _listenToAuthState();
    return const FirestoreSyncState();
  }

  // ─── Clinician Registry ───────────────────────────────────────────

  List<RegisteredClinician> _defaultClinicians() {
    return const [
      RegisteredClinician(
        name: 'Phil Gear',
        email: 'dpo@pocketgull.app',
        clinic: 'PocketGull Clinic',
        pin: '1234',
      ),
    ];
  }

  Future<List<RegisteredClinician>> getRegisteredClinicians() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final stored = prefs.getString(_cliniciansKey);
      if (stored != null && stored.isNotEmpty) {
        final List<dynamic> decoded = jsonDecode(stored) as List<dynamic>;
        return decoded
            .map((j) => RegisteredClinician.fromJson(j as Map<String, dynamic>))
            .toList();
      }
    } catch (e) {
      debugPrint('[FirestoreSync] Failed to load clinicians: $e');
    }
    return _defaultClinicians();
  }

  Future<bool> isEmailRegistered(String email) async {
    final list = await getRegisteredClinicians();
    return list.any((c) => c.email.toLowerCase() == email.toLowerCase());
  }

  // ─── Auth ─────────────────────────────────────────────────────────

  void _listenToAuthState() {
    try {
      fb_auth.FirebaseAuth.instance.authStateChanges().listen((user) async {
        if (user != null) {
          if (await isEmailRegistered(user.email ?? '')) {
            state = FirestoreSyncState(
              currentUser: user.uid,
              currentUserEmail: user.email,
              isAuthLoading: false,
            );
          } else {
            debugPrint('[FirestoreSync] Unauthorized email: ${user.email}');
            await fb_auth.FirebaseAuth.instance.signOut();
            state = const FirestoreSyncState(isAuthLoading: false);
          }
        } else if (state.currentUser != 'mock-google-clinician') {
          state = const FirestoreSyncState(isAuthLoading: false);
        }
      });
    } catch (e) {
      debugPrint('[FirestoreSync] Auth listener setup failed: $e');
      state = const FirestoreSyncState(isAuthLoading: false);
    }
  }

  /// Triggers Google sign-in. Falls back to mock auth when Firebase
  /// is not configured (placeholder API keys).
  Future<void> signInWithGoogle({String? mockEmail}) async {
    try {
      // Attempt real Google Sign-In.
      final googleUser = await GoogleSignIn.instance.authenticate();
      final googleAuth = googleUser.authentication;
      final credential = fb_auth.GoogleAuthProvider.credential(
        idToken: googleAuth.idToken,
      );

      final result =
          await fb_auth.FirebaseAuth.instance.signInWithCredential(credential);

      if (result.user != null &&
          !(await isEmailRegistered(result.user!.email ?? ''))) {
        debugPrint('[FirestoreSync] Post-sign-in unauthorized: ${result.user!.email}');
        await fb_auth.FirebaseAuth.instance.signOut();
        state = const FirestoreSyncState(isAuthLoading: false);
        throw Exception('Access Denied: Clinician account unauthorized.');
      }
    } catch (e) {
      // Fallback to mock auth for placeholder configs or sign-in errors.
      debugPrint('[FirestoreSync] Google sign-in failed, using mock: $e');
      final email = mockEmail ?? 'dpo@pocketgull.app';
      if (!(await isEmailRegistered(email))) {
        throw Exception('Access Denied: Clinician email is not registered.');
      }
      state = FirestoreSyncState(
        currentUser: 'mock-google-clinician',
        currentUserEmail: email,
        isAuthLoading: false,
      );
    }
  }

  Future<void> logout() async {
    if (state.currentUser != 'mock-google-clinician') {
      try {
        await fb_auth.FirebaseAuth.instance.signOut();
      } catch (e) {
        debugPrint('[FirestoreSync] Sign-out failed: $e');
      }
    }
    state = const FirestoreSyncState(isAuthLoading: false);
  }

  // ─── Firestore Patient Sync ───────────────────────────────────────

  /// Pushes a patient document to the secure Firestore vault.
  Future<void> syncPatientToCloud(Patient patient) async {
    final uid = state.currentUser;
    if (uid == null) {
      debugPrint('[FirestoreSync] Cannot sync — not authenticated.');
      return;
    }
    if (uid == 'mock-google-clinician') {
      debugPrint('[FirestoreSync] Mock sync complete (no cloud write).');
      return;
    }
    try {
      final docRef = FirebaseFirestore.instance
          .collection('clinicians')
          .doc(uid)
          .collection('patients')
          .doc(patient.id);

      await docRef.set({
        'id': patient.id,
        'name': patient.name,
        'age': patient.age,
        'gender': patient.gender,
        'lastVisit': patient.lastVisit,
        'preexistingConditions': patient.preexistingConditions,
        'patientGoals': patient.patientGoals,
        'triageScore': patient.triageScore,
        'kaizenColor': patient.kaizenColor,
      }, SetOptions(merge: true));

      debugPrint('[FirestoreSync] Synced ${patient.id} to cloud vault.');
    } catch (e) {
      debugPrint('[FirestoreSync] Sync failed: $e');
    }
  }

  /// Pulls a patient chart from the secure Firestore vault.
  Future<Map<String, dynamic>?> fetchPatientFromCloud(String patientId) async {
    final uid = state.currentUser;
    if (uid == null) return null;
    if (uid == 'mock-google-clinician') {
      debugPrint('[FirestoreSync] Mock fetch (returning null).');
      return null;
    }
    try {
      final snap = await FirebaseFirestore.instance
          .collection('clinicians')
          .doc(uid)
          .collection('patients')
          .doc(patientId)
          .get();

      return snap.exists ? snap.data() : null;
    } catch (e) {
      debugPrint('[FirestoreSync] Fetch failed: $e');
      return null;
    }
  }
}

final firestoreSyncProvider =
    NotifierProvider<FirestoreSyncNotifier, FirestoreSyncState>(() {
  return FirestoreSyncNotifier();
});
