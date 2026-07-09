/**
 * Google Places → Crossd PlacesDNA Mapper
 * Full taxonomy mapping Google Places API types to Crossd DNA categories,
 * with MBTI personality pull weights and scoring rules.
 */

// ─── Crossd PlacesDNA Categories ─────────────────────────────────────────────
export const CROSSD_DNA = [
  "Calm & Cosy",
  "Creative",
  "Live Events",
  "Romantic",
  "Active",
  "Social Buzz",
  "Foodie",
  "Nightlife",
  "Outdoors",
  "Wellness",
  "Learning & Culture",
  "Shopping",
  "Premium Lifestyle",
  "Travel & Stays",
  "Work & Ambition",
  "Everyday Routine",
  "Spiritual & Reflective",
  "Low Spark Utility",
];

// ─── DNA Weights for scoring (how "sparkable" each category is) ───────────────
export const DNA_WEIGHTS = {
  "Calm & Cosy": 1.0,
  "Creative": 1.0,
  "Live Events": 1.0,
  "Romantic": 1.0,
  "Active": 1.0,
  "Social Buzz": 1.0,
  "Foodie": 0.9,
  "Nightlife": 0.9,
  "Outdoors": 0.9,
  "Wellness": 0.85,
  "Learning & Culture": 0.85,
  "Shopping": 0.7,
  "Premium Lifestyle": 0.7,
  "Travel & Stays": 0.55,
  "Work & Ambition": 0.45,
  "Everyday Routine": 0.35,
  "Spiritual & Reflective": 0.35,
  "Low Spark Utility": 0.05,
};

// ─── MBTI personality pull per DNA category ───────────────────────────────────
export const DNA_PERSONALITY_PULL = {
  "Calm & Cosy":        ["INTJ","INFJ","INFP","INTP","ENFP","ISFJ","ISTJ"],
  "Creative":           ["ISFP","INFP","ENFP","INFJ","INTJ","ENTP","ENFJ"],
  "Live Events":        ["ENFP","ESFP","ENTP","ISFP","ENFJ","ESTP","ENTJ"],
  "Romantic":           ["INFJ","ENFJ","INFP","ENFP","INTJ","ISFJ","ESFJ"],
  "Active":             ["ESTP","ENTJ","ISTP","ESTJ","ESFP","ISFP","ENTP"],
  "Social Buzz":        ["ESFP","ESTP","ENFP","ESFJ","ESTJ","ENTP","ENFJ"],
  "Foodie":             ["ESFJ","ENFJ","ISFJ","ESFP","ENTJ","ISFP","ENFP"],
  "Nightlife":          ["ESFP","ESTP","ENTP","ENFP","ESFJ","ENTJ"],
  "Outdoors":           ["ISFP","INFP","INFJ","ENFP","ISTP","ISTJ","ESTJ"],
  "Wellness":           ["INFJ","INFP","ISFP","ENFJ","ISFJ","INTJ","ISTJ"],
  "Learning & Culture": ["INTJ","INTP","INFJ","INFP","ENFP","ENTP","ISTJ"],
  "Shopping":           ["ESFJ","ESFP","ESTP","ENFP","ESTJ"],
  "Premium Lifestyle":  ["ENTJ","INTJ","ENFJ","ESFJ","ESTJ","ENTP"],
  "Travel & Stays":     ["ENFP","ENTP","ESTP","ESFP","INFP","ISFP"],
  "Work & Ambition":    ["ENTJ","INTJ","ESTJ","ENTP","ISTJ","INTP"],
  "Everyday Routine":   ["ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ESTP"],
  "Spiritual & Reflective": ["INFJ","INFP","ENFJ","ISFJ","INTJ"],
  "Low Spark Utility":  [],
};

// ─── Full Google Places → Crossd DNA mapping ─────────────────────────────────
export const GOOGLE_PLACES_TO_CROSSD_DNA = {
  // AUTOMOTIVE
  car_dealer: ["Low Spark Utility"],
  car_rental: ["Low Spark Utility","Travel & Stays"],
  car_repair: ["Low Spark Utility"],
  car_wash: ["Low Spark Utility"],
  ebike_charging_station: ["Low Spark Utility","Active"],
  electric_vehicle_charging_station: ["Low Spark Utility"],
  gas_station: ["Low Spark Utility"],
  parking: ["Low Spark Utility"],
  parking_garage: ["Low Spark Utility"],
  parking_lot: ["Low Spark Utility"],
  rest_stop: ["Low Spark Utility","Travel & Stays"],
  tire_shop: ["Low Spark Utility"],
  truck_dealer: ["Low Spark Utility"],

  // BUSINESS
  business_center: ["Work & Ambition"],
  corporate_office: ["Work & Ambition"],
  coworking_space: ["Work & Ambition","Social Buzz","Calm & Cosy"],
  farm: ["Outdoors","Foodie"],
  manufacturer: ["Low Spark Utility","Work & Ambition"],
  ranch: ["Outdoors","Active"],
  supplier: ["Low Spark Utility","Work & Ambition"],
  television_studio: ["Creative","Work & Ambition"],

  // CULTURE
  art_gallery: ["Creative","Learning & Culture","Romantic"],
  art_museum: ["Creative","Learning & Culture"],
  art_studio: ["Creative","Calm & Cosy"],
  auditorium: ["Live Events","Learning & Culture"],
  castle: ["Learning & Culture","Romantic","Outdoors"],
  cultural_landmark: ["Learning & Culture","Creative"],
  fountain: ["Outdoors","Romantic"],
  historical_place: ["Learning & Culture","Outdoors"],
  history_museum: ["Learning & Culture"],
  monument: ["Learning & Culture","Outdoors"],
  museum: ["Learning & Culture","Creative"],
  performing_arts_theater: ["Live Events","Creative","Romantic"],
  sculpture: ["Creative","Outdoors"],

  // EDUCATION
  academic_department: ["Learning & Culture","Work & Ambition"],
  educational_institution: ["Learning & Culture"],
  library: ["Calm & Cosy","Learning & Culture"],
  preschool: ["Low Spark Utility"],
  primary_school: ["Low Spark Utility"],
  research_institute: ["Learning & Culture","Work & Ambition"],
  school: ["Low Spark Utility","Learning & Culture"],
  secondary_school: ["Low Spark Utility"],
  university: ["Learning & Culture","Social Buzz","Work & Ambition"],

  // ENTERTAINMENT & RECREATION
  adventure_sports_center: ["Active","Social Buzz","Outdoors"],
  amphitheatre: ["Live Events","Creative","Outdoors"],
  amusement_center: ["Social Buzz","Active"],
  amusement_park: ["Social Buzz","Active"],
  aquarium: ["Learning & Culture","Romantic","Calm & Cosy"],
  banquet_hall: ["Live Events","Social Buzz","Romantic"],
  barbecue_area: ["Foodie","Outdoors","Social Buzz"],
  botanical_garden: ["Outdoors","Romantic","Calm & Cosy"],
  bowling_alley: ["Active","Social Buzz"],
  casino: ["Nightlife","Social Buzz","Premium Lifestyle"],
  childrens_camp: ["Low Spark Utility","Outdoors"],
  city_park: ["Outdoors","Calm & Cosy","Active"],
  comedy_club: ["Live Events","Nightlife","Social Buzz"],
  community_center: ["Social Buzz","Learning & Culture"],
  concert_hall: ["Live Events","Creative","Romantic"],
  convention_center: ["Work & Ambition","Social Buzz","Live Events"],
  cultural_center: ["Learning & Culture","Creative","Social Buzz"],
  cycling_park: ["Active","Outdoors"],
  dance_hall: ["Nightlife","Live Events","Social Buzz"],
  dog_park: ["Outdoors","Social Buzz","Calm & Cosy"],
  event_venue: ["Live Events","Social Buzz","Romantic"],
  ferris_wheel: ["Romantic","Social Buzz","Outdoors"],
  garden: ["Outdoors","Calm & Cosy","Romantic"],
  go_karting_venue: ["Active","Social Buzz"],
  hiking_area: ["Outdoors","Active","Wellness"],
  historical_landmark: ["Learning & Culture","Outdoors"],
  indoor_playground: ["Low Spark Utility"],
  internet_cafe: ["Calm & Cosy","Work & Ambition","Social Buzz"],
  karaoke: ["Nightlife","Social Buzz","Live Events"],
  live_music_venue: ["Live Events","Nightlife","Creative"],
  marina: ["Outdoors","Romantic","Premium Lifestyle"],
  miniature_golf_course: ["Active","Social Buzz"],
  movie_rental: ["Low Spark Utility"],
  movie_theater: ["Creative","Romantic","Social Buzz"],
  national_park: ["Outdoors","Active","Wellness"],
  night_club: ["Nightlife","Social Buzz","Live Events"],
  observation_deck: ["Romantic","Outdoors","Premium Lifestyle"],
  off_roading_area: ["Active","Outdoors"],
  opera_house: ["Live Events","Creative","Premium Lifestyle","Romantic"],
  paintball_center: ["Active","Social Buzz"],
  park: ["Outdoors","Calm & Cosy","Active"],
  philharmonic_hall: ["Live Events","Creative","Premium Lifestyle"],
  picnic_ground: ["Outdoors","Romantic","Calm & Cosy"],
  planetarium: ["Learning & Culture","Romantic","Creative"],
  plaza: ["Social Buzz","Outdoors"],
  roller_coaster: ["Active","Social Buzz"],
  skateboard_park: ["Active","Outdoors","Social Buzz"],
  state_park: ["Outdoors","Active","Wellness"],
  tourist_attraction: ["Learning & Culture","Outdoors","Social Buzz"],
  video_arcade: ["Social Buzz","Active"],
  vineyard: ["Romantic","Foodie","Premium Lifestyle","Outdoors"],
  visitor_center: ["Travel & Stays","Learning & Culture"],
  water_park: ["Active","Social Buzz"],
  wedding_venue: ["Romantic","Premium Lifestyle","Live Events"],
  wildlife_park: ["Outdoors","Learning & Culture"],
  wildlife_refuge: ["Outdoors","Calm & Cosy","Wellness"],
  zoo: ["Outdoors","Learning & Culture","Social Buzz"],

  // FACILITIES
  public_bath: ["Wellness","Low Spark Utility"],
  public_bathroom: ["Low Spark Utility"],
  stable: ["Outdoors","Active"],

  // FINANCE
  accounting: ["Low Spark Utility","Work & Ambition"],
  atm: ["Low Spark Utility"],
  bank: ["Low Spark Utility"],

  // FOOD & DRINK — GENERAL
  restaurant: ["Foodie","Social Buzz"],
  cafe: ["Calm & Cosy","Foodie","Social Buzz"],
  coffee_shop: ["Calm & Cosy","Foodie"],
  coffee_stand: ["Everyday Routine","Foodie"],
  coffee_roastery: ["Calm & Cosy","Creative","Foodie"],
  tea_house: ["Calm & Cosy","Romantic","Foodie"],
  bakery: ["Calm & Cosy","Foodie"],
  bagel_shop: ["Everyday Routine","Foodie"],
  brunch_restaurant: ["Foodie","Social Buzz","Romantic"],
  breakfast_restaurant: ["Foodie","Everyday Routine"],
  diner: ["Foodie","Calm & Cosy"],
  bistro: ["Foodie","Romantic","Calm & Cosy"],
  fine_dining_restaurant: ["Romantic","Premium Lifestyle","Foodie"],
  family_restaurant: ["Foodie","Everyday Routine"],
  fast_food_restaurant: ["Everyday Routine","Foodie"],
  food_court: ["Foodie","Social Buzz","Everyday Routine"],
  cafeteria: ["Everyday Routine","Foodie"],
  meal_delivery: ["Low Spark Utility"],
  meal_takeaway: ["Everyday Routine","Foodie"],

  // FOOD & DRINK — BARS / NIGHTLIFE
  bar: ["Nightlife","Social Buzz","Romantic"],
  cocktail_bar: ["Nightlife","Romantic","Premium Lifestyle"],
  wine_bar: ["Romantic","Calm & Cosy","Premium Lifestyle"],
  pub: ["Social Buzz","Nightlife","Foodie"],
  irish_pub: ["Social Buzz","Nightlife"],
  sports_bar: ["Nightlife","Social Buzz","Active"],
  lounge_bar: ["Nightlife","Romantic","Premium Lifestyle"],
  beer_garden: ["Social Buzz","Outdoors","Foodie"],
  brewery: ["Foodie","Social Buzz","Creative"],
  brewpub: ["Foodie","Social Buzz","Nightlife"],
  gastropub: ["Foodie","Social Buzz","Nightlife"],
  hookah_bar: ["Nightlife","Social Buzz"],

  // FOOD & DRINK — SWEET / LIGHT
  acai_shop: ["Wellness","Foodie"],
  cake_shop: ["Foodie","Romantic"],
  candy_store: ["Foodie","Social Buzz"],
  chocolate_factory: ["Foodie","Creative"],
  chocolate_shop: ["Foodie","Romantic"],
  confectionery: ["Foodie"],
  dessert_restaurant: ["Foodie","Romantic"],
  dessert_shop: ["Foodie","Romantic"],
  donut_shop: ["Foodie","Everyday Routine"],
  ice_cream_shop: ["Foodie","Social Buzz","Romantic"],
  juice_shop: ["Wellness","Foodie"],
  pastry_shop: ["Foodie","Calm & Cosy"],
  snack_bar: ["Everyday Routine","Foodie"],

  // FOOD & DRINK — RESTAURANT CUISINES
  afghani_restaurant: ["Foodie","Learning & Culture"],
  african_restaurant: ["Foodie","Learning & Culture"],
  american_restaurant: ["Foodie","Social Buzz"],
  argentinian_restaurant: ["Foodie","Romantic"],
  asian_fusion_restaurant: ["Foodie","Creative"],
  asian_restaurant: ["Foodie","Learning & Culture"],
  australian_restaurant: ["Foodie","Social Buzz"],
  austrian_restaurant: ["Foodie","Learning & Culture"],
  bangladeshi_restaurant: ["Foodie","Learning & Culture"],
  barbecue_restaurant: ["Foodie","Social Buzz"],
  basque_restaurant: ["Foodie","Learning & Culture"],
  bavarian_restaurant: ["Foodie","Learning & Culture"],
  belgian_restaurant: ["Foodie","Learning & Culture"],
  brazilian_restaurant: ["Foodie","Social Buzz"],
  british_restaurant: ["Foodie","Everyday Routine"],
  buffet_restaurant: ["Foodie","Social Buzz"],
  burmese_restaurant: ["Foodie","Learning & Culture"],
  burrito_restaurant: ["Foodie","Everyday Routine"],
  cajun_restaurant: ["Foodie","Social Buzz"],
  californian_restaurant: ["Foodie","Wellness"],
  cambodian_restaurant: ["Foodie","Learning & Culture"],
  cantonese_restaurant: ["Foodie","Learning & Culture"],
  caribbean_restaurant: ["Foodie","Social Buzz"],
  cat_cafe: ["Calm & Cosy","Foodie","Social Buzz"],
  chicken_restaurant: ["Foodie","Everyday Routine"],
  chicken_wings_restaurant: ["Foodie","Social Buzz"],
  chilean_restaurant: ["Foodie","Learning & Culture"],
  chinese_noodle_restaurant: ["Foodie","Learning & Culture"],
  chinese_restaurant: ["Foodie","Learning & Culture"],
  colombian_restaurant: ["Foodie","Learning & Culture"],
  croatian_restaurant: ["Foodie","Learning & Culture"],
  cuban_restaurant: ["Foodie","Social Buzz"],
  czech_restaurant: ["Foodie","Learning & Culture"],
  danish_restaurant: ["Foodie","Learning & Culture"],
  deli: ["Foodie","Everyday Routine"],
  dim_sum_restaurant: ["Foodie","Social Buzz"],
  dog_cafe: ["Calm & Cosy","Foodie","Social Buzz"],
  dumpling_restaurant: ["Foodie","Learning & Culture"],
  dutch_restaurant: ["Foodie","Learning & Culture"],
  eastern_european_restaurant: ["Foodie","Learning & Culture"],
  ethiopian_restaurant: ["Foodie","Learning & Culture"],
  european_restaurant: ["Foodie","Romantic"],
  falafel_restaurant: ["Foodie","Everyday Routine"],
  filipino_restaurant: ["Foodie","Learning & Culture"],
  fish_and_chips_restaurant: ["Foodie","Everyday Routine"],
  fondue_restaurant: ["Foodie","Romantic","Social Buzz"],
  french_restaurant: ["Foodie","Romantic","Premium Lifestyle"],
  fusion_restaurant: ["Foodie","Creative"],
  german_restaurant: ["Foodie","Social Buzz"],
  greek_restaurant: ["Foodie","Social Buzz"],
  gyro_restaurant: ["Foodie","Everyday Routine"],
  halal_restaurant: ["Foodie","Everyday Routine"],
  hamburger_restaurant: ["Foodie","Everyday Routine"],
  hawaiian_restaurant: ["Foodie","Social Buzz"],
  hot_dog_restaurant: ["Foodie","Everyday Routine"],
  hot_dog_stand: ["Foodie","Everyday Routine"],
  hot_pot_restaurant: ["Foodie","Social Buzz"],
  hungarian_restaurant: ["Foodie","Learning & Culture"],
  indian_restaurant: ["Foodie","Learning & Culture"],
  indonesian_restaurant: ["Foodie","Learning & Culture"],
  irish_restaurant: ["Foodie","Social Buzz"],
  israeli_restaurant: ["Foodie","Learning & Culture"],
  italian_restaurant: ["Foodie","Romantic"],
  japanese_curry_restaurant: ["Foodie","Learning & Culture"],
  japanese_izakaya_restaurant: ["Foodie","Nightlife","Social Buzz"],
  japanese_restaurant: ["Foodie","Learning & Culture"],
  kebab_shop: ["Foodie","Everyday Routine"],
  korean_barbecue_restaurant: ["Foodie","Social Buzz"],
  korean_restaurant: ["Foodie","Learning & Culture"],
  latin_american_restaurant: ["Foodie","Social Buzz"],
  lebanese_restaurant: ["Foodie","Learning & Culture"],
  malaysian_restaurant: ["Foodie","Learning & Culture"],
  mediterranean_restaurant: ["Foodie","Romantic"],
  mexican_restaurant: ["Foodie","Social Buzz"],
  middle_eastern_restaurant: ["Foodie","Learning & Culture"],
  mongolian_barbecue_restaurant: ["Foodie","Social Buzz"],
  moroccan_restaurant: ["Foodie","Romantic","Learning & Culture"],
  noodle_shop: ["Foodie","Everyday Routine"],
  north_indian_restaurant: ["Foodie","Learning & Culture"],
  oyster_bar_restaurant: ["Foodie","Romantic","Premium Lifestyle"],
  pakistani_restaurant: ["Foodie","Learning & Culture"],
  persian_restaurant: ["Foodie","Learning & Culture"],
  peruvian_restaurant: ["Foodie","Learning & Culture"],
  pizza_delivery: ["Low Spark Utility","Foodie"],
  pizza_restaurant: ["Foodie","Social Buzz"],
  polish_restaurant: ["Foodie","Learning & Culture"],
  portuguese_restaurant: ["Foodie","Learning & Culture"],
  ramen_restaurant: ["Foodie","Calm & Cosy"],
  romanian_restaurant: ["Foodie","Learning & Culture"],
  russian_restaurant: ["Foodie","Learning & Culture"],
  salad_shop: ["Wellness","Foodie"],
  sandwich_shop: ["Foodie","Everyday Routine"],
  scandinavian_restaurant: ["Foodie","Learning & Culture"],
  seafood_restaurant: ["Foodie","Romantic"],
  shawarma_restaurant: ["Foodie","Everyday Routine"],
  soul_food_restaurant: ["Foodie","Social Buzz"],
  soup_restaurant: ["Foodie","Calm & Cosy"],
  south_american_restaurant: ["Foodie","Learning & Culture"],
  south_indian_restaurant: ["Foodie","Learning & Culture"],
  southwestern_us_restaurant: ["Foodie","Social Buzz"],
  spanish_restaurant: ["Foodie","Romantic","Social Buzz"],
  sri_lankan_restaurant: ["Foodie","Learning & Culture"],
  steak_house: ["Foodie","Romantic","Premium Lifestyle"],
  sushi_restaurant: ["Foodie","Romantic"],
  swiss_restaurant: ["Foodie","Learning & Culture"],
  taco_restaurant: ["Foodie","Everyday Routine"],
  taiwanese_restaurant: ["Foodie","Learning & Culture"],
  tapas_restaurant: ["Foodie","Romantic","Social Buzz"],
  tex_mex_restaurant: ["Foodie","Social Buzz"],
  thai_restaurant: ["Foodie","Learning & Culture"],
  tibetan_restaurant: ["Foodie","Learning & Culture"],
  tonkatsu_restaurant: ["Foodie","Learning & Culture"],
  turkish_restaurant: ["Foodie","Learning & Culture"],
  ukrainian_restaurant: ["Foodie","Learning & Culture"],
  vegan_restaurant: ["Wellness","Foodie"],
  vegetarian_restaurant: ["Wellness","Foodie"],
  vietnamese_restaurant: ["Foodie","Learning & Culture"],
  western_restaurant: ["Foodie","Everyday Routine"],
  winery: ["Romantic","Foodie","Premium Lifestyle"],
  yakiniku_restaurant: ["Foodie","Social Buzz"],
  yakitori_restaurant: ["Foodie","Social Buzz"],

  // GEO / ADMIN
  administrative_area_level_1: ["Low Spark Utility"],
  administrative_area_level_2: ["Low Spark Utility"],
  country: ["Low Spark Utility"],
  locality: ["Low Spark Utility"],
  postal_code: ["Low Spark Utility"],
  school_district: ["Low Spark Utility"],

  // GOVERNMENT
  city_hall: ["Low Spark Utility"],
  courthouse: ["Low Spark Utility"],
  embassy: ["Low Spark Utility","Travel & Stays"],
  fire_station: ["Low Spark Utility"],
  government_office: ["Low Spark Utility"],
  local_government_office: ["Low Spark Utility"],
  neighborhood_police_station: ["Low Spark Utility"],
  police: ["Low Spark Utility"],
  post_office: ["Low Spark Utility"],

  // HEALTH & WELLNESS
  chiropractor: ["Wellness","Low Spark Utility"],
  dental_clinic: ["Low Spark Utility"],
  dentist: ["Low Spark Utility"],
  doctor: ["Low Spark Utility"],
  drugstore: ["Everyday Routine","Low Spark Utility"],
  general_hospital: ["Low Spark Utility"],
  hospital: ["Low Spark Utility"],
  massage: ["Wellness","Calm & Cosy"],
  massage_spa: ["Wellness","Calm & Cosy","Premium Lifestyle"],
  medical_center: ["Low Spark Utility"],
  medical_clinic: ["Low Spark Utility"],
  medical_lab: ["Low Spark Utility"],
  pharmacy: ["Everyday Routine","Low Spark Utility"],
  physiotherapist: ["Wellness","Low Spark Utility"],
  sauna: ["Wellness","Calm & Cosy"],
  skin_care_clinic: ["Wellness","Premium Lifestyle"],
  spa: ["Wellness","Calm & Cosy","Premium Lifestyle"],
  tanning_studio: ["Wellness","Premium Lifestyle"],
  wellness_center: ["Wellness","Calm & Cosy"],
  yoga_studio: ["Wellness","Calm & Cosy","Active"],

  // HOUSING
  apartment_building: ["Low Spark Utility"],
  apartment_complex: ["Low Spark Utility"],
  condominium_complex: ["Low Spark Utility"],
  housing_complex: ["Low Spark Utility"],

  // LODGING
  bed_and_breakfast: ["Travel & Stays","Romantic","Calm & Cosy"],
  budget_japanese_inn: ["Travel & Stays","Learning & Culture"],
  campground: ["Travel & Stays","Outdoors","Active"],
  camping_cabin: ["Travel & Stays","Outdoors","Calm & Cosy"],
  cottage: ["Travel & Stays","Romantic","Calm & Cosy"],
  extended_stay_hotel: ["Travel & Stays"],
  farmstay: ["Travel & Stays","Outdoors","Calm & Cosy"],
  guest_house: ["Travel & Stays","Calm & Cosy"],
  hostel: ["Travel & Stays","Social Buzz"],
  hotel: ["Travel & Stays","Premium Lifestyle"],
  inn: ["Travel & Stays","Calm & Cosy"],
  japanese_inn: ["Travel & Stays","Learning & Culture","Calm & Cosy"],
  lodging: ["Travel & Stays"],
  mobile_home_park: ["Travel & Stays"],
  motel: ["Travel & Stays"],
  private_guest_room: ["Travel & Stays","Calm & Cosy"],
  resort_hotel: ["Travel & Stays","Premium Lifestyle","Romantic"],
  rv_park: ["Travel & Stays","Outdoors"],

  // NATURAL FEATURES
  beach: ["Outdoors","Romantic","Wellness"],
  island: ["Outdoors","Travel & Stays","Romantic"],
  lake: ["Outdoors","Calm & Cosy","Romantic"],
  mountain_peak: ["Outdoors","Active","Wellness"],
  nature_preserve: ["Outdoors","Wellness","Calm & Cosy"],
  river: ["Outdoors","Calm & Cosy"],
  scenic_spot: ["Outdoors","Romantic","Creative"],
  woods: ["Outdoors","Wellness","Calm & Cosy"],

  // PLACES OF WORSHIP
  buddhist_temple: ["Spiritual & Reflective","Learning & Culture","Calm & Cosy"],
  church: ["Spiritual & Reflective","Learning & Culture"],
  hindu_temple: ["Spiritual & Reflective","Learning & Culture"],
  mosque: ["Spiritual & Reflective","Learning & Culture"],
  shinto_shrine: ["Spiritual & Reflective","Learning & Culture"],
  synagogue: ["Spiritual & Reflective","Learning & Culture"],

  // SERVICES
  aircraft_rental_service: ["Low Spark Utility","Travel & Stays"],
  association_or_organization: ["Work & Ambition","Social Buzz"],
  astrologer: ["Spiritual & Reflective"],
  barber_shop: ["Everyday Routine","Social Buzz"],
  beautician: ["Wellness","Premium Lifestyle"],
  beauty_salon: ["Wellness","Premium Lifestyle"],
  body_art_service: ["Creative","Premium Lifestyle"],
  catering_service: ["Foodie","Low Spark Utility"],
  cemetery: ["Spiritual & Reflective","Low Spark Utility"],
  chauffeur_service: ["Travel & Stays","Premium Lifestyle"],
  child_care_agency: ["Low Spark Utility"],
  consultant: ["Work & Ambition"],
  courier_service: ["Low Spark Utility"],
  electrician: ["Low Spark Utility"],
  employment_agency: ["Work & Ambition"],
  florist: ["Romantic","Creative","Everyday Routine"],
  food_delivery: ["Low Spark Utility","Foodie"],
  foot_care: ["Wellness","Low Spark Utility"],
  funeral_home: ["Low Spark Utility"],
  hair_care: ["Wellness","Premium Lifestyle"],
  hair_salon: ["Wellness","Premium Lifestyle","Social Buzz"],
  insurance_agency: ["Low Spark Utility"],
  laundry: ["Low Spark Utility","Everyday Routine"],
  lawyer: ["Low Spark Utility","Work & Ambition"],
  locksmith: ["Low Spark Utility"],
  makeup_artist: ["Creative","Premium Lifestyle"],
  marketing_consultant: ["Work & Ambition","Creative"],
  moving_company: ["Low Spark Utility"],
  nail_salon: ["Wellness","Premium Lifestyle","Social Buzz"],
  non_profit_organization: ["Work & Ambition","Spiritual & Reflective"],
  painter: ["Creative","Low Spark Utility"],
  pet_boarding_service: ["Low Spark Utility"],
  pet_care: ["Everyday Routine","Low Spark Utility"],
  plumber: ["Low Spark Utility"],
  psychic: ["Spiritual & Reflective"],
  real_estate_agency: ["Low Spark Utility","Work & Ambition"],
  roofing_contractor: ["Low Spark Utility"],
  service: ["Low Spark Utility"],
  shipping_service: ["Low Spark Utility"],
  storage: ["Low Spark Utility"],
  summer_camp_organizer: ["Outdoors","Low Spark Utility"],
  tailor: ["Premium Lifestyle","Everyday Routine"],
  telecommunications_service_provider: ["Low Spark Utility"],
  tour_agency: ["Travel & Stays"],
  tourist_information_center: ["Travel & Stays","Learning & Culture"],
  travel_agency: ["Travel & Stays"],
  veterinary_care: ["Low Spark Utility","Wellness"],

  // SHOPPING
  asian_grocery_store: ["Foodie","Everyday Routine","Learning & Culture"],
  auto_parts_store: ["Low Spark Utility"],
  bicycle_store: ["Active","Everyday Routine"],
  book_store: ["Calm & Cosy","Learning & Culture","Creative"],
  building_materials_store: ["Low Spark Utility"],
  butcher_shop: ["Foodie","Everyday Routine"],
  cell_phone_store: ["Low Spark Utility","Everyday Routine"],
  clothing_store: ["Premium Lifestyle","Shopping","Social Buzz"],
  convenience_store: ["Everyday Routine","Low Spark Utility"],
  cosmetics_store: ["Premium Lifestyle","Wellness","Shopping"],
  department_store: ["Shopping","Social Buzz","Premium Lifestyle"],
  discount_store: ["Everyday Routine"],
  discount_supermarket: ["Everyday Routine","Foodie"],
  electronics_store: ["Everyday Routine","Creative"],
  farmers_market: ["Foodie","Outdoors","Social Buzz"],
  flea_market: ["Creative","Social Buzz","Foodie","Shopping"],
  food_store: ["Foodie","Everyday Routine"],
  furniture_store: ["Premium Lifestyle","Creative"],
  garden_center: ["Outdoors","Calm & Cosy","Everyday Routine"],
  general_store: ["Everyday Routine"],
  gift_shop: ["Creative","Romantic","Everyday Routine","Shopping"],
  grocery_store: ["Everyday Routine","Foodie"],
  hardware_store: ["Low Spark Utility"],
  health_food_store: ["Wellness","Foodie"],
  home_goods_store: ["Premium Lifestyle","Everyday Routine"],
  home_improvement_store: ["Low Spark Utility"],
  hypermarket: ["Everyday Routine"],
  jewelry_store: ["Romantic","Premium Lifestyle","Shopping"],
  liquor_store: ["Nightlife","Everyday Routine"],
  market: ["Foodie","Social Buzz","Everyday Routine"],
  pet_store: ["Everyday Routine","Social Buzz"],
  shoe_store: ["Premium Lifestyle","Everyday Routine","Shopping"],
  shopping_mall: ["Shopping","Social Buzz","Premium Lifestyle"],
  sporting_goods_store: ["Active","Everyday Routine"],
  sportswear_store: ["Active","Premium Lifestyle","Shopping"],
  store: ["Everyday Routine"],
  supermarket: ["Everyday Routine","Foodie"],
  tea_store: ["Calm & Cosy","Foodie"],
  thrift_store: ["Creative","Everyday Routine","Social Buzz","Shopping"],
  toy_store: ["Everyday Routine","Social Buzz"],
  warehouse_store: ["Everyday Routine"],
  wholesaler: ["Low Spark Utility"],
  womens_clothing_store: ["Premium Lifestyle","Shopping"],

  // SPORTS
  arena: ["Live Events","Active","Social Buzz"],
  athletic_field: ["Active","Outdoors"],
  fishing_charter: ["Outdoors","Active","Travel & Stays"],
  fishing_pier: ["Outdoors","Calm & Cosy"],
  fishing_pond: ["Outdoors","Calm & Cosy"],
  fitness_center: ["Active","Wellness"],
  golf_course: ["Active","Outdoors","Premium Lifestyle"],
  gym: ["Active","Wellness"],
  ice_skating_rink: ["Active","Romantic","Social Buzz"],
  indoor_golf_course: ["Active","Premium Lifestyle"],
  playground: ["Low Spark Utility","Outdoors"],
  race_course: ["Active","Social Buzz","Live Events"],
  ski_resort: ["Active","Travel & Stays","Premium Lifestyle"],
  sports_activity_location: ["Active","Social Buzz"],
  sports_club: ["Active","Social Buzz","Wellness"],
  sports_coaching: ["Active","Work & Ambition"],
  sports_complex: ["Active","Social Buzz"],
  sports_school: ["Active","Learning & Culture"],
  stadium: ["Live Events","Active","Social Buzz"],
  swimming_pool: ["Active","Wellness"],
  tennis_court: ["Active","Premium Lifestyle"],

  // TRANSPORTATION
  airport: ["Travel & Stays","Low Spark Utility"],
  airstrip: ["Travel & Stays","Low Spark Utility"],
  bike_sharing_station: ["Active","Low Spark Utility"],
  bridge: ["Outdoors","Low Spark Utility"],
  bus_station: ["Low Spark Utility","Travel & Stays"],
  bus_stop: ["Low Spark Utility"],
  ferry_service: ["Travel & Stays","Outdoors"],
  ferry_terminal: ["Travel & Stays","Outdoors"],
  heliport: ["Travel & Stays","Premium Lifestyle"],
  international_airport: ["Travel & Stays"],
  light_rail_station: ["Low Spark Utility","Travel & Stays"],
  park_and_ride: ["Low Spark Utility"],
  subway_station: ["Low Spark Utility","Travel & Stays"],
  taxi_service: ["Low Spark Utility"],
  taxi_stand: ["Low Spark Utility"],
  toll_station: ["Low Spark Utility"],
  train_station: ["Travel & Stays","Low Spark Utility"],
  train_ticket_office: ["Travel & Stays","Low Spark Utility"],
  tram_stop: ["Low Spark Utility"],
  transit_depot: ["Low Spark Utility"],
  transit_station: ["Travel & Stays","Low Spark Utility"],
  transit_stop: ["Low Spark Utility"],
  transportation_service: ["Travel & Stays","Low Spark Utility"],
  truck_stop: ["Travel & Stays","Low Spark Utility"],

  // TABLE B FALLBACKS
  establishment: ["Everyday Routine"],
  finance: ["Low Spark Utility"],
  food: ["Foodie"],
  general_contractor: ["Low Spark Utility"],
  geocode: ["Low Spark Utility"],
  health: ["Wellness"],
  landmark: ["Learning & Culture","Outdoors"],
  natural_feature: ["Outdoors"],
  neighborhood: ["Social Buzz","Everyday Routine"],
  place_of_worship: ["Spiritual & Reflective"],
  point_of_interest: ["Everyday Routine"],
  town_square: ["Social Buzz","Outdoors"],
};

/**
 * Derive Crossd DNA tags from a Google Place object.
 * Uses primaryType first, then supplements from types[].
 */
export function getCrossdDNAFromPlace(place) {
  const dna = new Set();
  const primary = place?.primaryType || place?.primary_type;
  const allTypes = place?.types || [];

  if (primary && GOOGLE_PLACES_TO_CROSSD_DNA[primary]) {
    GOOGLE_PLACES_TO_CROSSD_DNA[primary].forEach(x => dna.add(x));
  }
  allTypes.forEach(type => {
    if (GOOGLE_PLACES_TO_CROSSD_DNA[type]) {
      GOOGLE_PLACES_TO_CROSSD_DNA[type].forEach(x => dna.add(x));
    }
  });

  // Fallback: if only Low Spark Utility, try harder
  if ([...dna].every(d => d === "Low Spark Utility") && dna.size > 0) {
    return ["Low Spark Utility"];
  }

  return [...dna].filter(d => d !== "Low Spark Utility");
}

/**
 * Derive Crossd DNA from a venue_types array (as stored on Moment entities).
 */
export function getCrossdDNAFromVenueTypes(venueTypes = []) {
  const dna = new Set();
  venueTypes.forEach(type => {
    if (GOOGLE_PLACES_TO_CROSSD_DNA[type]) {
      GOOGLE_PLACES_TO_CROSSD_DNA[type].forEach(x => dna.add(x));
    }
  });
  return [...dna].filter(d => d !== "Low Spark Utility");
}

// ─── MBTI primary compatible types (top 3 matches) ───────────────────────────
const MBTI_TOP_MATCHES = {
  INTJ: ["ENFP","ENTP","INFP"],
  INTP: ["ENTJ","ENFJ","ENTP"],
  ENTJ: ["INTP","INFP","INTJ"],
  ENTP: ["INFJ","INTJ","INTP"],
  INFJ: ["ENFP","ENTP","INFP"],
  INFP: ["ENFJ","ENTJ","INFJ"],
  ENFJ: ["INFP","ENFP","INFJ"],
  ENFP: ["INFJ","INTJ","ENFJ"],
  ISTJ: ["ESFP","ESTP","ISFP"],
  ISFJ: ["ESFP","ESTP","ISTJ"],
  ESTJ: ["ISTP","ISFP","ISTJ"],
  ESFJ: ["ISFP","ISTP","ESTJ"],
  ISTP: ["ESTJ","ESFJ","ESTP"],
  ISFP: ["ESFJ","ENFJ","ESTJ"],
  ESTP: ["ISFJ","ISTJ","ESFP"],
  ESFP: ["ISTJ","ISFJ","ESTP"],
};

/**
 * Given the user's profile (MBTI, vibe_tags) and their moments,
 * generate a ranked Top 10 list of venue/place categories to frequent.
 *
 * SparkZoneScore =
 *   MBTICompatibleTypeDensity * 0.30 +
 *   PlacesDNAOverlap * 0.25 +
 *   TimeWindowOverlap * 0.20 +
 *   VenueCategoryAffinity * 0.15 +
 *   DNAWeight * 0.10
 */
export function generateSparkZoneRecommendations(profile, moments = []) {
  const mbti = profile?.mbti_type;
  const compatibleTypes = mbti ? (MBTI_TOP_MATCHES[mbti] || []) : [];

  // Derive user's own PlacesDNA from moments
  const userDNA = new Set();
  moments.forEach(m => {
    getCrossdDNAFromVenueTypes(m.venue_types || []).forEach(d => userDNA.add(d));
  });

  // Also fold in vibe_tags as DNA hints
  const vibeTags = profile?.vibe_tags || [];
  vibeTags.forEach(tag => {
    // Map setup-step archetype IDs → DNA categories
    const tagToDNA = {
      calm_cozy: ["Calm & Cosy"],
      social_buzzing: ["Social Buzz"],
      active_energetic: ["Active","Wellness"],
      creative: ["Creative"],
      romantic: ["Romantic"],
      nightlife: ["Nightlife"],
      nature_grounded: ["Outdoors"],
      deep_intellectual: ["Learning & Culture"],
      live_electric: ["Live Events"],
      intimate_local: ["Calm & Cosy","Foodie"],
    };
    if (tagToDNA[tag]) tagToDNA[tag].forEach(d => userDNA.add(d));
  });

  // Peak times from vibe_tags (stored as "peak_<label>")
  const peakTags = vibeTags.filter(t => t.startsWith("peak_")).map(t => t.replace("peak_",""));
  const userPeaks = new Set(peakTags.map(t => t.toLowerCase()));

  // Build candidate venue categories with scores
  const VENUE_TEMPLATES = buildVenueTemplates();

  const scored = VENUE_TEMPLATES.map(venue => {
    // 1. MBTI compatible type density — does this venue attract compatible types?
    const compatiblePull = venue.personalityPull.filter(p => compatibleTypes.includes(p)).length;
    const mbtiScore = Math.min(1, compatiblePull / Math.max(1, Math.min(3, compatibleTypes.length)));

    // 2. PlacesDNA overlap — user's DNA vs venue DNA
    const overlapCount = venue.dna.filter(d => userDNA.has(d)).length;
    const placesScore = Math.min(1, overlapCount / Math.max(1, venue.dna.length));

    // 3. Time window overlap
    const timeScore = venue.bestTimes.some(t => {
      if (userPeaks.has("evening") && (t === "evening" || t === "night")) return true;
      if (userPeaks.has("night") && (t === "night" || t === "late")) return true;
      if (userPeaks.has("morning") && t === "morning") return true;
      if (userPeaks.has("weekends") && t === "weekend") return true;
      if (userPeaks.has("lunch") && t === "day") return true;
      if (userPeaks.has("afternoon") && t === "day") return true;
      return false;
    }) ? 1.0 : 0.3;

    // 4. Venue category affinity — does user already visit similar places?
    const affinityScore = venue.dna.some(d => userDNA.has(d)) ? 0.8 : 0.2;

    // 5. DNA weight (intrinsic sparkability)
    const primaryDNA = venue.dna[0] || "Everyday Routine";
    const dnaWeightScore = DNA_WEIGHTS[primaryDNA] || 0.5;

    const total =
      mbtiScore    * 0.30 +
      placesScore  * 0.25 +
      timeScore    * 0.20 +
      affinityScore * 0.15 +
      dnaWeightScore * 0.10;

    return { ...venue, score: total, mbtiScore, placesScore, timeScore };
  });

  // Sort by score, deduplicate by primary DNA, return top 10
  const seen = new Set();
  return scored
    .sort((a, b) => b.score - a.score)
    .filter(v => {
      const key = v.label;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 10);
}

/**
 * Static catalogue of venue templates with DNA, best times, personality pull,
 * and human-readable copy. Covers the most spark-relevant venue types.
 */
function buildVenueTemplates() {
  return [
    {
      label: "Independent Cafés",
      icon: "☕",
      dna: ["Calm & Cosy","Foodie","Social Buzz"],
      bestTimes: ["morning","day","evening"],
      personalityPull: ["INTJ","INFJ","INFP","INTP","ENFP","ISFJ","ENTJ"],
      why: "Low-pressure, conversation-friendly — the natural habitat for deep thinkers and quiet romantics.",
      googleTypes: ["cafe","coffee_shop","coffee_roastery"],
    },
    {
      label: "Wine Bars",
      icon: "🍷",
      dna: ["Romantic","Calm & Cosy","Premium Lifestyle"],
      bestTimes: ["evening","night"],
      personalityPull: ["ENTJ","INFJ","ENFJ","INTJ","ISFP","ENFP"],
      why: "Intentional evening energy — where compatible types slow down and connect.",
      googleTypes: ["wine_bar","cocktail_bar","lounge_bar"],
    },
    {
      label: "Art Galleries",
      icon: "🎨",
      dna: ["Creative","Learning & Culture","Romantic"],
      bestTimes: ["day","evening","weekend"],
      personalityPull: ["ISFP","INFP","ENFP","INFJ","INTJ","ENTP"],
      why: "Aesthetic spark. Slow-burn connections happen where beautiful things are on display.",
      googleTypes: ["art_gallery","art_museum","cultural_center"],
    },
    {
      label: "Live Music Venues",
      icon: "🎶",
      dna: ["Live Events","Creative","Nightlife"],
      bestTimes: ["evening","night","weekend"],
      personalityPull: ["ENFP","ESFP","ENTP","ISFP","ENFJ","ESTP"],
      why: "Shared atmosphere — the feeling of being in a crowd all feeling the same thing.",
      googleTypes: ["live_music_venue","concert_hall","performing_arts_theater"],
    },
    {
      label: "Boutique Fitness Studios",
      icon: "🏋️",
      dna: ["Active","Wellness","Social Buzz"],
      bestTimes: ["morning","day"],
      personalityPull: ["ENTJ","ESTP","ENFJ","ESFP","ISFP","ENTP"],
      why: "Discipline-based lifestyle overlap — where driven personalities naturally cross paths.",
      googleTypes: ["fitness_center","yoga_studio","gym","sports_club"],
    },
    {
      label: "Theatre & Performance Spaces",
      icon: "🎭",
      dna: ["Live Events","Creative","Romantic"],
      bestTimes: ["evening","weekend"],
      personalityPull: ["ENFP","INFP","INFJ","ENFJ","ISFP","INTJ"],
      why: "Shared emotional experiences create the fastest depth. Perfect for compatible intuitives.",
      googleTypes: ["performing_arts_theater","opera_house","auditorium"],
    },
    {
      label: "Bookshops & Libraries",
      icon: "📚",
      dna: ["Calm & Cosy","Learning & Culture","Creative"],
      bestTimes: ["morning","day"],
      personalityPull: ["INTJ","INTP","INFJ","INFP","ISTJ","ENFP"],
      why: "Quiet compatibility. The people who linger in bookshops are usually the ones worth meeting.",
      googleTypes: ["book_store","library"],
    },
    {
      label: "Rooftop Bars & Lounges",
      icon: "🌆",
      dna: ["Romantic","Premium Lifestyle","Social Buzz"],
      bestTimes: ["evening","night","weekend"],
      personalityPull: ["ENTJ","ENFJ","ENFP","ESFP","ENTP","ESTP"],
      why: "Elevated settings attract people who appreciate the finer details — premium energy.",
      googleTypes: ["lounge_bar","bar","observation_deck"],
    },
    {
      label: "Parks & Outdoor Spaces",
      icon: "🌿",
      dna: ["Outdoors","Calm & Cosy","Active"],
      bestTimes: ["morning","day","weekend"],
      personalityPull: ["ISFP","INFP","INFJ","ENFP","ISTP","ISTJ"],
      why: "Natural low-pressure spark. Some of the best connections happen with no agenda.",
      googleTypes: ["park","botanical_garden","nature_preserve","national_park"],
    },
    {
      label: "Farmers Markets",
      icon: "🥦",
      dna: ["Foodie","Outdoors","Social Buzz"],
      bestTimes: ["morning","day","weekend"],
      personalityPull: ["ENFP","ESFJ","ISFJ","ESFP","INFP","ENTJ"],
      why: "Laid-back social energy with shared lifestyle values around food and community.",
      googleTypes: ["farmers_market","market"],
    },
    {
      label: "Jazz & Acoustic Venues",
      icon: "🎷",
      dna: ["Live Events","Romantic","Calm & Cosy"],
      bestTimes: ["evening","night","weekend"],
      personalityPull: ["INFJ","INTJ","ISFP","ENFP","ENTJ","INFP"],
      why: "Intimate live music — where thoughtful personalities find each other in the quiet intensity.",
      googleTypes: ["live_music_venue","bar","concert_hall"],
    },
    {
      label: "Yoga & Wellness Studios",
      icon: "🧘",
      dna: ["Wellness","Calm & Cosy","Active"],
      bestTimes: ["morning","day"],
      personalityPull: ["INFJ","INFP","ISFP","ENFJ","ISFJ","INTJ"],
      why: "Grounded emotional compatibility. Shared wellness habits signal compatible values.",
      googleTypes: ["yoga_studio","wellness_center","spa","sauna"],
    },
    {
      label: "Museum Late Nights",
      icon: "🏛️",
      dna: ["Learning & Culture","Creative","Romantic"],
      bestTimes: ["evening","weekend"],
      personalityPull: ["INFJ","INTJ","INTP","INFP","ENFP","ENTJ"],
      why: "Curious dates, meaningful conversation — museums after hours attract intentional people.",
      googleTypes: ["museum","history_museum","art_museum"],
    },
    {
      label: "Premium Restaurants",
      icon: "🍽️",
      dna: ["Romantic","Foodie","Premium Lifestyle"],
      bestTimes: ["evening","weekend"],
      personalityPull: ["ENTJ","ENFJ","ESFJ","INTJ","ESFP","INFJ"],
      why: "Classic high-intention date energy. Shows deliberate choice and investment.",
      googleTypes: ["fine_dining_restaurant","french_restaurant","steak_house"],
    },
    {
      label: "Creative Coworking Spaces",
      icon: "💡",
      dna: ["Work & Ambition","Creative","Social Buzz"],
      bestTimes: ["morning","day"],
      personalityPull: ["ENTJ","ENTP","INTJ","INTP","ENFP","ESTJ"],
      why: "Ambitious personalities cross paths here naturally — shared drive is its own attraction.",
      googleTypes: ["coworking_space","business_center"],
    },
    {
      label: "Botanical Gardens",
      icon: "🌸",
      dna: ["Outdoors","Romantic","Calm & Cosy"],
      bestTimes: ["day","weekend"],
      personalityPull: ["INFP","INFJ","ISFP","ENFP","ISFJ","ENFJ"],
      why: "Romantic without the pressure — beautiful settings create natural talking points.",
      googleTypes: ["botanical_garden","garden","park"],
    },
    {
      label: "Comedy Clubs",
      icon: "😄",
      dna: ["Live Events","Social Buzz","Nightlife"],
      bestTimes: ["evening","night","weekend"],
      personalityPull: ["ENTP","ENFP","ESFP","ESTP","ENFJ","ENTJ"],
      why: "Shared laughter is a fast-track to connection. High-energy social types thrive here.",
      googleTypes: ["comedy_club"],
    },
    {
      label: "Concept Stores & Boutiques",
      icon: "🛍️",
      dna: ["Creative","Shopping","Premium Lifestyle"],
      bestTimes: ["day","weekend"],
      personalityPull: ["ISFP","ENFP","INFP","ENFJ","ESFP","ENTJ"],
      why: "Aesthetic-driven spaces attract people with strong personal style and taste.",
      googleTypes: ["clothing_store","gift_shop","thrift_store"],
    },
    {
      label: "Tapas & Sharing Plate Restaurants",
      icon: "🫒",
      dna: ["Foodie","Romantic","Social Buzz"],
      bestTimes: ["evening","weekend"],
      personalityPull: ["ENFP","ESFJ","ENFJ","ESFP","INFJ","ENTJ"],
      why: "Sharing food lowers guards. Perfect format for first connections and easy conversation.",
      googleTypes: ["tapas_restaurant","spanish_restaurant","mediterranean_restaurant"],
    },
    {
      label: "Vineyards & Wineries",
      icon: "🍾",
      dna: ["Romantic","Foodie","Outdoors","Premium Lifestyle"],
      bestTimes: ["day","evening","weekend"],
      personalityPull: ["ENTJ","INTJ","ENFJ","INFJ","ESFP","ENFP"],
      why: "Unhurried, scenic, and inherently social — ideal for compatible types who value quality.",
      googleTypes: ["vineyard","winery"],
    },
  ];
}