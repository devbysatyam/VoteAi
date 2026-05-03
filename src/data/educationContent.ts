/**
 * Real educational content about Indian democracy.
 */
interface Section { title: string; body: string; facts?: string[]; }
interface ContentBlock { title: string; sections: Section[]; }

export const DEMOCRACY_CONTENT: Record<string, ContentBlock> = {
  structure: {
    title: 'Structure of Indian Democracy',
    sections: [
      {
        title: 'Parliament of India (Sansad)',
        body: 'India has a bicameral Parliament consisting of two houses: the Lok Sabha (Lower House) and the Rajya Sabha (Upper House). Together with the President, they form the Parliament of India. Bills must be passed by both houses to become law.',
      },
      {
        title: 'Lok Sabha (House of the People)',
        body: 'The Lok Sabha has 543 elected members, each representing a constituency. Members are elected directly by the people through universal adult suffrage using the First-Past-The-Post (FPTP) system. The term is 5 years. The leader of the majority party becomes the Prime Minister.',
        facts: ['543 seats (530 states + 13 UTs)', 'Min age to contest: 25 years', 'Term: 5 years (can be dissolved early)', 'Quorum: 1/10th of total members'],
      },
      {
        title: 'Rajya Sabha (Council of States)',
        body: 'The Rajya Sabha has 245 members — 233 elected by state legislative assemblies and 12 nominated by the President for expertise in literature, science, art, and social service. It is a permanent body; 1/3rd of members retire every 2 years.',
        facts: ['245 seats (233 elected + 12 nominated)', 'Min age to contest: 30 years', 'Term: 6 years (1/3 retire every 2 years)', 'Cannot be dissolved'],
      },
    ],
  },
  stateGovt: {
    title: 'State Government',
    sections: [
      {
        title: 'Vidhan Sabha (State Legislative Assembly)',
        body: 'Each state has a Vidhan Sabha (Legislative Assembly) with members called MLAs (Members of Legislative Assembly). MLAs are directly elected by voters in state assembly constituencies. The leader of the majority party becomes the Chief Minister.',
        facts: ['MLAs elected by people directly', 'Term: 5 years', 'Number of seats varies by state', 'UP has most: 403 seats'],
      },
      {
        title: 'Vidhan Parishad (State Legislative Council)',
        body: 'Only 6 states have a Vidhan Parishad (Legislative Council): Bihar, Karnataka, Maharashtra, Telangana, Uttar Pradesh, and Andhra Pradesh. Members are called MLCs. They are elected indirectly — by MLAs, local bodies, teachers, graduates, and some nominated by the Governor.',
        facts: ['Only 6 states have it', 'Members called MLCs', 'Term: 6 years (1/3 retire every 2 years)', 'Cannot be dissolved'],
      },
      {
        title: 'What Your MLA Does',
        body: 'Your MLA represents your assembly constituency in the state legislature. They participate in law-making, raise local issues, sanction development funds (like MLALAD), and serve as a link between citizens and the government.',
      },
      {
        title: 'What Your MP Does',
        body: 'Your Member of Parliament (MP) represents your Lok Sabha constituency in Parliament. They debate national issues, pass laws, approve the budget, question ministers, and have a MPLAD fund (₹5 crore/year) for local development.',
      },
    ],
  },
  elections: {
    title: 'How Elections Work',
    sections: [
      {
        title: 'First-Past-The-Post (FPTP)',
        body: 'India uses the FPTP system: the candidate with the most votes in a constituency wins, even without a majority. For example, if Candidate A gets 35%, B gets 33%, and C gets 32%, A wins despite 65% voting against them.',
      },
      {
        title: 'Election Commission of India (ECI)',
        body: 'The ECI is an autonomous constitutional body (Article 324) that conducts all elections. It consists of the Chief Election Commissioner and 2 Election Commissioners. It maintains voter rolls, enforces the Model Code of Conduct, and certifies results.',
        facts: ['Established: 25 Jan 1950', 'HQ: Nirvachan Sadan, New Delhi', 'Helpline: 1950', 'Website: eci.gov.in'],
      },
      {
        title: 'Model Code of Conduct (MCC)',
        body: 'The MCC is a set of guidelines for political parties and candidates during elections. It comes into effect from the date elections are announced. Key rules: no government ads, no new schemes, no hate speech, no bribery, campaign silence 48 hours before voting.',
      },
      {
        title: 'EVM & VVPAT',
        body: 'Electronic Voting Machines (EVMs) have been used nationwide since 2004. Each EVM has a Ballot Unit and Control Unit. Since 2019, all EVMs are paired with a VVPAT (Voter Verifiable Paper Audit Trail) that prints a paper slip showing your vote for 7 seconds.',
        facts: ['First used: 1982 (Kerala)', 'Nationwide: 2004', 'VVPAT mandatory: 2019', 'Battery-operated (no internet)'],
      },
    ],
  },
  voterRights: {
    title: 'Your Democratic Rights',
    sections: [
      {
        title: 'Right to Vote (Article 326)',
        body: 'Every Indian citizen aged 18 and above has the right to vote. This right was originally 21 years, reduced to 18 by the 61st Amendment Act, 1988.',
      },
      {
        title: 'Right to Information (RTI)',
        body: 'Under the Right to Information Act 2005, you can access information about government functioning, candidate backgrounds, and election spending. Candidates must declare criminal records, assets, and education.',
      },
      {
        title: 'Anti-Defection Law',
        body: 'The 52nd Amendment (1985) added the Tenth Schedule to prevent elected representatives from switching parties after elections. If an MP/MLA defects, they lose their seat.',
      },
    ],
  },
};

/** Real candidate data for the dummy constituency */
export const REAL_CANDIDATES = [
  {
    id: 1, name: 'Rajesh Kumar Singh', party: 'Bharatiya Janata Party', symbol: '🪷', color: '#FF9933',
    education: 'B.Com (Hons), LLB — BHU', age: 52,
    assets: '₹2.4 Cr', liabilities: '₹35 L', cases: 0,
    experience: '2-term MLA, Former District President',
    manifesto: ['Road infrastructure', 'Digital India expansion', 'Skill development centres', 'Smart city project'],
    promises: { kept: 8, total: 12 },
  },
  {
    id: 2, name: 'Dr. Priya Singh', party: 'Indian National Congress', symbol: '🖐️', color: '#19AAED',
    education: 'MA Political Science, PhD — JNU', age: 45,
    assets: '₹1.1 Cr', liabilities: '₹12 L', cases: 0,
    experience: 'Former Professor, Social Activist',
    manifesto: ['MNREGA expansion', 'Women safety cells', 'Public health centres', 'Farm loan waiver'],
    promises: { kept: 6, total: 10 },
  },
  {
    id: 3, name: 'Amit Patel', party: 'Aam Aadmi Party', symbol: '🧹', color: '#0066B3',
    education: 'MBA — IIM Ahmedabad', age: 38,
    assets: '₹85 L', liabilities: '₹5 L', cases: 0,
    experience: 'Tech Entrepreneur, First-time candidate',
    manifesto: ['Free electricity up to 200 units', 'Mohalla clinics', 'Government school reform', 'Anti-corruption helpline'],
    promises: { kept: 4, total: 5 },
  },
  {
    id: 4, name: 'Sunita Devi', party: 'Bahujan Samaj Party', symbol: '🐘', color: '#22409A',
    education: 'BA, B.Ed — Lucknow University', age: 50,
    assets: '₹55 L', liabilities: '₹8 L', cases: 1,
    experience: 'Former Gram Pradhan, Social Worker',
    manifesto: ['Dalit welfare schemes', 'SC/ST scholarship expansion', 'Rural housing', 'Water supply'],
    promises: { kept: 5, total: 8 },
  },
  {
    id: 5, name: 'Dr. Mohammed Irfan Khan', party: 'Independent', symbol: '⭐', color: '#666',
    education: 'MBBS, MD (Medicine) — AIIMS', age: 48,
    assets: '₹3.2 Cr', liabilities: '₹45 L', cases: 0,
    experience: 'Senior Doctor, Hospital Director',
    manifesto: ['District hospital upgrade', 'Ambulance network', 'Medical college', 'Telemedicine'],
    promises: { kept: 0, total: 0 },
  },
  {
    id: 6, name: 'Vikram Yadav', party: 'Samajwadi Party', symbol: '🚲', color: '#FF0000',
    education: 'B.Tech — IIT Kanpur', age: 42,
    assets: '₹1.8 Cr', liabilities: '₹22 L', cases: 2,
    experience: '1-term MLA, Youth Wing President',
    manifesto: ['Unemployment allowance', 'Free laptops', 'Expressway connectivity', 'Sports complex'],
    promises: { kept: 3, total: 7 },
  },
];
