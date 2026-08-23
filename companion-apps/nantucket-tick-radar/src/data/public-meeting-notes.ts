export interface IPublicMeetingNote {
  id: string;
  title: string;
  governingBody: 'Nantucket Board of Health' | 'Nantucket Select Board' | 'Nantucket Land Bank Commission' | 'Nantucket Atheneum Science Forum' | 'Nantucket Public Schools Committee' | 'Saltmarsh Senior Center Advisory';
  date: string;
  location: string;
  chairpersonOrSpeaker: string;
  topicsCovered: string[];
  keyDecisionsAndVotes: string[];
  publicCommentsSummary: string[];
  actionItemsForResidents: string[];
  grandparentAndFamilyTakeaway: string;
  librarianDiscussionGuide: string;
  officialReferenceDoc: string;
}

export const NANTUCKET_PUBLIC_MEETING_NOTES: IPublicMeetingNote[] = [
  {
    id: 'boh-2026-tick-subsidy',
    title: 'Board of Health Hearing: Free Island-Wide PCR Tick Pathogen Testing & Surveillance Program',
    governingBody: 'Nantucket Board of Health',
    date: 'July 14, 2026',
    location: 'Nantucket Town Hall (16 Broad St) & Zoom Public Hearing',
    chairpersonOrSpeaker: 'Dr. Malcolm MacNab, MD, PhD (Board Chair) & Public Health Director',
    topicsCovered: [
      'Municipal subsidy for resident tick testing via UMass Laboratory of Medical Zoology',
      'Surveillance data: 42% Borrelia burgdorferi infection rate in collected blacklegged nymphs',
      'Emergence of Borrelia miyamotoi (relapsing fever) in Polpis and Squam areas',
      'Free specimen mailer kit distribution at Nantucket Atheneum and Dan\'s Pharmacy'
    ],
    keyDecisionsAndVotes: [
      'Unanimous Vote (5-0): Reallocated $45,000 in municipal wellness funds to fully subsidize DNA pathogen testing for all full-time and seasonal residents.',
      'Approved placement of specimen collection drop-boxes at Town Hall (16 Broad St), Health Dept (131 Pleasant St), and the Nantucket Atheneum.'
    ],
    publicCommentsSummary: [
      'Mary Gardner (Madaket resident & grandmother): Urged board to make testing turnaround faster so families know whether antibiotic prophylaxis was effective before 72 hours.',
      'Thomas Starbuck (Landscape contractor): Requested subsidized permethrin treatment workshops for outdoor workers and landscaping crews.'
    ],
    actionItemsForResidents: [
      'Do not throw away removed ticks — place in a sealed Ziploc bag with a slightly damp paper towel.',
      'Drop off at 131 Pleasant St or the Nantucket Atheneum front desk for free 48-hour PCR report.'
    ],
    grandparentAndFamilyTakeaway: 'The town now pays 100% of the cost to test any tick found on you or your grandchildren. Save the tick in a baggie and drop it off at the library or health department!',
    librarianDiscussionGuide: 'Ask patrons: Did you know our library has free tick mailer kits? We can help you look up your test results online once the lab processes the sample.',
    officialReferenceDoc: 'Town of Nantucket BOH Minutes #2026-07-14-TICK'
  },
  {
    id: 'select-board-path-mowing',
    title: 'Select Board Public Meeting: Mandatory 6-Foot Trail Buffer Mowing on High-Traffic Conservation Paths',
    governingBody: 'Nantucket Select Board',
    date: 'June 2, 2026',
    location: 'Public Safety Facility Community Room (4 Fairgrounds Rd)',
    chairpersonOrSpeaker: 'Dawn Hill Holdgate (Select Board Chair) & DPW Superintendent',
    topicsCovered: [
      'Coordination between Town DPW, Nantucket Conservation Foundation, and Land Bank',
      'Mandatory mechanical mowing of grass buffers along Sanford Farm, Milestone Bike Path, and Polpis Road corridors',
      'Tick desiccation enhancement: Keeping grass below 3 inches allows solar UV rays to dry out questing nymphs'
    ],
    keyDecisionsAndVotes: [
      'Passed (4-1): DPW authorized to execute bi-weekly 6-foot clearance mowing along all public right-of-way walking corridors starting May 1 through October 31.',
      'Established annual "Clean Paths for Kids & Elders" initiative in partnership with island scouts.'
    ],
    publicCommentsSummary: [
      'Eleanor Coffin (Quidnet elder): Shared that walking along Milestone Road used to brush high scrub oak against pant legs; praised recent wide mowing.',
      'Conservation Biologist Dr. Peter Boyce: Confirmed that wide mowed paths create an effective 1.8-meter solar desiccation barrier that reduces tick bites by >80%.'
    ],
    actionItemsForResidents: [
      'Always walk in the center of mowed corridors; avoid stepping into the tall brush edge.',
      'Report overgrown town path sections directly to the DPW via the Town Citizen Portal.'
    ],
    grandparentAndFamilyTakeaway: 'Town mowing crews are keeping trail edges wide and short so sunlight can dry out ticks. Staying in the middle of the mowed grass keeps you safe!',
    librarianDiscussionGuide: 'Great topic for local ecology discussions: How solar heat and path mowing act as natural, chemical-free tick control for island families.',
    officialReferenceDoc: 'Nantucket Select Board Regular Session #2026-06-02'
  },
  {
    id: 'atheneum-science-forum',
    title: 'Atheneum Public Science Forum: "Mice Against Ticks" Ecological Genetics Update & Community Q&A',
    governingBody: 'Nantucket Atheneum Science Forum',
    date: 'May 18, 2026',
    location: 'Great Hall, Nantucket Atheneum (1 India Street)',
    chairpersonOrSpeaker: 'Dr. Kevin Esvelt (MIT Sculpting Evolution Lab) & Ann Scott (Atheneum Director)',
    topicsCovered: [
      'Progress on genetically immunizing white-footed mice (*Peromyscus leucopus*) against Borrelia burgdorferi and tick saliva proteins',
      'Community governance: Island-wide consent model and open-access data sharing',
      'Ecological safety assessments: Ensuring zero unintended effects on island owls, hawks, and garter snakes',
      'Comparison between chemical spraying vs. biological host immunity'
    ],
    keyDecisionsAndVotes: [
      'Community Consensus: 88% of attending residents expressed support for advancing to contained island trial stage on a non-inhabited outer spit.',
      'Atheneum agreed to host permanent monthly "Community Science Tables" with interactive microscopes and specimen slides.'
    ],
    publicCommentsSummary: [
      'Ruth Folger (Long-time island educator): Commended the team for explaining CRISPR and mouse antibody genetics at a 6th-grade reading level for local students.',
      'Capt. Jack Swain (Commercial fisherman): Inquired about whether deer herd reduction would still be necessary if mice are immunized.'
    ],
    actionItemsForResidents: [
      'Visit the Atheneum Great Hall to review physical project binders and scientific whitepapers.',
      'Submit written community feedback questions to the Town Clerk before the upcoming Fall Special Town Meeting.'
    ],
    grandparentAndFamilyTakeaway: 'Scientists from MIT came to our library to explain how helping island mice become immune to tick bites could protect our island grandchildren for generations.',
    librarianDiscussionGuide: 'Highlight our library collection on genetics, Lyme disease history, and public community decision-making. Guide patrons through the project binders.',
    officialReferenceDoc: 'Nantucket Atheneum Community Science Archives #MAT-2026-05'
  },
  {
    id: 'saltmarsh-elder-wellness',
    title: 'Senior Health Advisory: Recognizing Atypical Tick-Borne Symptoms in Adults Age 65+',
    governingBody: 'Saltmarsh Senior Center Advisory',
    date: 'August 4, 2026',
    location: 'Saltmarsh Senior Center (81 Washington St)',
    chairpersonOrSpeaker: 'Dr. Timothy Lepore, MD (NCH Consulting Physician) & Senior Services Coordinator',
    topicsCovered: [
      'Why older adults frequently do NOT develop a classic bullseye rash (only 40-50% in seniors)',
      'Atypical early signs: sudden fatigue, mild confusion, joint stiffness, or unexplained low-grade fever',
      'Co-infection risks: Babesiosis causing hemolytic anemia and fatigue in patients without a spleen or with cardiac history',
      'Immediate walk-in protocol at Nantucket Cottage Hospital'
    ],
    keyDecisionsAndVotes: [
      'Distributed 120 free long-handled magnifying mirrors and illuminated fine-point tick tweezers to attending seniors.',
      'Instituted weekly "Buddy Tick Checks" after Saltmarsh Senior Walking Club excursions at Sanford Farm.'
    ],
    publicCommentsSummary: [
      'Grace Hussey (Age 78): Shared her experience with Babesiosis that initially felt like a summer flu; emphasized how quick hospital blood work saved her.',
      'Arthur Ray (Age 82): Asked how to safely apply repellents when having sensitive skin (recommended Picaridin 20% lotion over DEET sprays).'
    ],
    actionItemsForResidents: [
      'If you feel sudden fatigue or aches after being outside, do not wait for a rash — visit NCH Walk-in immediately.',
      'Grandparents caring for visiting children: Perform nightly scalp and behind-ear tick checks during storytime.'
    ],
    grandparentAndFamilyTakeaway: 'In grandparents, tick illness often feels like sudden tiredness or joint aches without any rash. If you feel unwell after being in the yard, see the doctor right away!',
    librarianDiscussionGuide: 'Recommend health literacy books on functional wellness, senior self-advocacy, and preventative outdoor safety.',
    officialReferenceDoc: 'Saltmarsh Senior Center Health Series #2026-08-04'
  },
  {
    id: 'school-committee-outdoor-safety',
    title: 'Nantucket Public Schools Committee: Island Outdoor Classroom & Recess Tick Protocol Policy',
    governingBody: 'Nantucket Public Schools Committee',
    date: 'April 21, 2026',
    location: 'Nantucket High School LGI Room (10 Surfside Rd)',
    chairpersonOrSpeaker: 'School Superintendent & Island Youth Health Coalition',
    topicsCovered: [
      'Permethrin treatment options for school cross-country and field sports team uniforms',
      'Daily morning playground perimeter inspections and leaf-litter clearing by school groundskeepers',
      'School nurse tick extraction protocols: Immediate parent notification, specimen preservation in vials, and dwell time logging',
      '5th and 6th-grade curriculum integration: "Island Tick Detectives" Citizen Science project'
    ],
    keyDecisionsAndVotes: [
      'Passed (5-0): Adopted mandatory "Tuck-in Tuesday" and outdoor sports sock-tuck checks before cross-country trail runs in the State Forest.',
      'Authorized integration of the Zooniverse "Island Tick Detectives" classification module into 6th-grade life science classes.'
    ],
    publicCommentsSummary: [
      'Sarah Mitchell (PTA President & mother of three): Praised the school nurses for keeping careful tick extraction logs with digital microscope photos sent directly to parents.',
      'Coach David Coffin: Confirmed all student cross-country uniforms will be treated with factory-bonded permethrin.'
    ],
    actionItemsForResidents: [
      'Send children to school with light-colored socks and sneakers for outdoor nature walks.',
      'Check children\'s hair, waistbands, and behind their knees every afternoon when they return from school.'
    ],
    grandparentAndFamilyTakeaway: 'Our island schools have trained nurses and teachers checking playgrounds and teaching kids how to tuck their socks. Kids are even learning to identify ticks in science class!',
    librarianDiscussionGuide: 'Connect with 6th-grade science students working on the Island Tick Detectives project. Provide access to library microscopes and field ID guides.',
    officialReferenceDoc: 'NPS School Committee Policy #2026-04-21-OUTDOOR'
  }
];
