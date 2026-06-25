import { PrismaClient, TournamentStatus, TournamentFormat } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ───────────────────────────────────────────────
  // Create admin user (no password — auth via Supabase)
  // ───────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@chessmate.in' },
    update: {},
    create: {
      email: 'admin@chessmate.in',
      name: 'ChessMate Admin',
      role: 'ADMIN',
      authProvider: 'seed',
      // authProviderId will be set when admin logs in via Supabase
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // ───────────────────────────────────────────────
  // Create demo player
  // ───────────────────────────────────────────────
  const player = await prisma.user.upsert({
    where: { email: 'arjun@chessmate.in' },
    update: {},
    create: {
      email: 'arjun@chessmate.in',
      name: 'Arjun Kumar',
      role: 'PLAYER',
      fideId: '5033506',
      authProvider: 'seed',
      profile: {
        create: {
          username: 'arjunkumar',
          currentRating: 1842,
          peakRating: 1901,
          totalTournaments: 24,
          winRate: 68,
          bio: 'FIDE rated player from Tamil Nadu. Love classical chess and positional play.',
          ratingHistory: {
            create: [
              { rating: 1755, date: new Date('2024-01-15'), tournamentName: 'Tamil Nadu Blitz 2024', delta: 23 },
              { rating: 1778, date: new Date('2024-03-10'), tournamentName: 'Coimbatore District Open 2024', delta: 23 },
              { rating: 1801, date: new Date('2024-05-20'), tournamentName: 'South India Open 2024', delta: 23 },
              { rating: 1788, date: new Date('2024-07-08'), tournamentName: 'Hyderabad Open 2024', delta: -13 },
              { rating: 1812, date: new Date('2024-09-14'), tournamentName: 'Chennai Open Rapid 2024', delta: 24 },
              { rating: 1829, date: new Date('2024-11-22'), tournamentName: 'Tamil Nadu State 2024', delta: 17 },
              { rating: 1835, date: new Date('2025-01-18'), tournamentName: 'Coimbatore Classic 2025', delta: 6 },
              { rating: 1842, date: new Date('2025-03-08'), tournamentName: 'All India Open 2025', delta: 7 },
            ],
          },
        },
      },
    },
  });
  console.log('✅ Player created:', player.email);

  // ───────────────────────────────────────────────
  // Create tournaments
  // ───────────────────────────────────────────────
  const tournaments = [
    {
      slug: 'all-india-open-classical-2025',
      name: 'All India Open Classical Chess Championship 2025',
      city: 'Chennai', state: 'Tamil Nadu',
      startDate: new Date('2025-06-15'), endDate: new Date('2025-06-22'),
      format: TournamentFormat.SWISS, rounds: 9, timeControl: '90+30',
      category: 'Open (All Ratings)', fideRated: true, entryFee: '₹1,500',
      prizePool: '₹2,00,000', status: TournamentStatus.OPEN, emoji: '♟',
      about: 'The All India Open is one of India\'s premier classical chess tournaments, attracting FIDE-rated players from across the country. With a total prize fund of ₹2 lakhs and 9 rounds of classical chess over 8 days, this is an unmissable event for any serious competitor.',
      detail: {
        venue: 'Jawaharlal Nehru Indoor Stadium, Periyasamy Rd, Chennai - 600003',
        chiefArbiter: 'IA Suresh Kumar',
        organizer: 'Tamil Nadu Chess Federation',
        organizingCommittee: 'R. Srinivasan, K. Mehta, Priya Rao, Suresh T',
        registrationLink: 'https://chessmate.in/register/all-india-open-2025',
        prizes: [
          { position: '1st Prize', amount: '₹80,000' },
          { position: '2nd Prize', amount: '₹40,000' },
          { position: '3rd Prize', amount: '₹20,000' },
          { position: '4th Prize', amount: '₹12,000' },
          { position: '5th Prize', amount: '₹8,000' },
          { position: 'Best Under-1800', amount: '₹10,000' },
          { position: 'Best Female Player', amount: '₹8,000' },
        ],
      },
    },
    {
      slug: 'mumbai-blitz-rapid-festival-2025',
      name: 'Mumbai Blitz & Rapid Festival 2025',
      city: 'Mumbai', state: 'Maharashtra',
      startDate: new Date('2025-05-25'), endDate: new Date('2025-05-26'),
      format: TournamentFormat.BLITZ, rounds: 11, timeControl: '3+2',
      category: 'Open', fideRated: true, entryFee: '₹800',
      prizePool: '₹75,000', status: TournamentStatus.UPCOMING, emoji: '⚡',
      about: 'The annual Mumbai Blitz & Rapid Festival is a high-energy two-day event combining blitz and rapid formats. Known for its electric atmosphere and strong competitive field from across Maharashtra.',
      detail: {
        venue: 'Bandra Sports Complex, BKC, Mumbai - 400051',
        chiefArbiter: 'IA Priya Rao',
        organizer: 'Maharashtra Chess Association',
        organizingCommittee: 'A. Sharma, D. Joshi, Meena Kaur',
        registrationLink: 'https://chessmate.in/register/mumbai-blitz-2025',
        prizes: [
          { position: '1st Prize', amount: '₹25,000' },
          { position: '2nd Prize', amount: '₹15,000' },
          { position: '3rd Prize', amount: '₹8,000' },
          { position: 'Best Veteran (50+)', amount: '₹3,000' },
          { position: 'Best Junior (U18)', amount: '₹3,000' },
        ],
      },
    },
    {
      slug: 'karnataka-state-championship-2025',
      name: 'Karnataka State Championship 2025',
      city: 'Bengaluru', state: 'Karnataka',
      startDate: new Date('2025-07-03'), endDate: new Date('2025-07-10'),
      format: TournamentFormat.SWISS, rounds: 9, timeControl: '90+30',
      category: 'Open', fideRated: true, entryFee: '₹1,000',
      prizePool: '₹1,50,000', status: TournamentStatus.UPCOMING, emoji: '🏆',
      about: 'The prestigious Karnataka State Championship attracts the finest players from the state and neighbouring regions. Open to all players with a strong competitive field expected from Bengaluru, Mysore, Mangalore, and beyond.',
      detail: {
        venue: 'Kanteerava Indoor Stadium, Kasturba Rd, Bengaluru - 560001',
        chiefArbiter: 'FA Venkat Reddy',
        organizer: 'Karnataka Chess Association',
        organizingCommittee: 'S. Murthy, R. Kumar, Asha Nair',
        registrationLink: 'https://chessmate.in/register/karnataka-state-2025',
        prizes: [
          { position: '1st Prize', amount: '₹60,000' },
          { position: '2nd Prize', amount: '₹30,000' },
          { position: '3rd Prize', amount: '₹15,000' },
          { position: 'Best Under-2000', amount: '₹10,000' },
          { position: 'Best Female', amount: '₹6,000' },
        ],
      },
    },
    {
      slug: 'delhi-open-rapid-2025',
      name: 'Delhi Open Rapid 2025',
      city: 'Delhi', state: 'Delhi',
      startDate: new Date('2025-04-20'), endDate: new Date('2025-04-22'),
      format: TournamentFormat.RAPID, rounds: 9, timeControl: '25+10',
      category: 'Open', fideRated: false, entryFee: '₹500',
      prizePool: '₹50,000', status: TournamentStatus.COMPLETED, emoji: '🏙',
      about: 'The Delhi Open Rapid is a popular annual rapid chess event in the capital, drawing players from across North India. Completed successfully with 287 participants.',
      detail: {
        venue: 'Siri Fort Sports Complex, August Kranti Marg, New Delhi - 110049',
        chiefArbiter: 'NA Rajiv Mehta',
        organizer: 'Delhi Chess Association',
        organizingCommittee: 'P. Gupta, S. Singh, Ritu Malhotra',
        resultsLink: 'https://chessmate.in/results/delhi-rapid-2025',
        prizes: [
          { position: '1st Prize', amount: '₹20,000' },
          { position: '2nd Prize', amount: '₹10,000' },
          { position: '3rd Prize', amount: '₹5,000' },
        ],
      },
    },
    {
      slug: 'hyderabad-international-open-2025',
      name: 'Hyderabad International Open 2025',
      city: 'Hyderabad', state: 'Telangana',
      startDate: new Date('2025-08-01'), endDate: new Date('2025-08-08'),
      format: TournamentFormat.SWISS, rounds: 9, timeControl: '90+30',
      category: 'Open', fideRated: true, entryFee: '₹2,000',
      prizePool: '₹5,00,000', status: TournamentStatus.UPCOMING, emoji: '🌐',
      about: 'One of India\'s biggest open chess tournaments with international participation and a massive ₹5 lakh prize fund. Grandmasters and IMs expected from across India and abroad. Must-attend for serious competitive players.',
      detail: {
        venue: 'HITEX Exhibition Centre, HITEC City, Hyderabad - 500084',
        chiefArbiter: 'IA Ravi Shankar',
        organizer: 'Telangana Chess Federation',
        organizingCommittee: 'Satish Kumar, Anand Rao, Preethi V',
        registrationLink: 'https://chessmate.in/register/hyd-intl-2025',
        prizes: [
          { position: '1st Prize', amount: '₹2,00,000' },
          { position: '2nd Prize', amount: '₹1,00,000' },
          { position: '3rd Prize', amount: '₹50,000' },
          { position: '4th Prize', amount: '₹25,000' },
          { position: '5th Prize', amount: '₹15,000' },
          { position: 'Best IM / FIDE Master', amount: '₹15,000' },
        ],
      },
    },
    {
      slug: 'coimbatore-chess-classic-u1800-2025',
      name: 'Coimbatore Chess Classic – Under 1800',
      city: 'Coimbatore', state: 'Tamil Nadu',
      startDate: new Date('2025-06-28'), endDate: new Date('2025-06-30'),
      format: TournamentFormat.SWISS, rounds: 7, timeControl: '60+30',
      category: 'Under 1800', fideRated: true, entryFee: '₹600',
      prizePool: '₹40,000', status: TournamentStatus.OPEN, emoji: '🌟',
      about: 'Category-restricted tournament exclusively for players rated under 1800 FIDE. Perfect for club players looking to gain rating points in a competitive yet accessible environment. Run across 3 days with morning and afternoon sessions.',
      detail: {
        venue: 'Nehru Stadium Indoor Hall, Coimbatore - 641018',
        chiefArbiter: 'FA Mani Subramanian',
        organizer: 'Coimbatore District Chess Federation',
        organizingCommittee: 'Babu K, Rajan M, Kavitha S',
        registrationLink: 'https://chessmate.in/register/cbe-classic-2025',
        prizes: [
          { position: '1st Prize', amount: '₹15,000' },
          { position: '2nd Prize', amount: '₹8,000' },
          { position: '3rd Prize', amount: '₹4,000' },
          { position: 'Best School Player', amount: '₹2,000' },
          { position: 'Best Girl Player', amount: '₹2,000' },
        ],
      },
    },
    {
      slug: 'kerala-womens-state-open-2025',
      name: "Kerala Women's State Open 2025",
      city: 'Kochi', state: 'Kerala',
      startDate: new Date('2025-07-15'), endDate: new Date('2025-07-18'),
      format: TournamentFormat.SWISS, rounds: 7, timeControl: '90+30',
      category: 'Women Open', fideRated: true, entryFee: '₹400',
      prizePool: '₹60,000', status: TournamentStatus.UPCOMING, emoji: '👑',
      about: "State-level women's open chess championship with strong participation across Kerala and neighbouring states. An important tournament for women seeking FIDE rating improvements.",
      detail: {
        venue: 'Indoor Stadium, Jawaharlal Nehru International Stadium, Kochi - 682011',
        chiefArbiter: 'IA Suma Nair',
        organizer: 'Kerala Chess Federation',
        organizingCommittee: 'Rekha Pillai, Anjali Menon, Sindhu V',
        registrationLink: 'https://chessmate.in/register/kerala-women-2025',
        prizes: [
          { position: '1st Prize', amount: '₹25,000' },
          { position: '2nd Prize', amount: '₹12,000' },
          { position: '3rd Prize', amount: '₹6,000' },
          { position: 'Best Under-18 Girl', amount: '₹4,000' },
        ],
      },
    },
    {
      slug: 'pune-grandmaster-invitational-2025',
      name: 'Pune Grandmaster Invitational 2025',
      city: 'Pune', state: 'Maharashtra',
      startDate: new Date('2025-09-10'), endDate: new Date('2025-09-17'),
      format: TournamentFormat.ROUND_ROBIN, rounds: 10, timeControl: '90+30',
      category: 'Open (2400+ by Invitation)', fideRated: true, entryFee: 'By Invitation',
      prizePool: '₹10,00,000', status: TournamentStatus.UPCOMING, emoji: '💎',
      about: 'Elite invitational Round Robin tournament for grandmasters and international masters. Limited to 12 players by invitation only. Prestigious venue and the biggest individual prize fund in India for 2025.',
      detail: {
        venue: 'Taj Hotels Pune — Grand Ballroom, 1 MG Road, Pune - 411001',
        chiefArbiter: 'IA Deepak Joshi',
        organizer: 'Pune Chess Promoters Trust',
        organizingCommittee: 'Milind Rane, Sunanda Patil, Rohit S',
        prizes: [
          { position: '1st Prize', amount: '₹4,00,000' },
          { position: '2nd Prize', amount: '₹2,00,000' },
          { position: '3rd Prize', amount: '₹1,00,000' },
          { position: '4th Prize', amount: '₹60,000' },
          { position: '5th Prize', amount: '₹40,000' },
        ],
      },
    },
    {
      slug: 'chennai-junior-rapid-2025',
      name: 'Chennai Junior Rapid Championship 2025',
      city: 'Chennai', state: 'Tamil Nadu',
      startDate: new Date('2025-06-07'), endDate: new Date('2025-06-08'),
      format: TournamentFormat.RAPID, rounds: 9, timeControl: '25+10',
      category: 'Juniors (Under 18)', fideRated: false, entryFee: '₹300',
      prizePool: '₹15,000', status: TournamentStatus.ONGOING, emoji: '🎓',
      about: 'Annual junior rapid tournament exclusively for players under 18. A great platform for young talents to compete, gain tournament experience, and earn AICF rating points.',
      detail: {
        venue: 'Chennai Chess Club Hall, Anna Nagar, Chennai - 600040',
        chiefArbiter: 'NA Anand Subramanian',
        organizer: 'Chennai Chess Club',
        organizingCommittee: 'Ravi T, Deepak S, Priya K',
        prizes: [
          { position: '1st Prize', amount: '₹5,000' },
          { position: '2nd Prize', amount: '₹3,000' },
          { position: '3rd Prize', amount: '₹1,500' },
          { position: 'Best Under-12', amount: '₹1,500' },
          { position: 'Best Girl Player', amount: '₹1,000' },
        ],
      },
    },
  ];

  for (const t of tournaments) {
    const { detail, ...tournamentData } = t;
    const tournament = await prisma.tournament.upsert({
      where: { slug: tournamentData.slug },
      update: {},
      create: {
        ...tournamentData,
        detail: { create: detail },
      },
    });
    console.log(`✅ Tournament created: ${tournament.name}`);
  }

  console.log('\n🎉 Seed complete!');
  console.log('\n📋 Note: Users must log in via Supabase Auth (Google or email).');
  console.log('   The admin user (admin@chessmate.in) will be linked on first Supabase login.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
