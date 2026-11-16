import { MarketPriceItem, AgriNewsItem, RegionalOutbreakData, CropDiagnosis } from "../types";

export interface StateCoordinate {
  state: string;
  zone: "North West" | "North East" | "North Central" | "South West" | "South East" | "South South";
  lat: number;
  lng: number;
}

export const NIGERIAN_STATES: StateCoordinate[] = [
  { state: "Abia", zone: "South East", lat: 5.5320, lng: 7.4860 },
  { state: "Adamawa", zone: "North East", lat: 9.3265, lng: 12.3984 },
  { state: "Akwa Ibom", zone: "South South", lat: 5.0079, lng: 7.8497 },
  { state: "Anambra", zone: "South East", lat: 6.2209, lng: 6.9370 },
  { state: "Bauchi", zone: "North East", lat: 10.3158, lng: 9.8442 },
  { state: "Bayelsa", zone: "South South", lat: 4.7719, lng: 6.0699 },
  { state: "Benue", zone: "North Central", lat: 7.3369, lng: 8.7404 },
  { state: "Borno", zone: "North East", lat: 11.8846, lng: 13.1520 },
  { state: "Cross River", zone: "South South", lat: 5.8702, lng: 8.5988 },
  { state: "Delta", zone: "South South", lat: 5.7040, lng: 5.9339 },
  { state: "Ebonyi", zone: "South East", lat: 6.2649, lng: 8.0137 },
  { state: "Edo", zone: "South South", lat: 6.5438, lng: 5.8987 },
  { state: "Ekiti", zone: "South West", lat: 7.7190, lng: 5.3110 },
  { state: "Enugu", zone: "South East", lat: 6.5364, lng: 7.4356 },
  { state: "FCT Abuja", zone: "North Central", lat: 9.0765, lng: 7.3986 },
  { state: "Gombe", zone: "North East", lat: 10.2897, lng: 11.1673 },
  { state: "Imo", zone: "South East", lat: 5.4836, lng: 7.0332 },
  { state: "Jigawa", zone: "North West", lat: 12.2280, lng: 9.5616 },
  { state: "Kaduna", zone: "North West", lat: 10.5105, lng: 7.4165 },
  { state: "Kano", zone: "North West", lat: 12.0022, lng: 8.5920 },
  { state: "Katsina", zone: "North West", lat: 12.9855, lng: 7.6171 },
  { state: "Kebbi", zone: "North West", lat: 12.4504, lng: 4.1999 },
  { state: "Kogi", zone: "North Central", lat: 7.7969, lng: 6.7405 },
  { state: "Kwara", zone: "North Central", lat: 8.4799, lng: 4.5418 },
  { state: "Lagos", zone: "South West", lat: 6.5244, lng: 3.3792 },
  { state: "Nasarawa", zone: "North Central", lat: 8.4998, lng: 8.5153 },
  { state: "Niger", zone: "North Central", lat: 9.9309, lng: 5.5983 },
  { state: "Ogun", zone: "South West", lat: 7.1604, lng: 3.3483 },
  { state: "Ondo", zone: "South West", lat: 7.2526, lng: 5.1931 },
  { state: "Osun", zone: "South West", lat: 7.5629, lng: 4.5200 },
  { state: "Oyo", zone: "South West", lat: 7.9700, lng: 3.5900 },
  { state: "Plateau", zone: "North Central", lat: 9.2182, lng: 9.5179 },
  { state: "Rivers", zone: "South South", lat: 4.8156, lng: 7.0498 },
  { state: "Sokoto", zone: "North West", lat: 13.0609, lng: 5.2476 },
  { state: "Taraba", zone: "North East", lat: 7.8704, lng: 9.7800 },
  { state: "Yobe", zone: "North East", lat: 12.0000, lng: 11.5000 },
  { state: "Zamfara", zone: "North West", lat: 12.1222, lng: 6.2236 }
];

// Deprecated: All static mock arrays have been replaced by dynamic React hooks
// (useMarketPrices & useAgriNews) that fetch data asynchronously.
export const INITIAL_MARKET_PRICES: MarketPriceItem[] = [];
export const INITIAL_NEWS_ITEMS: AgriNewsItem[] = [];


export const INITIAL_DIAGNOSES: CropDiagnosis[] = [
  {
    id: "diag-1",
    farmerId: "f-kano-01",
    farmerName: "Amina Bello",
    cropType: "Maize",
    disease_name: "Fall Armyworm (Spodoptera frugiperda)",
    confidence_score: 95.8,
    primary_symptoms: [
      "Window-pane feeding damage on young leaf whorls",
      "Noticeable coarse sawdust-like frass inside stem junction",
      "Irregular ragged holes on expanding leaves"
    ],
    immediate_treatment_plan: [
      "Spray systemic Emamectin Benzoate 5% SG at 0.5g/Litre water early in the morning",
      "Apply localized wood ash or fine river sand into leaf whorls to suffocate small larvae",
      "Deploy pheromone traps around field perimeter (4-5 traps per hectare)"
    ],
    preventative_measures: [
      "Intercrop maize with silverleaf desmodium (push-pull strategy)",
      "Plant early with synchronized regional planting window",
      "Inspect whorls twice weekly during early vegetative stage"
    ],
    severity_level: "Critical",
    affected_plant_part: "Leaf Whorl and Stem",
    localized_advice: {
      hausa: "Kwari mai cin ganyen masara (Fall Armyworm) ya shiga gonarka. Ka zuba tokar itace ko maganin feshi da sassafe kafin rana ta fito.",
      yoruba: "Kokoro kogun ti n je ewe agbado wa ninu oko re. Lo eérú igi tabi ogun feshi ni kutukutu owuro.",
      igbo: "Ahụhụ na-eri akwụkwọ ọka abanyela n'ugbo gị. Fesa ọgwụ ma ọ bụ tinye ntụ n'ime akwụkwọ n'ụtụtụ.",
      pidgin: "Fall armyworm dey chop your corn leaf! Quick quick put wood ash inside the leaf center or spray medicine for morning time."
    },
    imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80",
    coordinates: {
      latitude: 12.0022,
      longitude: 8.5920,
      state: "Kano",
      lga: "Dambatta",
      locationName: "Kano Agro Belt"
    },
    timestamp: Date.now() - 3600000 * 4,
    verifiedByOfficer: true,
    officerNotes: "Confirmed in field inspection. Area spray scheduled."
  },
  {
    id: "diag-2",
    farmerId: "f-benue-02",
    farmerName: "Terhemba Iorfa",
    cropType: "Cassava",
    disease_name: "Cassava Mosaic Geminivirus (CMD)",
    confidence_score: 93.4,
    primary_symptoms: [
      "Severe chlorotic leaf mosaic and asymmetric leaf distortion",
      "Stunted foliar growth and twisted petioles",
      "Whitefly (Bemisia tabaci) vector clusters under lower leaves"
    ],
    immediate_treatment_plan: [
      "Rogue out and incinerate heavily infected plants to stop viral spread",
      "Apply insecticidal soap or neem oil spray to control whitefly vector vectors",
      "Do not take stem cuttings from affected stands for multiplication"
    ],
    preventative_measures: [
      "Source certified virus-free cuttings (TME 419 or TMS 98/0505 from IITA/NRCRI)",
      "Monitor and manage weed alternate hosts around farm borders",
      "Maintain spatial buffer from old infested cassava fields"
    ],
    severity_level: "Medium",
    affected_plant_part: "Leaves and Shoots",
    localized_advice: {
      hausa: "Cutar Mosaic ta rogo. Cire bishiyoyin da suka kamu ka kona su don kada cutar ta bazu ga sauran.",
      yoruba: "Arun kokoro ewe ege. Tu awon ti o ba ti baje kuro ki o si sun won ki o ma ba ran awon to ku.",
      igbo: "Ọrịa mosaic nke ji akpụ. Gbupụ ma kpọọ osisi ndị butere ya ọkụ ka ọ ghara iru ndị ọzọ.",
      pidgin: "Na cassava mosaic sickness. Pull out the infected cassava burn am make e no infect the rest."
    },
    imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80",
    coordinates: {
      latitude: 7.3369,
      longitude: 8.7404,
      state: "Benue",
      lga: "Gboko",
      locationName: "Gboko Farm Settlement"
    },
    timestamp: Date.now() - 3600000 * 14,
    verifiedByOfficer: true,
    officerNotes: "Recommended resistant stem variety TME 419 replacement."
  },
  {
    id: "diag-3",
    farmerId: "f-oyo-03",
    farmerName: "Biodun Adeleke",
    cropType: "Tomatoes",
    disease_name: "Tomato Blight & Tuta Absoluta (Tomato Leafminer)",
    confidence_score: 91.2,
    primary_symptoms: [
      "Blotchy silver-brown serpentine mines inside leaf mesophyll",
      "Dark necrotic lesions on green tomato fruits and stems",
      "Rapid premature wilting of upper canopy"
    ],
    immediate_treatment_plan: [
      "Spray Bacillus thuringiensis or Spinosad targeting emerging larvae",
      "Remove and destroy punctured fruits and heavily mined foliage",
      "Install delta pheromone sticky traps at 1-meter plant height"
    ],
    preventative_measures: [
      "Implement net nursery houses with 40-mesh insect screens",
      "Enforce minimum 3-year crop rotation avoiding Solanaceae family",
      "Clear all Solanum nightshade weed reservoirs nearby"
    ],
    severity_level: "Critical",
    affected_plant_part: "Fruit & Leaves",
    localized_advice: {
      hausa: "Cutar tumatir (Tuta Absoluta). Fesa maganin kwari mai inganci sannan ka cire 'ya'yan da suka riga suka lalace.",
      yoruba: "Kokoro Tuta ti n pa tomati lara. Feshi ogun abemi bi Spinosad ki o si ko gbogbo eso ti o ba je danu.",
      igbo: "Ọrịa na-egbu tomato. Fesa ọgwụ kwesịrị ekwesị ma tufuo tomato ndị mebiri emebi ozugbo.",
      pidgin: "Tomato leafminer don enter your farm! Spray organic medicine and pluck commot all the rotten tomato make e no spread."
    },
    imageUrl: "https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=800&q=80",
    coordinates: {
      latitude: 7.9700,
      longitude: 3.5900,
      state: "Oyo",
      lga: "Iseyin",
      locationName: "Iseyin Agro Zone"
    },
    timestamp: Date.now() - 3600000 * 26,
    verifiedByOfficer: true,
    officerNotes: "Pheromone traps supplied from Oyo ADP."
  },
  {
    id: "diag-4",
    farmerId: "f-kebbi-04",
    farmerName: "Usman Danladi",
    cropType: "Rice",
    disease_name: "Rice Blast (Pyricularia oryzae)",
    confidence_score: 89.5,
    primary_symptoms: [
      "Diamond spindle-shaped spots with grey-white centers and reddish-brown margins",
      "Neck rot causing whitish unfilled grain heads",
      "Collar rot at leaf junction"
    ],
    immediate_treatment_plan: [
      "Apply Tricyclazole 75% WP or Azoxystrobin systemic fungicide",
      "Drain excess standing water temporarily to reduce micro-humidity",
      "Reduce excess urea/nitrogen top-dressing immediately"
    ],
    preventative_measures: [
      "Use certified blast-tolerant seeds such as FARO 44 or FARO 52",
      "Maintain balanced potash and silica soil nutrition",
      "Avoid ultra-dense planting density"
    ],
    severity_level: "Medium",
    affected_plant_part: "Leaf and Panicle Neck",
    localized_advice: {
      hausa: "Cutar shinkafa (Blast). Ka rage takin Nitrogen sannan ka fesa maganin fungal don kare kan shinkafar.",
      yoruba: "Arun iresi. Din omi inu oko ku die ki o si feshi ogun fungus.",
      igbo: "Ọrịa osikapa (Rice Blast). Gbadaa nri nitrogen ma fesa ọgwụ fungicide.",
      pidgin: "Rice blast sickness. Reduce fertilizer wey get too much nitrogen, and spray fungicide quick."
    },
    imageUrl: "https://images.unsplash.com/photo-1536704680372-763462d7c570?auto=format&fit=crop&w=800&q=80",
    coordinates: {
      latitude: 12.4504,
      longitude: 4.1999,
      state: "Kebbi",
      lga: "Argungu",
      locationName: "Fadama Rice Basin"
    },
    timestamp: Date.now() - 3600000 * 36,
    verifiedByOfficer: false
  },
  {
    id: "diag-5",
    farmerId: "f-enugu-05",
    farmerName: "Chidimma Nnamani",
    cropType: "Yam",
    disease_name: "Yam Anthracnose (Colletotrichum gloeosporioides)",
    confidence_score: 92.1,
    primary_symptoms: [
      "Circular dark brown to black leaf spots with yellow halos",
      "Dieback of expanding vine tips giving a burnt scorched look",
      "Premature defoliation during peak tuber bulking"
    ],
    immediate_treatment_plan: [
      "Spray Mancozeb 80% WP or Copper Hydroxide fungicide thoroughly on foliage",
      "Prune heavily scorched trailing vines and burn outside plot",
      "Ensure staking keeps foliage elevated from wet soil splash"
    ],
    preventative_measures: [
      "Dip seed yam setts in fungicide/wood ash slurry prior to planting",
      "Stake vines individually with minimum 2.5m stakes for maximum ventilation",
      "Strict 2-year rotation with legumes or maize"
    ],
    severity_level: "Medium",
    affected_plant_part: "Foliage and Vines",
    localized_advice: {
      hausa: "Cutar doya mai kone ganye. Tabbatar ka daga ganyen daga kasa sannan ka fesa Mancozeb.",
      yoruba: "Arun ewe isu ti o dabi ina. Gbe igi isu soke ki o si feshi Mancozeb.",
      igbo: "Ọrịa anthracnose na-agba akwụkwọ ji ọkụ. Kpọgide ji n'elu osisi ma fesa ọgwụ Mancozeb.",
      pidgin: "Anthracnose sickness dey burn your yam leaves like fire. Tie the yam climb high stake and spray Mancozeb."
    },
    imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80",
    coordinates: {
      latitude: 6.5364,
      longitude: 7.4356,
      state: "Enugu",
      lga: "Nkanu West",
      locationName: "Enugu Yam Belt"
    },
    timestamp: Date.now() - 3600000 * 48,
    verifiedByOfficer: true,
    officerNotes: "Advisory issued for Nkanu cluster farmers."
  }
];

export const REGIONAL_OUTBREAK_HEATMAP: RegionalOutbreakData[] = [
  {
    state: "Kano",
    zone: "North West",
    totalOutbreaks: 142,
    activeAlerts: 18,
    dominantDisease: "Fall Armyworm (Maize)",
    primaryCropAtRisk: "Maize & Sorghum",
    riskLevel: "High",
    estimatedLossPercent: 22.4,
    lat: 12.0022,
    lng: 8.5920
  },
  {
    state: "Benue",
    zone: "North Central",
    totalOutbreaks: 118,
    activeAlerts: 14,
    dominantDisease: "Cassava Mosaic & Anthracnose",
    primaryCropAtRisk: "Yam & Cassava",
    riskLevel: "Moderate",
    estimatedLossPercent: 18.2,
    lat: 7.3369,
    lng: 8.7404
  },
  {
    state: "Oyo",
    zone: "South West",
    totalOutbreaks: 96,
    activeAlerts: 12,
    dominantDisease: "Tomato Tuta Absoluta",
    primaryCropAtRisk: "Tomatoes & Maize",
    riskLevel: "High",
    estimatedLossPercent: 25.1,
    lat: 7.9700,
    lng: 3.5900
  },
  {
    state: "Kebbi",
    zone: "North West",
    totalOutbreaks: 84,
    activeAlerts: 9,
    dominantDisease: "Rice Blast & Brown Spot",
    primaryCropAtRisk: "Paddy Rice",
    riskLevel: "Moderate",
    estimatedLossPercent: 14.7,
    lat: 12.4504,
    lng: 4.1999
  },
  {
    state: "Kaduna",
    zone: "North West",
    totalOutbreaks: 110,
    activeAlerts: 16,
    dominantDisease: "Maize Smut & Armyworm",
    primaryCropAtRisk: "Maize & Cowpea",
    riskLevel: "High",
    estimatedLossPercent: 21.0,
    lat: 10.5105,
    lng: 7.4165
  },
  {
    state: "Plateau",
    zone: "North Central",
    totalOutbreaks: 78,
    activeAlerts: 11,
    dominantDisease: "Potato Late Blight",
    primaryCropAtRisk: "Irish Potato & Tomato",
    riskLevel: "Severe",
    estimatedLossPercent: 29.3,
    lat: 9.2182,
    lng: 9.5179
  },
  {
    state: "Enugu",
    zone: "South East",
    totalOutbreaks: 65,
    activeAlerts: 7,
    dominantDisease: "Yam Anthracnose",
    primaryCropAtRisk: "Yam & Cassava",
    riskLevel: "Low",
    estimatedLossPercent: 11.5,
    lat: 6.5364,
    lng: 7.4356
  },
  {
    state: "Edo",
    zone: "South South",
    totalOutbreaks: 54,
    activeAlerts: 6,
    dominantDisease: "Oil Palm Leaf Blight",
    primaryCropAtRisk: "Oil Palm & Plantain",
    riskLevel: "Low",
    estimatedLossPercent: 9.8,
    lat: 6.5438,
    lng: 5.8987
  },
  {
    state: "Taraba",
    zone: "North East",
    totalOutbreaks: 72,
    activeAlerts: 10,
    dominantDisease: "Rice Gall Midge",
    primaryCropAtRisk: "Rice & Maize",
    riskLevel: "Moderate",
    estimatedLossPercent: 16.3,
    lat: 7.8704,
    lng: 9.7800
  },
  {
    state: "Lagos",
    zone: "South West",
    totalOutbreaks: 41,
    activeAlerts: 4,
    dominantDisease: "Vegetable Root Rot",
    primaryCropAtRisk: "Leafy Vegetables & Aquaculture",
    riskLevel: "Low",
    estimatedLossPercent: 8.5,
    lat: 6.5244,
    lng: 3.3792
  }
];
