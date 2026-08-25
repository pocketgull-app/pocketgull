import { Injectable, signal, effect, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { PatientStateService } from './patient-state.service';
import { AuthService } from './auth.service';
import { IPatientVitals } from './patient.types';

export interface ICollaborationNote {
  id: string;
  clinicianName: string;
  text: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class CollaborationService {
  private socket: Socket | null = null;
  private patientState = inject(PatientStateService);
  private auth = inject(AuthService);

  // Reactive State using Signals
  activeClinicians = signal<string[]>([]);
  collaborationNotes = signal<ICollaborationNote[]>([]);
  isConnected = signal<boolean>(false);

  // In this architecture, patient state is global for the current session
  private readonly SESSION_ROOM_ID = 'global-clinical-room';

  constructor() {
    this.connect();
  }

  private connect(): void {
    if (this.socket) return;

    this.socket = io({
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('[CollaborationService] Connected to real-time sync.');
      this.isConnected.set(true);
      this.joinRoom();
    });

    this.socket.on('disconnect', () => {
      console.log('[CollaborationService] Disconnected.');
      this.isConnected.set(false);
      this.activeClinicians.set([]);
    });

    // Listen for incoming vitals
    this.socket.on('vitals_updated', (vitals: Partial<IPatientVitals>) => {
      console.log('[CollaborationService] Received vitals update:', vitals);
      this.patientState.vitals.update(current => ({ ...current, ...vitals }));
    });

    // Listen for chat notes from other clinicians
    this.socket.on('note_received', (note: ICollaborationNote) => {
      this.collaborationNotes.update(notes => [...notes, note]);
    });

    // Listen for presence updates
    this.socket.on('presence_updated', (clinicianName: string) => {
      this.activeClinicians.update(clinicians => {
        if (!clinicians.includes(clinicianName)) {
          return [...clinicians, clinicianName];
        }
        return clinicians;
      });
    });
  }

  private joinRoom(): void {
    if (!this.socket) return;
    
    this.socket.emit('join_patient_room', this.SESSION_ROOM_ID);
    
    // Announce our presence to others in the room
    // Mock user for now since AuthService might not have currentUser()
    const clinicianName = 'Dr. Colleague'; 
    this.socket.emit('presence_update', { patientId: this.SESSION_ROOM_ID, clinician: clinicianName });
  }

  public sendNote(text: string): void {
    if (!this.socket) return;

    const newNote: ICollaborationNote = {
      id: crypto.randomUUID(),
      clinicianName: 'Dr. Colleague',
      text,
      timestamp: new Date().toISOString()
    };

    this.collaborationNotes.update(notes => [...notes, newNote]);

    this.socket.emit('send_note', {
      patientId: this.SESSION_ROOM_ID,
      note: newNote
    });
  }

  public syncVitals(vitals: Partial<IPatientVitals>): void {
    if (!this.socket) return;

    this.socket.emit('sync_vitals', {
      patientId: this.SESSION_ROOM_ID,
      vitals
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected.set(false);
    this.activeClinicians.set([]);
  }
}
