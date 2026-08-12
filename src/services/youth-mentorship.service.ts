import { Injectable, signal, computed } from '@angular/core';

export interface IYouthVolunteerProgram {
  id: string;
  programTitle: string;
  targetYouthGroup: string;
  mentorRole: string;
  emojiBadge: string;
  verifiedHoursCount: number;
  impactSummary: string;
}

export interface IVolunteerMentor {
  id: string;
  mentorName: string;
  universityName: string;
  totalServiceHours: number;
  badgesEarned: string[];
  activeMenteesCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class YouthMentorshipService {
  private activePrograms = signal<IYouthVolunteerProgram[]>([
    {
      id: 'prog-001',
      programTitle: 'K-12 Mindful Classroom AVS Soundscapes',
      targetYouthGroup: 'Middle & High School Students',
      mentorRole: 'Lead 10-min 528Hz Solfeggio soundscape & box breathing sessions',
      emojiBadge: '🌱🏫🎧',
      verifiedHoursCount: 1420,
      impactSummary: 'Helped 3,200+ K-12 students develop emotional regulation and exam stress reduction skills.'
    },
    {
      id: 'prog-002',
      programTitle: 'Youth Sports Autonomic Recovery Corps',
      targetYouthGroup: 'Youth & High School Student Athletes',
      mentorRole: 'Teach youth teams HRV recovery tracking and hydration balance',
      emojiBadge: '🫀⚽⚡',
      verifiedHoursCount: 980,
      impactSummary: 'Trained 1,800+ youth athletes on overtraining prevention and sleep hygiene.'
    },
    {
      id: 'prog-003',
      programTitle: 'Professor Puffin Socratic Health Literacy Guild',
      targetYouthGroup: 'Underrepresented K-12 Scholars',
      mentorRole: '1-on-1 Socratic health literacy mentorship exploring human biology',
      emojiBadge: '🐧📚🧠',
      verifiedHoursCount: 2150,
      impactSummary: 'Mentored 1,100+ students on science careers and personal health sovereignty.'
    }
  ]);

  private volunteerMentors = signal<IVolunteerMentor[]>([
    {
      id: 'm-101',
      mentorName: 'Maya Lin (Med Student)',
      universityName: 'Stanford University',
      totalServiceHours: 48,
      badgesEarned: ['🎖️ Youth Health Corps Medal', '🌱 Mindful Classroom Lead'],
      activeMenteesCount: 4
    },
    {
      id: 'm-102',
      mentorName: 'Marcus Vance (Bioengineer)',
      universityName: 'MIT',
      totalServiceHours: 62,
      badgesEarned: ['🎖️ Presidential Service Badge', '🫀 Youth Sports Recovery Lead'],
      activeMenteesCount: 6
    }
  ]);

  readonly programs = this.activePrograms.asReadonly();
  readonly mentors = this.volunteerMentors.asReadonly();

  readonly totalVolunteerHours = computed(() =>
    this.activePrograms().reduce((sum, p) => sum + p.verifiedHoursCount, 0)
  );

  /**
   * Log verified volunteer service hours
   */
  logServiceHours(programId: string, hours: number): void {
    this.activePrograms.update(list =>
      list.map(p => (p.id === programId ? { ...p, verifiedHoursCount: p.verifiedHoursCount + hours } : p))
    );
  }
}
