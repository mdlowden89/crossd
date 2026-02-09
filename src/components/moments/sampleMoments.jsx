export const generateSampleMoments = () => {
  const baseDate = new Date(2026, 1, 9); // Feb 9, 2026

  return [
    {
      id: 'sample-1',
      user_id: 'sample',
      venue_name: 'Covent Garden',
      lat: 51.3130,
      lng: -0.1233,
      geohash: 'u10hkq',
      tile_key: 'u10hkq',
      time_bucket: '2026-02-04-10',
      created_date: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      privacy_level: 'approximate',
      note: 'Watching the street performers. Someone next to me had the most infectious laugh.',
      nearby_spark_count: 0
    },
    {
      id: 'sample-2',
      user_id: 'sample',
      venue_name: 'The Shard',
      lat: 51.5045,
      lng: -0.0865,
      geohash: 'u10j5n',
      tile_key: 'u10j5n',
      time_bucket: '2026-02-03-10',
      created_date: new Date(baseDate.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      privacy_level: 'approximate',
      note: 'The view was incredible, and I noticed someone with a great sense of style near the window.',
      nearby_spark_count: 1
    },
    {
      id: 'sample-3',
      user_id: 'sample',
      venue_name: 'Tower of London',
      lat: 51.5055,
      lng: -0.0754,
      geohash: 'u10j5q',
      tile_key: 'u10j5q',
      time_bucket: '2026-02-02-07',
      created_date: new Date(baseDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      privacy_level: 'approximate',
      note: 'Fascinating history. Saw someone else who seemed just as captivated by the Crown Jewels.',
      nearby_spark_count: 2
    },
    {
      id: 'sample-4',
      user_id: 'sample',
      venue_name: 'British Museum',
      lat: 51.5194,
      lng: -0.1270,
      geohash: 'u10h9u',
      tile_key: 'u10h9u',
      time_bucket: '2026-02-01-12',
      created_date: new Date(baseDate.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      privacy_level: 'approximate',
      note: 'Lost in the Egyptian exhibit. There was a quiet intensity about someone sketching near the Rosetta Stone.',
      nearby_spark_count: 1
    },
    {
      id: 'sample-5',
      user_id: 'sample',
      venue_name: 'Tate Modern',
      lat: 51.5076,
      lng: -0.0994,
      geohash: 'u10j4u',
      tile_key: 'u10j4u',
      time_bucket: '2026-01-31-06',
      created_date: new Date(baseDate.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      privacy_level: 'approximate',
      note: 'The abstract art was moving. I shared a smile with someone who was also staring at a Rothko painting.',
      nearby_spark_count: 0
    },
    {
      id: 'sample-6',
      user_id: 'sample',
      venue_name: 'Borough Market',
      lat: 51.5052,
      lng: -0.0971,
      geohash: 'u10j4y',
      tile_key: 'u10j4y',
      time_bucket: '2026-01-30-19',
      created_date: new Date(baseDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      privacy_level: 'approximate',
      note: 'The energy was amazing! So many great smells. Laughed with a stranger over a ridiculously large cheese wheel.',
      nearby_spark_count: 3
    },
    {
      id: 'sample-7',
      user_id: 'sample',
      venue_name: 'Buckingham Palace',
      lat: 51.5007,
      lng: -0.1415,
      geohash: 'u10h8e',
      tile_key: 'u10h8e',
      time_bucket: '2026-01-29-09',
      created_date: new Date(baseDate.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString(),
      privacy_level: 'approximate',
      note: 'Classic tourist moment. Saw someone else looking just as impressed by the guards.',
      nearby_spark_count: 0
    },
    {
      id: 'sample-8',
      user_id: 'sample',
      venue_name: 'Montclair Art Museum',
      lat: 40.8207,
      lng: -74.2099,
      geohash: 'dr5rtu',
      tile_key: 'dr5rtu',
      time_bucket: '2026-01-27-09',
      created_date: new Date(baseDate.getTime() - 13 * 24 * 60 * 60 * 1000).toISOString(),
      privacy_level: 'approximate',
      note: 'The modern art wing was particularly striking today.',
      nearby_spark_count: 1
    }
  ];
};