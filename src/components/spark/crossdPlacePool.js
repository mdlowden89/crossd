import { parseQuizDimensions, getPrimaryCompatibleType } from './crossdCompatibilityEngine.js';
import { getCrossdDNAFromVenueTypes } from './googlePlacesDnaMapper.js';

/**
 * Crossd Place Pool Engine
 * 24-candidate place pools per MBTI type, fluid scoring via quiz percentages,
 * diversity rules, and Google Places type mappings.
 *
 * Selection: 4 strongest fits + 3 blended fits + 2 growth fits + 1 wildcard = 10
 */

// ─── Full place catalogue ─────────────────────────────────────────────────────
// Each entry carries:
//   id          – unique key
//   label       – human-readable Crossd category name
//   icon        – emoji
//   why         – one-sentence description shown in the UI
//   dna         – Crossd PlacesDNA tags
//   googleTypes – Google Places API types for nearby search
//   bestTimes   – morning | day | evening | night | late | weekend
//   experienceFamily – for diversity dedup (no more than 2 per family)
//   tags        – dimension tags for fluid scoring
//     ei:  'introvert' | 'extrovert' | 'neutral'
//     ns:  'intuitive' | 'sensing' | 'neutral'
//     tf:  'thinking' | 'feeling' | 'neutral'
//     jp:  'judging' | 'perceiving' | 'neutral'
//     crowd: 1–5 (1=very quiet, 5=very loud)
//     structure: 1–5 (1=totally free, 5=fully structured)

export const PLACE_CATALOGUE = [
  // ── QUIET / INTELLECTUAL ──────────────────────────────────────────────────
  {
    id: 'independent_bookshop',
    label: 'Independent Bookshops',
    icon: '📚',
    why: 'Quiet, curated and full of character — the natural habitat for curious, introspective minds.',
    dna: ['Calm & Cosy','Learning & Culture','Creative'],
    googleTypes: ['book_store','library'],
    bestTimes: ['morning','day','weekend'],
    experienceFamily: 'quiet_intellectual',
    tags: { ei: 'introvert', ns: 'intuitive', tf: 'neutral', jp: 'neutral', crowd: 1, structure: 2 },
  },
  {
    id: 'library',
    label: 'Libraries',
    icon: '🏛️',
    why: 'Still, purposeful spaces where deep thinkers naturally find each other.',
    dna: ['Calm & Cosy','Learning & Culture'],
    googleTypes: ['library'],
    bestTimes: ['morning','day'],
    experienceFamily: 'quiet_intellectual',
    tags: { ei: 'introvert', ns: 'intuitive', tf: 'thinking', jp: 'judging', crowd: 1, structure: 3 },
  },
  {
    id: 'specialist_museum',
    label: 'Specialist Museums',
    icon: '🔭',
    why: 'Purposeful environments with real depth — where intentional people explore what they love.',
    dna: ['Learning & Culture','Creative'],
    googleTypes: ['museum','history_museum','science_museum'],
    bestTimes: ['day','weekend'],
    experienceFamily: 'museums_galleries',
    tags: { ei: 'introvert', ns: 'intuitive', tf: 'thinking', jp: 'judging', crowd: 2, structure: 3 },
  },
  {
    id: 'art_gallery',
    label: 'Art Galleries',
    icon: '🖼️',
    why: 'Aesthetic spark — slow-burn connections happen where beautiful things are on display.',
    dna: ['Creative','Learning & Culture','Romantic'],
    googleTypes: ['art_gallery','art_museum'],
    bestTimes: ['day','evening','weekend'],
    experienceFamily: 'museums_galleries',
    tags: { ei: 'neutral', ns: 'intuitive', tf: 'feeling', jp: 'neutral', crowd: 2, structure: 2 },
  },
  {
    id: 'planetarium',
    label: 'Planetariums & Science Centres',
    icon: '🪐',
    why: 'Rare, immersive and conversation-starting — built for wonder and shared curiosity.',
    dna: ['Learning & Culture','Creative','Romantic'],
    googleTypes: ['planetarium','science_museum'],
    bestTimes: ['day','evening','weekend'],
    experienceFamily: 'museums_galleries',
    tags: { ei: 'introvert', ns: 'intuitive', tf: 'thinking', jp: 'judging', crowd: 2, structure: 4 },
  },
  {
    id: 'museum_late_night',
    label: 'Museum Late Nights',
    icon: '🌙',
    why: 'Curious dates, meaningful conversation — museums after hours attract intentional people.',
    dna: ['Learning & Culture','Creative','Romantic'],
    googleTypes: ['museum','art_museum','history_museum'],
    bestTimes: ['evening','weekend'],
    experienceFamily: 'museums_galleries',
    tags: { ei: 'neutral', ns: 'intuitive', tf: 'neutral', jp: 'perceiving', crowd: 3, structure: 2 },
  },
  {
    id: 'public_lecture',
    label: 'Talks & Public Lectures',
    icon: '🎓',
    why: 'Ideas-first environments — where sharp minds discover each other through conversation.',
    dna: ['Learning & Culture','Work & Ambition'],
    googleTypes: ['university','cultural_center','auditorium'],
    bestTimes: ['evening','weekend'],
    experienceFamily: 'talks_events',
    tags: { ei: 'introvert', ns: 'intuitive', tf: 'thinking', jp: 'judging', crowd: 3, structure: 4 },
  },
  {
    id: 'escape_room',
    label: 'Escape Rooms',
    icon: '🔐',
    why: 'Shared problem-solving under pressure — personality reveals itself fast in escape rooms.',
    dna: ['Active','Social Buzz','Learning & Culture'],
    googleTypes: ['escape_room','amusement_center'],
    bestTimes: ['evening','weekend'],
    experienceFamily: 'games_activities',
    tags: { ei: 'neutral', ns: 'intuitive', tf: 'thinking', jp: 'judging', crowd: 2, structure: 4 },
  },
  {
    id: 'strategy_boardgame_cafe',
    label: 'Strategy Board-Game Cafés',
    icon: '♟️',
    why: 'Playful and competitive — ideal for curious personalities who enjoy thinking together.',
    dna: ['Social Buzz','Learning & Culture','Calm & Cosy'],
    googleTypes: ['cafe','amusement_center','board_game_cafe'],
    bestTimes: ['evening','day','weekend'],
    experienceFamily: 'games_activities',
    tags: { ei: 'neutral', ns: 'intuitive', tf: 'thinking', jp: 'perceiving', crowd: 2, structure: 3 },
  },
  {
    id: 'quiz_night',
    label: 'Quiz Nights',
    icon: '🧠',
    why: 'Competitive social energy with an intellectual edge — naturally filters for curious minds.',
    dna: ['Social Buzz','Learning & Culture','Live Events'],
    googleTypes: ['pub','bar','community_center'],
    bestTimes: ['evening','weekend'],
    experienceFamily: 'games_activities',
    tags: { ei: 'extrovert', ns: 'intuitive', tf: 'thinking', jp: 'perceiving', crowd: 3, structure: 3 },
  },
  // ── CAFÉS & COSY ──────────────────────────────────────────────────────────
  {
    id: 'independent_cafe',
    label: 'Independent Cafés',
    icon: '☕',
    why: 'Low-pressure and conversation-friendly — the natural habitat for deep thinkers and quiet romantics.',
    dna: ['Calm & Cosy','Foodie','Social Buzz'],
    googleTypes: ['cafe','coffee_shop','coffee_roastery'],
    bestTimes: ['morning','day','evening'],
    experienceFamily: 'cafes_cosy',
    tags: { ei: 'neutral', ns: 'neutral', tf: 'feeling', jp: 'perceiving', crowd: 2, structure: 1 },
  },
  {
    id: 'bookshop_cafe',
    label: 'Bookshop Cafés',
    icon: '☕',
    why: 'Books and coffee — the quietest, most intentional kind of social space.',
    dna: ['Calm & Cosy','Learning & Culture','Foodie'],
    googleTypes: ['cafe','book_store','coffee_shop'],
    bestTimes: ['morning','day'],
    experienceFamily: 'cafes_cosy',
    tags: { ei: 'introvert', ns: 'intuitive', tf: 'feeling', jp: 'neutral', crowd: 1, structure: 1 },
  },
  {
    id: 'coffee_roastery',
    label: 'Specialty Coffee Roasteries',
    icon: '☕',
    why: 'Craft-obsessed, considered and genuinely interesting — for those who care about the details.',
    dna: ['Calm & Cosy','Creative','Foodie'],
    googleTypes: ['coffee_roastery','cafe'],
    bestTimes: ['morning','day'],
    experienceFamily: 'cafes_cosy',
    tags: { ei: 'introvert', ns: 'intuitive', tf: 'thinking', jp: 'judging', crowd: 2, structure: 2 },
  },
  {
    id: 'tea_room',
    label: 'Tea Rooms & Tea Houses',
    icon: '🍵',
    why: 'Calm, intentional and quietly romantic — ideal for meaningful first conversations.',
    dna: ['Calm & Cosy','Romantic','Foodie'],
    googleTypes: ['tea_house','cafe'],
    bestTimes: ['morning','day'],
    experienceFamily: 'cafes_cosy',
    tags: { ei: 'introvert', ns: 'sensing', tf: 'feeling', jp: 'judging', crowd: 1, structure: 2 },
  },
  // ── OUTDOORS & NATURE ─────────────────────────────────────────────────────
  {
    id: 'botanical_garden',
    label: 'Botanical Gardens',
    icon: '🌸',
    why: 'Romantic without pressure — beautiful settings create natural conversation and shared wonder.',
    dna: ['Outdoors','Romantic','Calm & Cosy'],
    googleTypes: ['botanical_garden','garden'],
    bestTimes: ['day','weekend'],
    experienceFamily: 'outdoors',
    tags: { ei: 'neutral', ns: 'neutral', tf: 'feeling', jp: 'perceiving', crowd: 2, structure: 1 },
  },
  {
    id: 'hiking_nature',
    label: 'Hiking & Nature Preserves',
    icon: '🌿',
    why: 'Shared outdoor adventure breaks down barriers — long walks lead to real conversations.',
    dna: ['Outdoors','Active','Wellness'],
    googleTypes: ['hiking_area','national_park','nature_preserve','state_park'],
    bestTimes: ['morning','day','weekend'],
    experienceFamily: 'outdoors',
    tags: { ei: 'neutral', ns: 'sensing', tf: 'neutral', jp: 'perceiving', crowd: 1, structure: 1 },
  },
  {
    id: 'country_park',
    label: 'Country Parks & Scenic Spots',
    icon: '🏞️',
    why: 'Space to breathe, walk and be genuinely present — low agenda, high connection potential.',
    dna: ['Outdoors','Calm & Cosy','Active'],
    googleTypes: ['park','scenic_spot','national_park'],
    bestTimes: ['morning','day','weekend'],
    experienceFamily: 'outdoors',
    tags: { ei: 'neutral', ns: 'sensing', tf: 'neutral', jp: 'perceiving', crowd: 1, structure: 1 },
  },
  {
    id: 'vineyard',
    label: 'Vineyards & Wineries',
    icon: '🍾',
    why: 'Unhurried, scenic and inherently social — ideal for compatible types who value quality.',
    dna: ['Romantic','Foodie','Outdoors','Premium Lifestyle'],
    googleTypes: ['vineyard','winery'],
    bestTimes: ['day','evening','weekend'],
    experienceFamily: 'food_drink',
    tags: { ei: 'neutral', ns: 'sensing', tf: 'feeling', jp: 'judging', crowd: 2, structure: 3 },
  },
  // ── LIVE MUSIC & PERFORMANCE ──────────────────────────────────────────────
  {
    id: 'live_music_venue',
    label: 'Live Music Venues',
    icon: '🎶',
    why: 'Shared atmosphere — the feeling of being in a crowd all feeling the same thing.',
    dna: ['Live Events','Creative','Nightlife'],
    googleTypes: ['live_music_venue','concert_hall','amphitheatre'],
    bestTimes: ['evening','night','weekend'],
    experienceFamily: 'live_performance',
    tags: { ei: 'extrovert', ns: 'neutral', tf: 'feeling', jp: 'perceiving', crowd: 4, structure: 2 },
  },
  {
    id: 'jazz_acoustic',
    label: 'Jazz & Acoustic Venues',
    icon: '🎷',
    why: 'Intimate live music — where thoughtful personalities find each other in quiet intensity.',
    dna: ['Live Events','Romantic','Calm & Cosy'],
    googleTypes: ['live_music_venue','bar','concert_hall'],
    bestTimes: ['evening','night','weekend'],
    experienceFamily: 'live_performance',
    tags: { ei: 'neutral', ns: 'intuitive', tf: 'feeling', jp: 'perceiving', crowd: 3, structure: 2 },
  },
  {
    id: 'theatre',
    label: 'Theatre & Performance Spaces',
    icon: '🎭',
    why: 'Shared emotional experiences create depth quickly — perfect for intuitives who love story.',
    dna: ['Live Events','Creative','Romantic'],
    googleTypes: ['performing_arts_theater','opera_house','auditorium'],
    bestTimes: ['evening','weekend'],
    experienceFamily: 'live_performance',
    tags: { ei: 'neutral', ns: 'intuitive', tf: 'feeling', jp: 'judging', crowd: 3, structure: 4 },
  },
  {
    id: 'comedy_club',
    label: 'Comedy Clubs',
    icon: '😄',
    why: 'Shared laughter is a fast-track to connection — high-energy social types thrive here.',
    dna: ['Live Events','Social Buzz','Nightlife'],
    googleTypes: ['comedy_club'],
    bestTimes: ['evening','night','weekend'],
    experienceFamily: 'live_performance',
    tags: { ei: 'extrovert', ns: 'neutral', tf: 'neutral', jp: 'perceiving', crowd: 4, structure: 2 },
  },
  {
    id: 'concert_hall',
    label: 'Concert Halls & Opera Houses',
    icon: '🎻',
    why: 'Curated, structured and culturally rich — for those who appreciate deliberate experience.',
    dna: ['Live Events','Creative','Premium Lifestyle'],
    googleTypes: ['concert_hall','opera_house','philharmonic_hall'],
    bestTimes: ['evening','weekend'],
    experienceFamily: 'live_performance',
    tags: { ei: 'neutral', ns: 'intuitive', tf: 'feeling', jp: 'judging', crowd: 3, structure: 5 },
  },
  {
    id: 'independent_cinema',
    label: 'Independent Cinemas',
    icon: '🎬',
    why: 'Thoughtful film choices signal compatible taste — great conversation starter before and after.',
    dna: ['Creative','Romantic','Learning & Culture'],
    googleTypes: ['movie_theater'],
    bestTimes: ['evening','day','weekend'],
    experienceFamily: 'cultural_experiences',
    tags: { ei: 'neutral', ns: 'intuitive', tf: 'feeling', jp: 'judging', crowd: 2, structure: 4 },
  },
  // ── FOOD & SOCIAL DINING ──────────────────────────────────────────────────
  {
    id: 'street_food_market',
    label: 'Street Food Markets',
    icon: '🍜',
    why: 'Energetic, exploratory and sensory — perfect for spontaneous personalities and shared discovery.',
    dna: ['Foodie','Social Buzz','Outdoors'],
    googleTypes: ['food_court','market','farmers_market'],
    bestTimes: ['day','evening','weekend'],
    experienceFamily: 'markets',
    tags: { ei: 'extrovert', ns: 'sensing', tf: 'neutral', jp: 'perceiving', crowd: 4, structure: 1 },
  },
  {
    id: 'farmers_market',
    label: "Farmers' Markets",
    icon: '🥦',
    why: 'Laid-back social energy with shared lifestyle values around food and community.',
    dna: ['Foodie','Outdoors','Social Buzz'],
    googleTypes: ['farmers_market','market'],
    bestTimes: ['morning','day','weekend'],
    experienceFamily: 'markets',
    tags: { ei: 'extrovert', ns: 'sensing', tf: 'feeling', jp: 'perceiving', crowd: 3, structure: 1 },
  },
  {
    id: 'brunch_restaurant',
    label: 'Brunch Restaurants',
    icon: '🍳',
    why: 'Warm, social and low-stakes — brunch is the friendliest first date format there is.',
    dna: ['Foodie','Social Buzz','Romantic'],
    googleTypes: ['brunch_restaurant','cafe','restaurant'],
    bestTimes: ['morning','day','weekend'],
    experienceFamily: 'food_drink',
    tags: { ei: 'extrovert', ns: 'sensing', tf: 'feeling', jp: 'perceiving', crowd: 3, structure: 2 },
  },
  {
    id: 'fine_dining',
    label: 'Fine Dining Restaurants',
    icon: '🍽️',
    why: 'Classic high-intention date energy — shows deliberate choice and genuine investment.',
    dna: ['Romantic','Foodie','Premium Lifestyle'],
    googleTypes: ['fine_dining_restaurant','french_restaurant','steak_house'],
    bestTimes: ['evening','weekend'],
    experienceFamily: 'food_drink',
    tags: { ei: 'neutral', ns: 'sensing', tf: 'feeling', jp: 'judging', crowd: 2, structure: 5 },
  },
  {
    id: 'tapas_sharing',
    label: 'Tapas & Sharing Plate Restaurants',
    icon: '🫒',
    why: 'Sharing food lowers guards — perfect format for first connections and easy conversation.',
    dna: ['Foodie','Romantic','Social Buzz'],
    googleTypes: ['tapas_restaurant','spanish_restaurant','mediterranean_restaurant'],
    bestTimes: ['evening','weekend'],
    experienceFamily: 'food_drink',
    tags: { ei: 'extrovert', ns: 'sensing', tf: 'feeling', jp: 'perceiving', crowd: 3, structure: 2 },
  },
  {
    id: 'bakery_dessert',
    label: 'Bakeries & Dessert Cafés',
    icon: '🥐',
    why: 'Sweet, informal and unpretentious — a gentle, low-stakes environment for connection.',
    dna: ['Foodie','Calm & Cosy','Romantic'],
    googleTypes: ['bakery','dessert_shop','cake_shop'],
    bestTimes: ['morning','day','weekend'],
    experienceFamily: 'cafes_cosy',
    tags: { ei: 'introvert', ns: 'sensing', tf: 'feeling', jp: 'perceiving', crowd: 2, structure: 1 },
  },
  // ── BARS & NIGHTLIFE ──────────────────────────────────────────────────────
  {
    id: 'cocktail_bar',
    label: 'Cocktail & Wine Bars',
    icon: '🍸',
    why: 'Intentional evening energy — where compatible types slow down and connect properly.',
    dna: ['Romantic','Nightlife','Premium Lifestyle'],
    googleTypes: ['cocktail_bar','wine_bar','lounge_bar'],
    bestTimes: ['evening','night','weekend'],
    experienceFamily: 'bars_nightlife',
    tags: { ei: 'neutral', ns: 'neutral', tf: 'feeling', jp: 'judging', crowd: 3, structure: 2 },
  },
  {
    id: 'rooftop_bar',
    label: 'Rooftop Bars & Lounges',
    icon: '🌆',
    why: 'Elevated settings attract people who appreciate the finer details — premium energy.',
    dna: ['Romantic','Premium Lifestyle','Social Buzz'],
    googleTypes: ['lounge_bar','bar','observation_deck'],
    bestTimes: ['evening','night','weekend'],
    experienceFamily: 'bars_nightlife',
    tags: { ei: 'extrovert', ns: 'neutral', tf: 'neutral', jp: 'perceiving', crowd: 4, structure: 2 },
  },
  {
    id: 'brewpub',
    label: 'Breweries & Brewpubs',
    icon: '🍺',
    why: 'Informal, craft-focused and social — naturally filters for people with genuine taste.',
    dna: ['Social Buzz','Foodie','Nightlife'],
    googleTypes: ['brewery','brewpub'],
    bestTimes: ['evening','night','weekend'],
    experienceFamily: 'bars_nightlife',
    tags: { ei: 'extrovert', ns: 'sensing', tf: 'neutral', jp: 'perceiving', crowd: 3, structure: 1 },
  },
  {
    id: 'karaoke',
    label: 'Karaoke Venues',
    icon: '🎤',
    why: 'Unguarded, playful and surprisingly revealing — people who karaoke have no fear of judgment.',
    dna: ['Nightlife','Social Buzz','Live Events'],
    googleTypes: ['karaoke'],
    bestTimes: ['evening','night','weekend'],
    experienceFamily: 'bars_nightlife',
    tags: { ei: 'extrovert', ns: 'sensing', tf: 'feeling', jp: 'perceiving', crowd: 4, structure: 1 },
  },
  {
    id: 'dance_venue',
    label: 'Dance Venues & Studios',
    icon: '💃',
    why: 'Movement and music together — where extroverted, expressive personalities feel most alive.',
    dna: ['Nightlife','Live Events','Active'],
    googleTypes: ['dance_hall','night_club'],
    bestTimes: ['evening','night','weekend'],
    experienceFamily: 'bars_nightlife',
    tags: { ei: 'extrovert', ns: 'sensing', tf: 'feeling', jp: 'perceiving', crowd: 5, structure: 1 },
  },
  // ── ACTIVE & ADVENTURE ────────────────────────────────────────────────────
  {
    id: 'adventure_sports',
    label: 'Adventure Sports Centres',
    icon: '🧗',
    why: 'Adrenaline creates connection — shared challenges accelerate trust and authentic personality.',
    dna: ['Active','Social Buzz','Outdoors'],
    googleTypes: ['adventure_sports_center'],
    bestTimes: ['day','weekend'],
    experienceFamily: 'active_adventure',
    tags: { ei: 'extrovert', ns: 'sensing', tf: 'thinking', jp: 'perceiving', crowd: 3, structure: 2 },
  },
  {
    id: 'go_karting',
    label: 'Go-Karting Venues',
    icon: '🏎️',
    why: 'Competitive and physical — ideal for driven, action-oriented personalities.',
    dna: ['Active','Social Buzz'],
    googleTypes: ['go_karting_venue'],
    bestTimes: ['day','evening','weekend'],
    experienceFamily: 'active_adventure',
    tags: { ei: 'extrovert', ns: 'sensing', tf: 'thinking', jp: 'perceiving', crowd: 3, structure: 3 },
  },
  {
    id: 'indoor_golf',
    label: 'Indoor Golf Venues',
    icon: '⛳',
    why: 'Social sport with a premium feel — competitive but relaxed enough for real conversation.',
    dna: ['Active','Premium Lifestyle','Social Buzz'],
    googleTypes: ['indoor_golf_course'],
    bestTimes: ['evening','weekend'],
    experienceFamily: 'active_adventure',
    tags: { ei: 'neutral', ns: 'sensing', tf: 'thinking', jp: 'judging', crowd: 2, structure: 3 },
  },
  {
    id: 'bowling',
    label: 'Bowling Alleys',
    icon: '🎳',
    why: 'Low-stakes, fun and group-friendly — a classic that brings out relaxed, authentic personality.',
    dna: ['Active','Social Buzz'],
    googleTypes: ['bowling_alley'],
    bestTimes: ['evening','weekend'],
    experienceFamily: 'active_adventure',
    tags: { ei: 'extrovert', ns: 'sensing', tf: 'neutral', jp: 'perceiving', crowd: 3, structure: 3 },
  },
  {
    id: 'retro_arcade',
    label: 'Retro Arcades',
    icon: '🕹️',
    why: 'Playful, nostalgic and unpretentious — where curious personalities can truly relax and play.',
    dna: ['Social Buzz','Active'],
    googleTypes: ['video_arcade','amusement_center'],
    bestTimes: ['evening','weekend'],
    experienceFamily: 'games_activities',
    tags: { ei: 'neutral', ns: 'sensing', tf: 'neutral', jp: 'perceiving', crowd: 3, structure: 1 },
  },
  // ── CREATIVE & CULTURAL ───────────────────────────────────────────────────
  {
    id: 'creative_workshop',
    label: 'Creative Workshops & Art Studios',
    icon: '🎨',
    why: 'Hands-on and expressive — shared creativity is one of the fastest routes to authentic connection.',
    dna: ['Creative','Social Buzz','Learning & Culture'],
    googleTypes: ['art_studio','cultural_center','community_center'],
    bestTimes: ['day','evening','weekend'],
    experienceFamily: 'creative',
    tags: { ei: 'neutral', ns: 'intuitive', tf: 'feeling', jp: 'perceiving', crowd: 2, structure: 3 },
  },
  {
    id: 'cultural_landmark',
    label: 'Historic Sites & Architecture',
    icon: '🏰',
    why: 'Story-rich environments — ideal for curious, history-minded personalities who love context.',
    dna: ['Learning & Culture','Outdoors','Romantic'],
    googleTypes: ['historical_place','historical_landmark','castle'],
    bestTimes: ['day','weekend'],
    experienceFamily: 'cultural_experiences',
    tags: { ei: 'neutral', ns: 'sensing', tf: 'thinking', jp: 'judging', crowd: 2, structure: 3 },
  },
  {
    id: 'immersive_experience',
    label: 'Immersive Experiences',
    icon: '🌀',
    why: 'Unusual and memorable — the kind of experience that creates instant shared references.',
    dna: ['Creative','Live Events','Social Buzz'],
    googleTypes: ['amusement_center','event_venue','cultural_center'],
    bestTimes: ['evening','weekend'],
    experienceFamily: 'cultural_experiences',
    tags: { ei: 'extrovert', ns: 'intuitive', tf: 'neutral', jp: 'perceiving', crowd: 3, structure: 3 },
  },
  {
    id: 'flea_vintage_market',
    label: 'Flea & Vintage Markets',
    icon: '🛍️',
    why: 'Exploratory, eclectic and social — ideal for creative and spontaneous personalities.',
    dna: ['Creative','Social Buzz','Shopping'],
    googleTypes: ['flea_market','thrift_store'],
    bestTimes: ['morning','day','weekend'],
    experienceFamily: 'markets',
    tags: { ei: 'extrovert', ns: 'sensing', tf: 'neutral', jp: 'perceiving', crowd: 3, structure: 1 },
  },
  // ── WELLNESS & CALM ───────────────────────────────────────────────────────
  {
    id: 'yoga_wellness',
    label: 'Yoga & Wellness Studios',
    icon: '🧘',
    why: 'Grounded emotional compatibility — shared wellness habits signal compatible values.',
    dna: ['Wellness','Calm & Cosy','Active'],
    googleTypes: ['yoga_studio','wellness_center','spa'],
    bestTimes: ['morning','day'],
    experienceFamily: 'wellness',
    tags: { ei: 'introvert', ns: 'neutral', tf: 'feeling', jp: 'judging', crowd: 2, structure: 3 },
  },
  {
    id: 'spa_wellness',
    label: 'Spa & Wellbeing Centres',
    icon: '💆',
    why: 'Calm and restorative — for personalities who value intentional self-care and shared calm.',
    dna: ['Wellness','Calm & Cosy','Premium Lifestyle'],
    googleTypes: ['spa','sauna','massage_spa'],
    bestTimes: ['morning','day','weekend'],
    experienceFamily: 'wellness',
    tags: { ei: 'introvert', ns: 'neutral', tf: 'feeling', jp: 'judging', crowd: 1, structure: 4 },
  },
  // ── SPORTS & NETWORKING ───────────────────────────────────────────────────
  {
    id: 'sports_club',
    label: 'Sports Clubs & Stadiums',
    icon: '⚽',
    why: 'Shared passion and tribal energy — where practical, action-oriented people naturally congregate.',
    dna: ['Active','Social Buzz','Live Events'],
    googleTypes: ['sports_club','stadium','arena'],
    bestTimes: ['day','evening','weekend'],
    experienceFamily: 'sports',
    tags: { ei: 'extrovert', ns: 'sensing', tf: 'thinking', jp: 'judging', crowd: 4, structure: 3 },
  },
  {
    id: 'golf_course',
    label: 'Golf Courses',
    icon: '🏌️',
    why: 'Precision, patience and premium lifestyle — natural territory for structured, ambitious types.',
    dna: ['Active','Outdoors','Premium Lifestyle'],
    googleTypes: ['golf_course'],
    bestTimes: ['morning','day','weekend'],
    experienceFamily: 'sports',
    tags: { ei: 'neutral', ns: 'sensing', tf: 'thinking', jp: 'judging', crowd: 1, structure: 4 },
  },
  {
    id: 'aquarium',
    label: 'Aquariums & Wildlife Parks',
    icon: '🐠',
    why: 'Calm, wonder-inducing and surprisingly romantic — a perfect low-key date environment.',
    dna: ['Learning & Culture','Romantic','Calm & Cosy'],
    googleTypes: ['aquarium','wildlife_park','zoo'],
    bestTimes: ['day','weekend'],
    experienceFamily: 'nature_wildlife',
    tags: { ei: 'neutral', ns: 'sensing', tf: 'feeling', jp: 'neutral', crowd: 2, structure: 3 },
  },
  {
    id: 'observation_deck',
    label: 'Observation Decks & Viewpoints',
    icon: '🏙️',
    why: 'Perspective-shifting and romantic — a shared view of a city creates an instant shared moment.',
    dna: ['Romantic','Outdoors','Premium Lifestyle'],
    googleTypes: ['observation_deck','scenic_spot'],
    bestTimes: ['day','evening','weekend'],
    experienceFamily: 'outdoors',
    tags: { ei: 'neutral', ns: 'intuitive', tf: 'feeling', jp: 'neutral', crowd: 2, structure: 2 },
  },
  {
    id: 'marina',
    label: 'Marinas & Waterfronts',
    icon: '⛵',
    why: 'Premium, scenic and unhurried — naturally draws people who appreciate quality and independence.',
    dna: ['Outdoors','Romantic','Premium Lifestyle'],
    googleTypes: ['marina','beach'],
    bestTimes: ['day','evening','weekend'],
    experienceFamily: 'outdoors',
    tags: { ei: 'neutral', ns: 'sensing', tf: 'neutral', jp: 'perceiving', crowd: 2, structure: 1 },
  },
  {
    id: 'community_centre',
    label: 'Community & Cultural Centres',
    icon: '🏘️',
    why: 'Warm, inclusive environments — where caring, community-oriented personalities naturally gather.',
    dna: ['Social Buzz','Learning & Culture'],
    googleTypes: ['community_center','cultural_center'],
    bestTimes: ['day','evening','weekend'],
    experienceFamily: 'community',
    tags: { ei: 'extrovert', ns: 'sensing', tf: 'feeling', jp: 'neutral', crowd: 3, structure: 3 },
  },
  {
    id: 'pop_up_event',
    label: 'Pop-Up Events & Festivals',
    icon: '🎪',
    why: 'Spontaneous and vibrant — magnetic environments for open, curious and social personalities.',
    dna: ['Live Events','Social Buzz','Creative'],
    googleTypes: ['event_venue','amusement_park'],
    bestTimes: ['day','evening','weekend'],
    experienceFamily: 'events_festivals',
    tags: { ei: 'extrovert', ns: 'neutral', tf: 'neutral', jp: 'perceiving', crowd: 5, structure: 1 },
  },
  {
    id: 'coworking_space',
    label: 'Creative Coworking Spaces',
    icon: '💡',
    why: 'Ambitious personalities cross paths here naturally — shared drive is its own attraction.',
    dna: ['Work & Ambition','Creative','Social Buzz'],
    googleTypes: ['coworking_space','business_center'],
    bestTimes: ['morning','day'],
    experienceFamily: 'community',
    tags: { ei: 'neutral', ns: 'intuitive', tf: 'thinking', jp: 'judging', crowd: 2, structure: 3 },
  },
  {
    id: 'picnic_park',
    label: 'Parks & Picnic Grounds',
    icon: '🌳',
    why: 'Natural, low-pressure and flexible — some of the best connections happen with no agenda.',
    dna: ['Outdoors','Calm & Cosy','Romantic'],
    googleTypes: ['park','picnic_ground','city_park'],
    bestTimes: ['morning','day','weekend'],
    experienceFamily: 'outdoors',
    tags: { ei: 'neutral', ns: 'sensing', tf: 'feeling', jp: 'perceiving', crowd: 2, structure: 1 },
  },
];

// ─── 24-candidate pools per type ─────────────────────────────────────────────
// Pools are ordered: [8 core, 8 adaptive, 8 flex]
const TYPE_POOLS = {
  INTJ: [
    'specialist_museum','art_gallery','planetarium','independent_bookshop','cultural_landmark','botanical_garden','cocktail_bar','escape_room',
    'public_lecture','independent_cinema','strategy_boardgame_cafe','museum_late_night','library','observation_deck','vineyard','fine_dining',
    'jazz_acoustic','hiking_nature','coworking_space','theatre','bookshop_cafe','coffee_roastery','creative_workshop','picnic_park',
  ],
  INTP: [
    'specialist_museum','planetarium','strategy_boardgame_cafe','library','independent_bookshop','retro_arcade','escape_room','independent_cafe',
    'public_lecture','creative_workshop','quiz_night','independent_cinema','cultural_landmark','aquarium','coffee_roastery','museum_late_night',
    'comedy_club','art_gallery','hiking_nature','coworking_space','street_food_market','jazz_acoustic','botanical_garden','brewpub',
  ],
  ENTJ: [
    'rooftop_bar','cocktail_bar','fine_dining','cultural_landmark','theatre','escape_room','sports_club','coworking_space',
    'indoor_golf','vineyard','art_gallery','observation_deck','go_karting','golf_course','concert_hall','specialist_museum',
    'comedy_club','adventure_sports','cultural_landmark','live_music_venue','botanical_garden','marina','brewpub','jazz_acoustic',
  ],
  ENTP: [
    'comedy_club','quiz_night','escape_room','specialist_museum','live_music_venue','strategy_boardgame_cafe','immersive_experience','street_food_market',
    'pop_up_event','art_gallery','independent_cinema','public_lecture','retro_arcade','brewpub','theatre','community_centre',
    'coworking_space','flea_vintage_market','go_karting','rooftop_bar','independent_bookshop','museum_late_night','karaoke','planetarium',
  ],
  INFJ: [
    'bookshop_cafe','art_gallery','botanical_garden','independent_cinema','cultural_landmark','independent_cafe','theatre','hiking_nature',
    'jazz_acoustic','specialist_museum','museum_late_night','observation_deck','yoga_wellness','library','public_lecture','tea_room',
    'creative_workshop','vineyard','community_centre','aquarium','picnic_park','fine_dining','independent_bookshop','country_park',
  ],
  INFP: [
    'independent_bookshop','art_gallery','botanical_garden','jazz_acoustic','creative_workshop','independent_cafe','theatre','hiking_nature',
    'bookshop_cafe','flea_vintage_market','independent_cinema','cultural_landmark','community_centre','picnic_park','aquarium','museum_late_night',
    'comedy_club','pop_up_event','yoga_wellness','tea_room','specialist_museum','observation_deck','bakery_dessert','country_park',
  ],
  ENFJ: [
    'theatre','community_centre','live_music_venue','brunch_restaurant','art_gallery','botanical_garden','creative_workshop','dance_venue',
    'comedy_club','rooftop_bar','specialist_museum','yoga_wellness','farmers_market','independent_cafe','pop_up_event','jazz_acoustic',
    'vineyard','cultural_landmark','picnic_park','karaoke','sports_club','independent_bookshop','fine_dining','aquarium',
  ],
  ENFP: [
    'live_music_venue','art_gallery','theatre','jazz_acoustic','comedy_club','independent_cafe','street_food_market','creative_workshop',
    'museum_late_night','pop_up_event','flea_vintage_market','botanical_garden','immersive_experience','independent_cinema','community_centre','rooftop_bar',
    'dance_venue','independent_bookshop','hiking_nature','karaoke','aquarium','brunch_restaurant','country_park','farmers_market',
  ],
  ISTJ: [
    'specialist_museum','cultural_landmark','library','botanical_garden','country_park','farmers_market','golf_course','concert_hall',
    'cultural_landmark','specialist_museum','independent_cafe','vineyard','observation_deck','bowling','independent_bookshop','fine_dining',
    'theatre','sports_club','hiking_nature','marina','community_centre','aquarium','public_lecture','tapas_sharing',
  ],
  ISFJ: [
    'independent_cafe','botanical_garden','brunch_restaurant','bakery_dessert','specialist_museum','cultural_landmark','community_centre','picnic_park',
    'creative_workshop','farmers_market','theatre','aquarium','country_park','independent_bookshop','yoga_wellness','tapas_sharing',
    'jazz_acoustic','aquarium','art_gallery','vineyard','live_music_venue','cultural_landmark','bookshop_cafe','farmers_market',
  ],
  ESTJ: [
    'sports_club','golf_course','fine_dining','cultural_landmark','escape_room','specialist_museum','bowling','concert_hall',
    'indoor_golf','brewpub','farmers_market','theatre','go_karting','vineyard','coworking_space','marina',
    'cocktail_bar','hiking_nature','specialist_museum','comedy_club','botanical_garden','rooftop_bar','independent_cafe','tapas_sharing',
  ],
  ESFJ: [
    'brunch_restaurant','independent_cafe','tapas_sharing','live_music_venue','theatre','community_centre','botanical_garden','farmers_market',
    'dance_venue','karaoke','comedy_club','art_gallery','pop_up_event','vineyard','bakery_dessert','flea_vintage_market',
    'yoga_wellness','picnic_park','specialist_museum','aquarium','sports_club','creative_workshop','rooftop_bar','cultural_landmark',
  ],
  ISTP: [
    'escape_room','go_karting','adventure_sports','retro_arcade','hiking_nature','bowling','creative_workshop','indoor_golf',
    'marina','golf_course','sports_club','brewpub','observation_deck','country_park','strategy_boardgame_cafe','specialist_museum',
    'cocktail_bar','independent_cafe','live_music_venue','botanical_garden','aquarium','independent_bookshop','jazz_acoustic','picnic_park',
  ],
  ISFP: [
    'art_gallery','creative_workshop','botanical_garden','live_music_venue','independent_cafe','hiking_nature','flea_vintage_market','observation_deck',
    'dance_venue','picnic_park','yoga_wellness','independent_cinema','aquarium','farmers_market','bakery_dessert','jazz_acoustic',
    'theatre','vineyard','country_park','specialist_museum','independent_bookshop','brunch_restaurant','community_centre','marina',
  ],
  ESTP: [
    'adventure_sports','go_karting','live_music_venue','rooftop_bar','sports_club','escape_room','bowling','retro_arcade',
    'pop_up_event','dance_venue','street_food_market','comedy_club','indoor_golf','aquarium','brewpub','karaoke',
    'marina','hiking_nature','country_park','flea_vintage_market','cocktail_bar','observation_deck','farmers_market','brunch_restaurant',
  ],
  ESFP: [
    'live_music_venue','dance_venue','rooftop_bar','comedy_club','street_food_market','theatre','pop_up_event','karaoke',
    'brunch_restaurant','art_gallery','immersive_experience','aquarium','botanical_garden','flea_vintage_market','farmers_market','community_centre',
    'creative_workshop','sports_club','bowling','vineyard','cocktail_bar','adventure_sports','bakery_dessert','jazz_acoustic',
  ],
};

// ─── Dimension adjustment modifiers ──────────────────────────────────────────
// Each place is tagged; we score each tag against the user's continuous dimensions.
function scorePlaceAgainstDimensions(place, dims) {
  const tags = place.tags;
  let score = 0;

  // E/I axis
  if (tags.ei === 'introvert') score += (dims.I || 0.5) * 0.25;
  else if (tags.ei === 'extrovert') score += (dims.E || 0.5) * 0.25;
  else score += 0.15; // neutral — small reward

  // N/S axis
  if (tags.ns === 'intuitive') score += (dims.N || 0.5) * 0.25;
  else if (tags.ns === 'sensing') score += (dims.S || 0.5) * 0.25;
  else score += 0.15;

  // T/F axis
  if (tags.tf === 'thinking') score += (dims.T || 0.5) * 0.20;
  else if (tags.tf === 'feeling') score += (dims.F || 0.5) * 0.20;
  else score += 0.12;

  // J/P axis — structure preference matches judging score
  const structureNorm = (tags.structure - 1) / 4; // 0–1
  const jpMatch = 1 - Math.abs((dims.J || 0.5) - structureNorm);
  score += jpMatch * 0.15;

  // Crowd preference — introverts prefer quieter (crowd 1–2), extroverts busier (4–5)
  const crowdNorm = (tags.crowd - 1) / 4;
  const crowdMatch = 1 - Math.abs(dims.E - crowdNorm);
  score += crowdMatch * 0.15;

  return Math.min(1, score);
}

// ─── PlacesDNA overlap scoring ────────────────────────────────────────────────
function scorePlaceAgainstUserDNA(place, userDNA) {
  if (!userDNA.size) return 0.5;
  const matches = place.dna.filter(d => userDNA.has(d)).length;
  return Math.min(1, matches / Math.max(1, place.dna.length));
}

// ─── Timing scoring ───────────────────────────────────────────────────────────
function scorePlaceAgainstTiming(place, userPeaks) {
  if (!userPeaks.size) return 0.5;
  const match = place.bestTimes.some(t => {
    if (userPeaks.has('evening') && (t === 'evening' || t === 'night')) return true;
    if (userPeaks.has('night') && (t === 'night' || t === 'late')) return true;
    if (userPeaks.has('morning') && t === 'morning') return true;
    if (userPeaks.has('weekends') && t === 'weekend') return true;
    if (userPeaks.has('lunch') && t === 'day') return true;
    if (userPeaks.has('afternoon') && t === 'day') return true;
    return false;
  });
  return match ? 1.0 : 0.25;
}

// ─── Diversity rules ──────────────────────────────────────────────────────────
function applyDiversityRules(ranked) {
  const familyCounts = {};
  const selected = [];
  const remainder = [];

  for (const item of ranked) {
    const family = item.place.experienceFamily;
    familyCounts[family] = (familyCounts[family] || 0) + 1;
    if (familyCounts[family] <= 2) {
      selected.push(item);
    } else {
      remainder.push(item);
    }
    if (selected.length === 10) break;
  }

  // If we couldn't fill 10 with diversity rules, fill from remainder
  for (const item of remainder) {
    if (selected.length >= 10) break;
    selected.push(item);
  }

  return selected.slice(0, 10);
}

// ─── Main export ──────────────────────────────────────────────────────────────
/**
 * Generate Top 10 Spark Picks for a user.
 *
 * @param {object} profile  – Crossd profile (mbti_type, mbti_quiz_results, vibe_tags, hangout_areas)
 * @param {array}  moments  – Real (non-sample) moments
 * @param {string} targetType – Optional: the MBTI type being explored (defaults to best match)
 * @param {object} targetDims – Optional: parsed dims for the target type
 * @returns {array} Top 10 scored venue objects
 */
export function generateCrossdSparkPicks(profile, moments = [], targetType = null, targetDims = null) {
  const myType = profile?.mbti_type;
  const myDims = parseQuizDimensions(myType, profile?.mbti_quiz_results || {});

  // Derive user's PlacesDNA from moments + hangout areas + vibe tags
  const userDNA = new Set();
  moments.forEach(m => getCrossdDNAFromVenueTypes(m.venue_types || []).forEach(d => userDNA.add(d)));
  (profile?.hangout_areas || []).forEach(area => getCrossdDNAFromVenueTypes(area.venue_types || []).forEach(d => userDNA.add(d)));
  const vibeTags = profile?.vibe_tags || [];
  const vibeToDNA = {
    calm_cozy: ['Calm & Cosy'], social_buzzing: ['Social Buzz'], active_energetic: ['Active','Wellness'],
    creative: ['Creative'], romantic: ['Romantic'], nightlife: ['Nightlife'],
    nature_grounded: ['Outdoors'], deep_intellectual: ['Learning & Culture'],
    live_electric: ['Live Events'], intimate_local: ['Calm & Cosy','Foodie'],
  };
  vibeTags.forEach(tag => { if (vibeToDNA[tag]) vibeToDNA[tag].forEach(d => userDNA.add(d)); });

  const peakTags = vibeTags.filter(t => t.startsWith('peak_')).map(t => t.replace('peak_', '').toLowerCase());
  const userPeaks = new Set(peakTags);

  // Determine effective target type for place pool
  const effectiveTargetType = targetType || getPrimaryCompatibleType(myType, myDims) || myType;
  const poolIds = TYPE_POOLS[effectiveTargetType] || TYPE_POOLS[myType] || TYPE_POOLS['ENFP'];

  // Get place objects for this pool
  const catalogue = Object.fromEntries(PLACE_CATALOGUE.map(p => [p.id, p]));
  const pool = poolIds.map(id => catalogue[id]).filter(Boolean);

  // Score each place in the pool
  // When exploring a type: 60% target's profile, 40% user's profile (via dims)
  const effectiveDims = targetDims
    ? {
        E: targetDims.E * 0.6 + myDims.E * 0.4,
        I: targetDims.I * 0.6 + myDims.I * 0.4,
        N: targetDims.N * 0.6 + myDims.N * 0.4,
        S: targetDims.S * 0.6 + myDims.S * 0.4,
        T: targetDims.T * 0.6 + myDims.T * 0.4,
        F: targetDims.F * 0.6 + myDims.F * 0.4,
        J: targetDims.J * 0.6 + myDims.J * 0.4,
        P: targetDims.P * 0.6 + myDims.P * 0.4,
      }
    : myDims;

  const scored = pool.map(place => {
    const personalityScore = scorePlaceAgainstDimensions(place, effectiveDims);
    const dnaScore = scorePlaceAgainstUserDNA(place, userDNA);
    const timingScore = scorePlaceAgainstTiming(place, userPeaks);

    const total = personalityScore * 0.40 + dnaScore * 0.30 + timingScore * 0.30;

    return {
      place,
      personalityScore,
      dnaScore,
      timingScore,
      total,
    };
  });

  // Sort descending
  scored.sort((a, b) => b.total - a.total);

  // Apply diversity rules
  const selected = applyDiversityRules(scored);

  // Shape output to match TopPicksCard's expected format
  return selected.map(({ place, personalityScore, dnaScore, timingScore, total }) => ({
    label: place.label,
    icon: place.icon,
    why: place.why,
    dna: place.dna,
    bestTimes: place.bestTimes,
    googleTypes: place.googleTypes,
    score: Math.min(0.94, Math.max(0.50, total)),
    mbtiScore: personalityScore,
    placesScore: dnaScore,
    timeScore: timingScore,
  }));
}