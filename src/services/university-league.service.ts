import { Injectable, signal, computed } from '@angular/core';

export interface ISnomedLocationConcept {
  snomedCode: string; // e.g. "224670002" (University / Academic Institution)
  displayName: string;
  category: 'UNIVERSITY' | 'COMMUNITY_COLLEGE' | 'HIGH_SCHOOL' | 'VOCATIONAL_ACADEMY' | 'MEDICAL_CENTER' | 'COMMUNITY_HEALTH_HUB';
  latitude?: number;
  longitude?: number;
  cityState: string;
}

export interface IUniversityCohortScore {
  schoolId: string;
  schoolName: string;
  mascotEmoji: string;
  snomedCode: string;
  cityState: string;
  averageCoherenceScore: number; // 0 - 100
  activeStudentCount: number;
  completedQuestsCount: number;
  philanthropicContributionUsd: number;
  rank: number;
}

export interface IInterSchoolQuest {
  id: string;
  title: string;
  participatingSchools: string[];
  description: string;
  totalXpPool: number;
  status: 'ACTIVE' | 'COMPLETED' | 'UPCOMING';
  emojiBadge: string;
}

@Injectable({
  providedIn: 'root'
})
export class UniversityLeagueService {
  // Current active user selected school affiliation
  readonly selectedSchoolId = signal<string>('stanford');

  private leaderboard = signal<IUniversityCohortScore[]>([
    {
      schoolId: 'stanford',
      schoolName: 'Stanford University (HCI & Bio-X)',
      mascotEmoji: '🌲',
      snomedCode: '224670002-STANFORD',
      cityState: 'Stanford, CA',
      averageCoherenceScore: 88.4,
      activeStudentCount: 420,
      completedQuestsCount: 1250,
      philanthropicContributionUsd: 15400,
      rank: 1
    },
    {
      schoolId: 'mit',
      schoolName: 'MIT (Media Lab & Computational Somatics)',
      mascotEmoji: '⚙️',
      snomedCode: '224670002-MIT',
      cityState: 'Cambridge, MA',
      averageCoherenceScore: 87.9,
      activeStudentCount: 380,
      completedQuestsCount: 1180,
      philanthropicContributionUsd: 14200,
      rank: 2
    },
    {
      schoolId: 'harvard',
      schoolName: 'Harvard Medical & Wyss Institute',
      mascotEmoji: '🎓',
      snomedCode: '224670002-HARVARD',
      cityState: 'Boston, MA',
      averageCoherenceScore: 86.5,
      activeStudentCount: 410,
      completedQuestsCount: 1110,
      philanthropicContributionUsd: 13800,
      rank: 3
    },
    {
      schoolId: 'oxford',
      schoolName: 'University of Oxford (Big Data Institute)',
      mascotEmoji: '🏰',
      snomedCode: '224670002-OXFORD',
      cityState: 'Oxford, UK',
      averageCoherenceScore: 85.8,
      activeStudentCount: 310,
      completedQuestsCount: 940,
      philanthropicContributionUsd: 11500,
      rank: 4
    },
    {
      schoolId: 'berkeley',
      schoolName: 'UC Berkeley (Center for Human-Compatible AI)',
      mascotEmoji: '🐻',
      snomedCode: '224670002-BERKELEY',
      cityState: 'Berkeley, CA',
      averageCoherenceScore: 85.2,
      activeStudentCount: 350,
      completedQuestsCount: 890,
      philanthropicContributionUsd: 10800,
      rank: 5
    },
    {
      schoolId: 'foothill',
      schoolName: 'Foothill College (Paramedic & Allied Health)',
      mascotEmoji: '🏔️',
      snomedCode: '224670002-FOOTHILL',
      cityState: 'Los Altos Hills, CA',
      averageCoherenceScore: 88.1,
      activeStudentCount: 290,
      completedQuestsCount: 840,
      philanthropicContributionUsd: 9400,
      rank: 6
    },
    {
      schoolId: 'deanza',
      schoolName: 'De Anza College (Biological & Health Sciences)',
      mascotEmoji: '🚴',
      snomedCode: '224670002-DEANZA',
      cityState: 'Cupertino, CA',
      averageCoherenceScore: 87.4,
      activeStudentCount: 310,
      completedQuestsCount: 810,
      philanthropicContributionUsd: 8900,
      rank: 7
    },
    {
      schoolId: 'miamidade',
      schoolName: 'Miami Dade College (Leon School of Nursing)',
      mascotEmoji: '🌴',
      snomedCode: '224670002-MDC',
      cityState: 'Miami, FL',
      averageCoherenceScore: 86.9,
      activeStudentCount: 450,
      completedQuestsCount: 920,
      philanthropicContributionUsd: 11200,
      rank: 8
    },
    {
      schoolId: 'smc',
      schoolName: 'Santa Monica College (Respiratory & Health Care)',
      mascotEmoji: '🏖️',
      snomedCode: '224670002-SMC',
      cityState: 'Santa Monica, CA',
      averageCoherenceScore: 86.2,
      activeStudentCount: 270,
      completedQuestsCount: 760,
      philanthropicContributionUsd: 8100,
      rank: 9
    },
    {
      schoolId: 'lowell_hs',
      schoolName: 'Lowell High School (Biomedical & HOSA Chapter)',
      mascotEmoji: '🔬',
      snomedCode: '224670002-LOWELL',
      cityState: 'San Francisco, CA',
      averageCoherenceScore: 89.2,
      activeStudentCount: 310,
      completedQuestsCount: 950,
      philanthropicContributionUsd: 10400,
      rank: 10
    },
    {
      schoolId: 'stuyvesant_hs',
      schoolName: 'Stuyvesant High School (Regeneron STS & Bio-Tech)',
      mascotEmoji: '🧪',
      snomedCode: '224670002-STUY',
      cityState: 'New York, NY',
      averageCoherenceScore: 88.8,
      activeStudentCount: 340,
      completedQuestsCount: 980,
      philanthropicContributionUsd: 11100,
      rank: 11
    },
    {
      schoolId: 'tjhsst',
      schoolName: 'Thomas Jefferson High (Neuroscience & Bio Lab)',
      mascotEmoji: '🧬',
      snomedCode: '224670002-TJHSST',
      cityState: 'Alexandria, VA',
      averageCoherenceScore: 88.5,
      activeStudentCount: 320,
      completedQuestsCount: 930,
      philanthropicContributionUsd: 10200,
      rank: 12
    }
  ]);

  private activeQuests = signal<IInterSchoolQuest[]>([
    {
      id: 'quest-001',
      title: 'Trans-Atlantic Solfeggio 528Hz Coherence Challenge',
      participatingSchools: ['Stanford University', 'University of Oxford'],
      description: 'Joint research quest entraining circadian sleep hygiene and binaural HRV recovery across timezones.',
      totalXpPool: 5000,
      status: 'ACTIVE',
      emojiBadge: '🌊🏰🌲'
    },
    {
      id: 'quest-002',
      title: 'Inter-Collegiate SIBI Inflammatory Reduction Hackathon',
      participatingSchools: ['MIT', 'Harvard Medical', 'Foothill College', 'De Anza College'],
      description: 'Collaborative trial evaluating 14-day anti-inflammatory nutrition and daily 10-min AVS grounding.',
      totalXpPool: 7500,
      status: 'ACTIVE',
      emojiBadge: '⚡⚙️🎓🏔️'
    },
    {
      id: 'quest-003',
      title: 'Global Allied Health & Community College Peer Mentorship Swarm',
      participatingSchools: ['Miami Dade College', 'Santa Monica College', 'BMCC', 'Austin Community College'],
      description: 'Open access peer mentorship network connecting nursing and pre-med students worldwide with clinical AI tools.',
      totalXpPool: 10000,
      status: 'ACTIVE',
      emojiBadge: '🌍🌴🏖️🗽🤠'
    },
    {
      id: 'quest-004',
      title: 'Global High School STEM & Youth Health Literacy Challenge',
      participatingSchools: ['Lowell High School', 'Stuyvesant High School', 'TJHSST', 'IMSA', 'Bronx Science'],
      description: 'Secondary student research quest entraining Cochrane evidence literacy, biophysical HRV biofeedback, and Socratic health inquiry.',
      totalXpPool: 12500,
      status: 'ACTIVE',
      emojiBadge: '🔬🧪🧬🪐'
    }
  ]);

  readonly scores = this.leaderboard.asReadonly();
  readonly interSchoolQuests = this.activeQuests.asReadonly();

  readonly currentAffiliation = computed(() => {
    const currentId = this.selectedSchoolId();
    return this.leaderboard().find(s => s.schoolId === currentId) || this.leaderboard()[0];
  });

  readonly totalActiveStudents = computed(() =>
    this.leaderboard().reduce((sum, item) => sum + item.activeStudentCount, 0)
  );

  readonly totalPhilanthropicUsd = computed(() =>
    this.leaderboard().reduce((sum, item) => sum + item.philanthropicContributionUsd, 0)
  );

  /**
   * Switch or transfer student school affiliation dynamically
   */
  selectSchool(schoolId: string): void {
    if (this.leaderboard().some(s => s.schoolId === schoolId)) {
      this.selectedSchoolId.set(schoolId);
    }
  }

  /**
   * SNOMED CT Location Suggestion Engine (Maps SNOMED 224670002 / 414003007 concepts)
   */
  suggestLocationsBySnomed(query: string): ISnomedLocationConcept[] {
    const q = query.toLowerCase().trim();
    const suggestions: ISnomedLocationConcept[] = [
      {
        snomedCode: '224670002-STANFORD',
        displayName: 'Stanford University School of Medicine',
        category: 'UNIVERSITY',
        cityState: 'Stanford, CA'
      },
      {
        snomedCode: '224670002-MIT',
        displayName: 'MIT McGovern Institute & Media Lab',
        category: 'UNIVERSITY',
        cityState: 'Cambridge, MA'
      },
      {
        snomedCode: '224670002-HARVARD',
        displayName: 'Harvard Medical School & Wyss Institute',
        category: 'UNIVERSITY',
        cityState: 'Boston, MA'
      },
      {
        snomedCode: '224670002-OXFORD',
        displayName: 'Oxford University Big Data Institute',
        category: 'UNIVERSITY',
        cityState: 'Oxford, UK'
      },
      {
        snomedCode: '224670002-BERKELEY',
        displayName: 'UC Berkeley Bioengineering & CHAI',
        category: 'UNIVERSITY',
        cityState: 'Berkeley, CA'
      }
    ];

    if (!q) return suggestions;
    return suggestions.filter(s =>
      s.displayName.toLowerCase().includes(q) ||
      s.cityState.toLowerCase().includes(q) ||
      s.snomedCode.toLowerCase().includes(q)
    );
  }
}
