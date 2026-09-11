import { CategoryType } from '../stores/episodeStore';

export type UrgencyLevel = 1 | 2 | 3 | 4 | 5;

export const CATEGORY_URGENCY_CONTEXTS: Record<string, Record<UrgencyLevel, string>> = {
  'Medical Emergency': {
    1: 'Requesting basic first-aid advice and non-urgent medical guidance at my location.',
    2: 'Experiencing minor injury or persistent pain; need assistance with basic first-aid supplies.',
    3: 'Requiring prompt medical assistance for sudden illness, high fever, or moderate trauma.',
    4: 'Severe medical condition requiring urgent paramedic intervention and immediate transport.',
    5: 'CRITICAL: Unresponsive individual, severe cardiac distress, or heavy trauma. Immediate life support needed.',
  },
  'Security & Assault': {
    1: 'Reporting suspicious individuals or suspicious activity loitering in the immediate vicinity.',
    2: 'Experiencing uncomfortable confrontation or aggressive verbal disturbance nearby.',
    3: 'Facing active intimidation or hostile presence; need community safety intervention.',
    4: 'Imminent danger from aggressive attackers or violent assault in progress; urgent help needed.',
    5: 'CRITICAL: Life-threatening physical assault or armed threat underway. Immediate emergency defense required.',
  },
  'Fire & Explosion': {
    1: 'Smell of burning or minor smoke odor noticed nearby; requesting preventive check.',
    2: 'Contained small trash or appliance fire with visible smoke; need fire extinguisher assist.',
    3: 'Spreading structural or outdoor fire; need local volunteer containment and rapid response.',
    4: 'Rapidly spreading major fire with heavy smoke; occupants actively evacuating the premises.',
    5: 'CRITICAL: Major structure fire, blast, or trapped victims inside burning building. Immediate rescue needed.',
  },
  'Women Safety & Harassment': {
    1: 'Feeling uneasy in an isolated area; requesting remote check-in or companion guidance.',
    2: 'Encountering persistent unwanted following or verbal harassment in public.',
    3: 'Actively being stalked or cornered; urgent physical presence requested for deterrence.',
    4: 'Severe harassment with physical intimidation; seek urgent refuge and immediate intervention.',
    5: 'CRITICAL: Emergency SOS triggered. Violent physical assault or abduction threat in progress.',
  },
  'Accident & Collision': {
    1: 'Minor vehicle fender bender with no injuries; assistance requested with roadside safety.',
    2: 'Low-impact collision with minor bruising; need assistance with vehicle clearing and first aid.',
    3: 'Road collision with moderate injuries and vehicle damage; need responder first aid and traffic safety.',
    4: 'Severe crash with multiple injured persons and heavy vehicular entrapment; urgent dispatch needed.',
    5: 'CRITICAL: Catastrophic multi-vehicle pileup with critical casualties and trapped passengers.',
  },
  'Transport & Evacuation': {
    1: 'Inquiring about available emergency transit routes or scheduled evacuation points.',
    2: 'Unable to find transport in remote area; require non-critical ride assist to safe zone.',
    3: 'Stranded without transit during adverse conditions; need immediate transport assistance.',
    4: 'Urgent evacuation required due to impending regional hazard or rising danger.',
    5: 'CRITICAL: Immediate emergency extraction required from active hazard zone; lives at risk.',
  },
  'Disaster & Flood': {
    1: 'Monitoring rising water levels or weather warning; requesting sandbags and guidance.',
    2: 'Water entering ground floor or storm debris blocking exits; need physical help securing property.',
    3: 'Rapid floodwaters or storm structural damage; requiring rescue assistance to reach dry ground.',
    4: 'Severe flash flood or building collapse imminent; occupants cut off from exit routes.',
    5: 'CRITICAL: Trapped by rapidly surging floodwaters or catastrophic disaster debris. Zero-delay rescue needed.',
  },
  'Domestic Violence & Abuse': {
    1: 'Seeking confidential safety advice and local shelter contact information.',
    2: 'Facing escalating hostile domestic argument; requesting discreet welfare monitoring.',
    3: 'Active domestic dispute with threatening behavior; need immediate safe intervention.',
    4: 'Physical domestic violence in progress; victim needs immediate safe extraction and shelter.',
    5: 'CRITICAL: Severe life-threatening domestic violence or assault in progress. Extreme emergency response required.',
  },
  'Child Emergency & Lost': {
    1: 'Reporting a child separated in a public area; seeking nearby volunteer lookout assistance.',
    2: 'Unattended toddler or wandering child spotted; need assistance locating guardians.',
    3: 'Child missing for over 15 minutes in crowded or unfamiliar area; immediate search grid needed.',
    4: 'Pediatric acute distress or sudden child medical crisis; urgent responder aid required.',
    5: 'CRITICAL: Missing child in hazardous surroundings or critical infant airway/medical emergency.',
  },
  'Senior Citizen Assist': {
    1: 'Senior citizen requesting routine welfare check-in or non-urgent household assist.',
    2: 'Elderly individual experiencing mobility difficulty or mild disorientation.',
    3: 'Senior citizen suffered a fall, unable to get up unassisted; needs urgent physical help.',
    4: 'Elderly resident experiencing acute confusion, pain, or suspected stroke symptoms.',
    5: 'CRITICAL: Senior citizen unconscious or in severe respiratory/cardiovascular collapse.',
  },
  'Mental Health Crisis': {
    1: 'Feeling elevated anxiety and stress; requesting calm peer de-escalation talk.',
    2: 'Experiencing acute panic attack and disorientation; need quiet grounding support.',
    3: 'Severe emotional distress or behavioral breakdown; requiring compassionate in-person presence.',
    4: 'Acute psychological crisis with potential self-harm risk; urgent professional intervention needed.',
    5: 'CRITICAL: Active suicide attempt or severe self-harm in progress. Immediate crisis rescue needed.',
  },
  'Stranded & Breakdown': {
    1: 'Vehicle running low on fuel or flat tire; requesting non-urgent roadside advice.',
    2: 'Mechanical breakdown or dead battery on safe roadside shoulder; need jump-start or tools.',
    3: 'Vehicle disabled in poorly lit or isolated location; need fast roadside assistance.',
    4: 'Stranded in hazardous terrain or inclement weather with no heating and vulnerable passengers.',
    5: 'CRITICAL: Vehicle disabled in active traffic lane or perilous mountain ledge; extreme risk of collision.',
  },
  'Blood & Organ Need': {
    1: 'Inquiring about blood donor registries for an upcoming scheduled surgery.',
    2: 'Seeking replacement blood units for hospitalized patient within the next 24 hours.',
    3: 'Urgent need for specific blood type / platelets for surgery happening today.',
    4: 'Emergency blood donor call for patient experiencing severe hemorrhagic trauma.',
    5: 'CRITICAL: Rare blood type units urgently required immediately to save a patient in operating room.',
  },
  'Oxygen & Med Supply': {
    1: 'Seeking information on local oxygen refilling stations or pharmacy delivery.',
    2: 'Medication running low for chronic condition; need prescription pickup assist.',
    3: 'Oxygen concentrator running low on reserve; need urgent oxygen cylinder delivery.',
    4: 'Critical shortage of lifesaving medication (insulin, inhaler, anti-venom, cardiac drugs).',
    5: 'CRITICAL: Patient completely depleted of supplemental oxygen; asphyxiation risk within minutes.',
  },
  'Cyber Threat & Stalking': {
    1: 'Seeking advice on suspicious digital communications or phishing attempt.',
    2: 'Experiencing targeted online harassment or account takeover attempts.',
    3: 'Active digital stalking with real-time location tracking threats; need security triage.',
    4: 'Severe cyber blackmail and extortion with imminent real-world physical threat.',
    5: 'CRITICAL: Immediate threat of physical violence coupled with real-time digital device compromise.',
  },
  'Animal Rescue & Hazard': {
    1: 'Reporting stray animal wandering in neighborhood; requesting non-urgent shelter lookup.',
    2: 'Injured small animal or bird found; need transport to local veterinary clinic.',
    3: 'Large injured animal trapped in drain or road; need volunteer rescue equipment.',
    4: 'Aggressive or rabid animal threatening pedestrians in public pathway.',
    5: 'CRITICAL: Venomous snake bite or dangerous predator actively attacking persons.',
  },
  'Power Grid & Blackout': {
    1: 'Reporting minor power fluctuation or single-home fuse outage.',
    2: 'Neighborhood block blackout; requesting status check and emergency lighting.',
    3: 'Prolonged power outage affecting medical refrigeration or temperature control.',
    4: 'Downed live power lines sparking near walkway or residence; high electrocution risk.',
    5: 'CRITICAL: Live high-voltage electrical cable in contact with water/vehicle with trapped individuals.',
  },
  'Gas & Chemical Leak': {
    1: 'Faint smell of gas outdoors; requesting preventive air check.',
    2: 'Domestic LPG cylinder hiss or minor valve leak detected; need isolation assist.',
    3: 'Strong chemical odor or indoor gas accumulation; requiring immediate evacuation assistance.',
    4: 'Ruptured commercial gas pipeline or hazardous chemical spill spreading rapidly.',
    5: 'CRITICAL: Massive toxic gas cloud or impending flammable gas explosion. Immediate area evacuation.',
  },
  'Theft & Burglary': {
    1: 'Reporting past theft of unattended property for documentation.',
    2: 'Signs of attempted tampering on doors, windows, or locks.',
    3: 'Trespasser spotted on private premises; requesting urgent community presence.',
    4: 'Active burglary or break-in in progress; intruder currently inside building.',
    5: 'CRITICAL: Armed robbery or violent home invasion in progress with occupants held captive.',
  },
  'Food & Water Crisis': {
    1: 'Inquiring about local community food pantry and drinking water distribution points.',
    2: 'Short-term supply shortage for isolated household; need basic ration assistance.',
    3: 'Vulnerable group without potable water or food for over 24 hours; need relief delivery.',
    4: 'Severe water contamination or acute food starvation in isolated disaster pocket.',
    5: 'CRITICAL: Mass dehydration and starvation crisis affecting infants and frail elders with zero access.',
  },
  'Shelter & Homeless Relief': {
    1: 'Inquiring about temporary night shelter beds and warming centers.',
    2: 'Displaced individual needing warm blankets and basic hygiene supplies.',
    3: 'Families displaced by eviction or minor hazard needing urgent emergency overnight shelter.',
    4: 'Vulnerable individuals exposed to extreme sub-zero cold or heatwave without shelter.',
    5: 'CRITICAL: Life-threatening exposure to blizzard/extreme weather; immediate survival shelter needed.',
  },
  'General Request': {
    1: 'Seeking general community information, directions, or non-urgent neighborhood guidance.',
    2: 'Minor assistance required for non-emergency task or localized community query.',
    3: 'I need immediate assistance and support from nearby volunteers at my current location.',
    4: 'Urgent distress situation requiring prompt in-person community response and aid.',
    5: 'CRITICAL: Extreme emergency situation requiring immediate, coordinated volunteer response.',
  },
};

// Aliases mapping for short category names
const ALIAS_MAP: Record<string, string> = {
  'Medical': 'Medical Emergency',
  'Security': 'Security & Assault',
  'Fire & Hazard': 'Fire & Explosion',
  'Transport': 'Transport & Evacuation',
  'Disaster': 'Disaster & Flood',
  'Women Safety': 'Women Safety & Harassment',
  'Child Care': 'Child Emergency & Lost',
  'Accident': 'Accident & Collision',
  'Animal Rescue': 'Animal Rescue & Hazard',
  'Senior Assist': 'Senior Citizen Assist',
  'Blackout': 'Power Grid & Blackout',
};

/**
 * Returns a tailored context sentence based on category and urgency level (1-5).
 */
export function getCategoryUrgencyContext(category?: CategoryType | string | null, urgency: number = 3): string {
  const normalizedLevel = Math.max(1, Math.min(5, Math.round(urgency))) as UrgencyLevel;
  const targetCategory = (category && ALIAS_MAP[category]) || category || 'General Request';
  const categoryMap = CATEGORY_URGENCY_CONTEXTS[targetCategory] || CATEGORY_URGENCY_CONTEXTS['General Request'];
  return categoryMap[normalizedLevel] || categoryMap[3];
}
