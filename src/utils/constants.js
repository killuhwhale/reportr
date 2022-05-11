export default function mTea() { }
export const ACCESS_TOKEN_KEY = 'UserAuth_access'
export const REFRESH_TOKEN_KEY = 'UserAuth_refresh'
export const COMPANY_ID_KEY = 'UserAuth_company_id_key'
export const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026]

export const ROLES = {
  READ: 1,
  WRITE: 2,
  DELETE: 3,
  ADMIN: 4,
  HACKER: 5
}

export const ROLE_LABELS = {
  1: 'READ',
  2: 'WRITE',
  3: 'DELETE',
  4: 'ADMIN',
  5: 'HACKER',
}

export const COUNTIES = ['Amador', 'Butte', 'Colusa', 'Fresno', 'Glenn', 'Kern', 'Kings', 'Lassen', 'Madera', 'Merced', 'Modoc', 'Placer', 'Sacramento', 'San Joaquin', 'Shasta', 'Solano', 'Stanislaus', 'Sutter', 'Tehama', 'Tulare', 'Yolo', 'Yuba']
export const BASINS = ["Sacramento River Basin", "San Joaquin River Basin", 'Tulare Basin']
export const BREEDS = ['Ayrshire', 'Brown Swiss', 'Guernsey', 'Holstein', 'Jersey', 'Jersey-Holstein Cross', 'Milking Shorthorn', 'Other']

export const REPORTING_METHODS = ['dry-weight', 'as-is']
export const SOURCE_OF_ANALYSES = ['Lab Analysis', 'Other/ estimated']
export const FRESHWATER_SOURCE_TYPES = ['Ground water', 'Surface water']

// SM Apps
export const MATERIAL_TYPES = ['Separator solids', 'Corral solids', "Scraped material", 'Bedding', 'Compost']
export const WASTEWATER_MATERIAL_TYPES = ['', 'Process wastewater', 'Process wastewater sludge']

export const EXPORT_MATERIAL_TYPES = [
  'Dry manure: Separator solids', 'Dry manure: Corral solids', 'Dry manure: Scraped material', 'Dry manure: Bedding',
  'Dry manure: Compost', 'Process wastewater', 'Process wastewater: Process wastewater sludge'
]
export const DEST_TYPES = ['Broker', 'Composting Facility', 'Farmer', 'Other']

export const NUTRIENT_IMPORT_MATERIAL_TYPES = [
  'Commercial fertilizer/ Other: Liquid commercial fertilizer', 'Commercial fertilizer/ Other: Solid commercial fertilizer',
  'Commercial fertilizer/ Other: Other liquid nutrient source', 'Commercial fertilizer/ Other: Other solid nutrient source',
  'Dry manure: Separator solids', 'Dry manure: Corral solids', 'Dry manure: Scraped material', 'Dry manure: Bedding',
  'Dry manure: Compost', 'Process wastewater', 'Process wastewater: Process wastewater sludge']

export const PRECIPITATIONS = [
  "No Precipitation",
  "Standing water",
  "Lightrain",
  "Steady rain",
  "Heavy rain",
  "Hail",
  "Snow",
]
export const APP_METHODS = [
  'No till (plowdown credit)',
  'Plow/disc',
  'Broadcast/incorporate',
  'Shank',
  'Injection',
  'Sweep',
  'Banding',
  'Sidedress',
  'Pipeline',
  'Surface (irragation',
  'Subsurface (irragation',
  'Towed tank',
  'Towed hose',
  'Other',
]

export const DISCHARGE_TYPES = [
  'Manure/process wastewater', 'Storm water', 'Land application'
]

export const DISCHARGE_SOURCES = [
  'Tailwater', 'Wastewater', 'Blended wastewater', 'Storm water'
]


export const VOL_UNITS = [
  'cubic yd', 'gals'
]

export const CROPS = [
  'Alfalfa Haylage',
  'Alfalfa hay',
  'Almond in shell',
  'Apple',
  'Barley silage boot stage',
  'Barley silage soft dough',
  'Barley grain',
  'Bermudagrass hay',
  'Broccoli',
  'Bromegrass forage',
  'Cabbage',
  'Canola grain',
  'Cantaloupe',
  'Celery',
  'Clover-grass hay',
  'Corn grain',
  'Corn silage',
  'Cotton lint',
  'Grape',
  'Lettuce',
  'Oats grain',
  'Oats hay',
  'Oats silage-soft dough',
  'Orchardgrass hay',
  'Pasture',
  'Pasture Silage',
  'Peach',
  'Pear',
  'Potato',
  'Prune',
  'Ryegrass hay',
  'Safflower',
  'Sorghum',
  'Sorghum-Sudangrass forage',
  'Squash',
  'Sudangrass hay',
  'Sudangrass silage',
  'Sugar beets',
  'Sweet Potato',
  'Tall Fescue hay',
  'Timothy hay',
  'Tomato',
  'Triticale boot stage',
  'Triticale soft dough',
  'Vetch forage',
  'Wheat grain',
  'Wheat Hay',
  'Wheat silage boot stage',
  'Wheat silage soft dough',
]