export interface IIslandCivicEvent {
  id: string;
  title: string;
  organizer: 'Nantucket Atheneum' | 'Town of Nantucket Board of Health' | 'Maria Mitchell Association' | 'Saltmarsh Senior Center' | 'Nantucket Conservation Foundation' | 'Nantucket Public Schools';
  date: string;
  time: string;
  location: string;
  category: 'Library Workshop' | 'Public Hearing' | 'Family Nature Walk' | 'Senior Wellness' | 'Citizen Science';
  description: string;
  familyAndGrandparentBenefit: string;
  librarianTip: string;
  isFreeEvent: boolean;
  rsvpOrContact: string;
}

export const UPCOMING_ISLAND_CIVIC_EVENTS: IIslandCivicEvent[] = [
  {
    id: 'event-atheneum-microscope-lab',
    title: 'Family Tick ID & Digital Microscope Workshop',
    organizer: 'Nantucket Atheneum',
    date: 'Saturday, September 5, 2026',
    time: '10:00 AM – 12:00 PM',
    location: 'Nantucket Atheneum Great Hall (1 India St)',
    category: 'Library Workshop',
    description: 'Hands-on interactive science session for kids, parents, and grandparents. Learn how to tell a harmless dog tick from a blacklegged nymph using the library’s high-power digital inspection scopes. Free tick identification field cards and magnifier bookmarks provided.',
    familyAndGrandparentBenefit: 'Perfect for grandparents bringing visiting children. Learn how to spot poppy-seed sized nymphs before they attach.',
    librarianTip: 'Pair with our juvenile science collection on New England insects and public health biology.',
    isFreeEvent: true,
    rsvpOrContact: 'No RSVP required. Drop in at the Atheneum Children\'s Desk or call (508) 228-1110.'
  },
  {
    id: 'event-boh-annual-hearing',
    title: 'Nantucket Board of Health: Annual Tick-Borne Disease Review & Surveillance Hearing',
    organizer: 'Town of Nantucket Board of Health',
    date: 'Thursday, September 17, 2026',
    time: '4:00 PM – 6:00 PM',
    location: 'Nantucket Town Hall (16 Broad St) & Hybrid Zoom',
    category: 'Public Hearing',
    description: 'Annual public presentation of summer tick infection rates across island sectors (Sanford Farm, Squam Swamp, Polpis, Madaket). Public comment period on town subsidies for resident DNA tick testing and fall deer management articles.',
    familyAndGrandparentBenefit: 'Voice your questions directly to town doctors and public health officials about community protection and neighborhood trail safety.',
    librarianTip: 'We display physical printed copies of the annual BOH Surveillance Report in the library lobby before this meeting.',
    isFreeEvent: true,
    rsvpOrContact: 'Town Health Dept: health@nantucket-ma.gov | (508) 228-7200'
  },
  {
    id: 'event-mma-family-nature-walk',
    title: 'Safe Moors Exploration: Guided Family Ecology Walk',
    organizer: 'Maria Mitchell Association',
    date: 'Wednesday, September 23, 2026',
    time: '9:30 AM – 11:30 AM',
    location: 'Sanford Farm Trailhead (Madaket Road)',
    category: 'Family Nature Walk',
    description: 'Join Maria Mitchell field naturalists for a guided walk explaining the "Two-Zone Armor" system, wide mowed path safety, and live demonstration of how open sunshine creates a solar desiccation barrier that keeps center paths safe for walking.',
    familyAndGrandparentBenefit: 'Gentle, flat walking pace suitable for all ages with frequent rest stops and kid-friendly botanical games.',
    librarianTip: 'Check out an MMA Family Nature Backpack at the Atheneum reference desk before heading out.',
    isFreeEvent: true,
    rsvpOrContact: 'Maria Mitchell Association: info@mariamitchell.org | (508) 228-9198'
  },
  {
    id: 'event-saltmarsh-grandparent-tea',
    title: 'Grandparent Health Tea: Tick Bite Recognition & Free Extraction Kits',
    organizer: 'Saltmarsh Senior Center',
    date: 'Tuesday, October 6, 2026',
    time: '2:00 PM – 3:30 PM',
    location: 'Saltmarsh Senior Center (81 Washington St)',
    category: 'Senior Wellness',
    description: 'Relaxed afternoon tea and health discussion with visiting clinical nurses from Nantucket Cottage Hospital. Demonstrations on safe perpendicular tweezer extraction, nighttime grandchild check routines, and recognizing subtle symptoms like joint aches or fatigue.',
    familyAndGrandparentBenefit: 'Complimentary high-precision tick tweezers, magnifying lenses, and specimen collection baggies given to every attendee.',
    librarianTip: 'The library brings large-print health reference guides and audiobooks on local history to this gathering.',
    isFreeEvent: true,
    rsvpOrContact: 'Saltmarsh Senior Center: (508) 228-4490 | Free transportation available via NRTA'
  },
  {
    id: 'event-ncf-trail-stewardship',
    title: 'Nantucket Conservation Foundation: Trail Clearing & Buffer Maintenance Day',
    organizer: 'Nantucket Conservation Foundation',
    date: 'Saturday, October 17, 2026',
    time: '9:00 AM – 1:00 PM',
    location: 'Middle Moors Trailhead / Altar Rock Access',
    category: 'Citizen Science',
    description: 'Community volunteer stewardship morning. Help NCF rangers widen brush buffers along popular walking routes and observe how tick drag-cloth sampling is conducted across heathland and scrub oak zones.',
    familyAndGrandparentBenefit: 'Great civic service opportunity for high school students and families passionate about preserving Nantucket open space.',
    librarianTip: 'Explore historical maps of the Middle Moors and sheep-grazing commons in the Atheneum archives.',
    isFreeEvent: true,
    rsvpOrContact: 'NCF Field Office: info@nantucketconservation.org | (508) 228-2884'
  },
  {
    id: 'event-school-tick-detective-expo',
    title: '6th-Grade "Island Tick Detectives" Science Exhibition',
    organizer: 'Nantucket Public Schools',
    date: 'Friday, November 13, 2026',
    time: '5:30 PM – 7:30 PM',
    location: 'Nantucket High School Cafeteria & Gym (10 Surfside Rd)',
    category: 'Citizen Science',
    description: 'Public exhibition of 6th-grade student science posters, Zooniverse wildlife classifications, botanical habitat maps, and Junior Ranger field discovery journals.',
    familyAndGrandparentBenefit: 'Celebrate island children’s research achievements and see how local youth are participating in safe, COPPA-compliant nature discovery.',
    librarianTip: 'Student posters will be displayed in the Atheneum Weezie Library for Children throughout November.',
    isFreeEvent: true,
    rsvpOrContact: 'Nantucket Public Schools: (508) 228-7285'
  }
];
