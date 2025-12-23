// Seeds default content into Redis using REDIS_URL. Safe to run multiple times.
// Usage: npm run seed
const { createClient } = require('redis');

async function main() {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error('REDIS_URL is required');
  }
  const client = createClient({ url });
  client.on('error', (err) => console.error('Redis error', err));
  await client.connect();

  const content = {
    hero: {
      title: 'Hack The Throne',
      tagline: 'Build together at AIT CSE. Open only to 2ⁿᵈ Year CSE students.',
      badges: ['AIT CSE campus', 'On-campus', '2ⁿᵈ Year CSE only', 'Mentors on-call'],
    },
    details: [
      { title: 'Venue', body: 'AIT CSE Campus' },
      { title: 'Eligibility', body: '2ⁿᵈ Year CSE students only' },
      { title: 'Tracks', body: 'Mobility · Civic tools\nResilience · Open data' },
      { title: 'Support', body: 'Wi-Fi, charging, mentors on-call, quiet room' },
      { title: 'Team rules', body: 'Teams of 4–6\nFresh work only' },
      { title: 'Judging', body: 'Impact · Feasibility · Craft · Live demo clarity' },
    ],
    schedule: [],
    team: [
      { name: 'Ayush Kaushik', role: 'Lead Organizer' },
      { name: 'Ethan Dsouza', role: 'Tech Lead (Co-Organizer)' },
      { name: 'Ayush Mallick', role: 'Logistics & Marketing Lead' },
      { name: 'Dhanush V P', role: 'Tech & Organizing Coordinator' },
      { name: 'Abhay Emmanuel', role: 'Tech & Organizing Coordinator' },
    ],
    faqs: [
      { q: "What's a hackathon?", a: 'A fast-paced event where teams build and demo solutions in a short time (often 24–48 hours).' },
      { q: 'What do we do there?', a: 'Form teams, pick a problem, design, code, ship a demo, and present to judges.' },
      { q: 'Types of hackathons?', a: 'Thematic (health, civic), open innovation, AI/ML, hardware, and product design sprints.' },
      { q: 'Prerequisite skills?', a: 'Basics help: coding or no-code, Git, slides/storytelling, and collaboration. Mixed skills win.' },
      { q: 'Use of AI?', a: 'AI accelerates ideation, coding, testing, and content; cite sources and keep outputs transparent.' },
      { q: 'Phases of a hackathon?', a: 'Ideation → build → push to Git/GitHub → polish demo → present with a clear deck.' },
      { q: 'How to achieve good projects?', a: 'Scope tightly, pick one painful user problem, ship a working core, and demo clearly.' },
      { q: 'How to win?', a: 'Solve a real pain, show working product, clear story, impact, and next steps. Rehearse your demo.' },
      { q: "Is it just coding?", a: 'No. Product thinking, design, storytelling, and teamwork matter as much as code.' },
      { q: 'Benefits of participating?', a: 'Portfolio-worthy builds, networking, prizes, recruiter visibility, and learning under pressure.' },
    ],
    stats: [
      { title: 'Eligibility', value: '2ⁿᵈ Year CSE', caption: 'AIT Department of CSE' },
      { title: 'Mode', value: 'On-campus', caption: 'AIT CSE Campus' },
      { title: 'Support', value: 'Mentors', caption: 'Product · AI/ML · DevOps' },
    ],
    registerNote: 'Open only to 2ⁿᵈ Year CSE students. Confirm your details for review.',
  };

  await client.set('content:current', JSON.stringify(content));
  await client.set('content:updatedAt', Date.now().toString());

  console.log('Seeded content into Redis');
  await client.quit();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
