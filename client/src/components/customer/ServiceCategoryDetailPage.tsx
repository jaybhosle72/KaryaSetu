import React, { useState } from 'react';
import { 
  ArrowLeft, Star, ShieldCheck, Check, Plus, Minus, 
  Trash2, CreditCard, ChevronRight, Sparkles, Wrench, Zap, Hammer, Home, Tv
} from 'lucide-react';

export type ServiceCategoryId = 
  | 'ac' 
  | 'electrician' 
  | 'plumbing' 
  | 'bathroom-kitchen' 
  | 'full-cleaning' 
  | 'smart-locks'
  | 'washing-machine'
  | 'chimney'
  | 'geyser'
  | 'refrigerator'
  | 'maid'
  | 'caregiver'
  | 'driver'
  | 'gardening'
  | 'painting'
  | 'wellness'
  | 'pest-control';

import { CartItem } from './CartDrawerModal';
import { Worker } from '../../types';

interface ServiceCategoryDetailPageProps {
  categoryId: ServiceCategoryId;
  onBack: () => void;
  onSubmitBooking: (bookingData: any) => Promise<any>;
  onPayBooking?: (id: string, paymentMethod?: string) => Promise<void>;
  cart: CartItem[];
  onAddToCart: (item: any) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart?: () => void;
  workers?: Worker[];
}

interface CategoryConfig {
  id: ServiceCategoryId;
  title: string;
  breadcrumbCategory: string;
  rating: number;
  bookingsCount: string;
  warrantyText: string;
  badgeText: string;
  copilotBadge: string;
  copilotTitle: string;
  copilotDescription: string;
  deviceTitle?: string;
  deviceLines?: string[];
  deviceReadout?: string;
  subCategories: { 
    key: string; 
    title?: string; 
    name?: string; 
    icon: string; 
    sub?: string; 
    desc?: string;
    items?: {
      id: string;
      name: string;
      rating: number;
      reviews: string;
      price: number;
      originalPrice: number;
      duration: string;
      description: string;
    }[];
  }[];
  sections?: {
    id: string;
    title: string;
    subtitle: string;
    bannerBadge?: string;
    bannerTitle?: string;
    bannerSubtitle?: string;
    items: {
      id: string;
      name: string;
      rating: number;
      reviews: string;
      price: number;
      originalPrice: number;
      duration: string;
      description: string;
    }[];
  }[];
}

const CATEGORY_DATA: Record<ServiceCategoryId, CategoryConfig> = {
  ac: {
    id: 'ac',
    title: 'AC',
    breadcrumbCategory: 'Appliance repair & service',
    rating: 4.78,
    bookingsCount: '14.0 M bookings',
    warrantyText: 'Upto 30 days warranty on repairs',
    badgeText: 'COOPERATIVE COVER',
    copilotBadge: 'FREE GAS CHECK',
    copilotTitle: 'AC diagnosis with digital gauge',
    copilotDescription: 'No gas refill without a reading. Certified cooperative technicians verify exact refrigerant pressure before recommending any top-up.',
    deviceTitle: 'SS-COPILOT v2.4',
    deviceLines: ['PRESSURE: 65.4 PSI', 'R-32 GAS: OPTIMAL (98%)', 'DISCHARGE TEMP: 12.4°C'],
    subCategories: [
      { key: 'SERVICE', title: 'Service', icon: '❄️', sub: 'Foam-jet' },
      { key: 'REPAIR', title: 'Repair & gas refill', icon: '🔧', sub: 'Diagnosis' },
      { key: 'INSTALL', title: 'Installation / uninstallation', icon: '🛠️', sub: 'Mounting' },
      { key: 'ANNUAL', title: 'Annual plan', icon: '⭐', sub: '30% OFF' }
    ],
    sections: [
      {
        id: 'SERVICE',
        title: 'Service',
        subtitle: 'Deep vent cleaning with high-pressure water jet and foam jacket',
        bannerBadge: 'Free gas check',
        bannerTitle: 'Foam-jet AC service',
        bannerSubtitle: 'Deep clean AC vents for efficient cooling and power saving',
        items: [
          {
            id: 'ac-foam-1',
            name: 'Foam-jet service (1 AC)',
            rating: 4.75,
            reviews: '2.9M',
            price: 649,
            originalPrice: 849,
            duration: '1 hr 15 mins',
            description: 'Applicable for window or split AC. Indoor unit deep cleaning with foam & pressure jet spray.'
          },
          {
            id: 'ac-foam-2',
            name: 'Foam-jet service (2 ACs)',
            rating: 4.75,
            reviews: '2.9M',
            price: 1098,
            originalPrice: 1298,
            duration: '2 hrs',
            description: 'Applicable for both window or split ACs. Includes indoor unit deep foam cleaning and free gas check.'
          },
          {
            id: 'ac-foam-3',
            name: 'Foam-jet service (3 ACs)',
            rating: 4.75,
            reviews: '2.9M',
            price: 1647,
            originalPrice: 1947,
            duration: '3 hrs',
            description: 'Multi-room bundle. Full condenser water flush and anti-bacterial coating.'
          }
        ]
      },
      {
        id: 'REPAIR',
        title: 'Repair & gas refill',
        subtitle: 'Component diagnosis, PCB repair, and digital gauge gas charging',
        items: [
          {
            id: 'ac-repair-diag',
            name: 'AC repair & diagnosis',
            rating: 4.73,
            reviews: '859K',
            price: 299,
            originalPrice: 499,
            duration: '45 mins',
            description: 'Complete check-up to identify cooling issues, noise, or water leakage before repair.'
          },
          {
            id: 'ac-gas-refill',
            name: 'Gas refill & check-up',
            rating: 4.77,
            reviews: '112K',
            price: 2800,
            originalPrice: 3200,
            duration: '2 hrs 30 mins',
            description: 'Full leak test with soap bubble/pressure test followed by certified R-32/R-410A refrigerant charging.'
          }
        ]
      },
      {
        id: 'INSTALL',
        title: 'Installation / uninstallation',
        subtitle: 'Bracket mounting, copper piping vacuuming, and safe dismantling',
        items: [
          {
            id: 'ac-install',
            name: 'AC installation',
            rating: 4.69,
            reviews: '150K',
            price: 799,
            originalPrice: 1099,
            duration: '2 hrs',
            description: 'Installation of indoor & outdoor units with core hole drilling and free gas check.'
          },
          {
            id: 'ac-uninstall',
            name: 'AC uninstallation',
            rating: 4.79,
            reviews: '140K',
            price: 649,
            originalPrice: 899,
            duration: '1 hr 30 mins',
            description: 'Safe uninstallation of both indoor & outdoor units with zero gas leakage valve sealing.'
          }
        ]
      }
    ]
  },

  electrician: {
    id: 'electrician',
    title: 'Electrician & Wiring',
    breadcrumbCategory: 'Electrical & home power',
    rating: 4.82,
    bookingsCount: '8.4 M bookings',
    warrantyText: '30 days warranty on wiring & switchgears',
    badgeText: 'COOPERATIVE SAFETY CERTIFIED',
    copilotBadge: 'IS-732 SAFETY TEST',
    copilotTitle: 'Thermal short-circuit & load audit',
    copilotDescription: 'Certified cooperative electricians carry infrared thermal scanners. No wire replacement without an authenticated fault reading.',
    deviceTitle: 'SS-OHM v3.1',
    deviceLines: ['VOLTAGE: 238V AC', 'LOAD: 14.2A (NORMAL)', 'EARTH RESISTANCE: 0.8Ω (SAFE)'],
    subCategories: [
      { key: 'SWITCH', title: 'Switches & Sockets', icon: '🔌', sub: 'Replacement' },
      { key: 'FAN', title: 'Fans & Fixtures', icon: '🌀', sub: 'Mounting' },
      { key: 'MCB', title: 'MCB & Tripping', icon: '⚡', sub: 'Safety' },
      { key: 'WIRING', title: 'Internal Wiring', icon: '🧵', sub: 'Concealed' }
    ],
    sections: [
      {
        id: 'SWITCH',
        title: 'Switches & Sockets',
        subtitle: 'Modular switch repair, burned socket replacement, and heavy load point wiring',
        bannerBadge: 'Safety First',
        bannerTitle: 'Short-Circuit Safe Guarantee',
        bannerSubtitle: 'Fire-retardant grade copper wiring and IS-compliant modules',
        items: [
          {
            id: 'elec-switch-rep',
            name: 'Switch / Socket Replacement (up to 3 points)',
            rating: 4.85,
            reviews: '1.2M',
            price: 149,
            originalPrice: 249,
            duration: '30 mins',
            description: 'Replacement of spark-prone, loose, or burnt switch/socket points with testing.'
          },
          {
            id: 'elec-power-point',
            name: 'Heavy Appliance Power Point (16A)',
            rating: 4.88,
            reviews: '740K',
            price: 299,
            originalPrice: 399,
            duration: '45 mins',
            description: 'Dedicated 16A/25A switch & socket box for geyser, AC, or microwave with earthing.'
          }
        ]
      },
      {
        id: 'FAN',
        title: 'Fans & Fixtures',
        subtitle: 'Ceiling fan, exhaust fan, decorative chandelier, and LED tube mounting',
        items: [
          {
            id: 'elec-fan-install',
            name: 'Ceiling Fan Installation / Replacement',
            rating: 4.88,
            reviews: '920K',
            price: 249,
            originalPrice: 349,
            duration: '45 mins',
            description: 'Mounting of downrod, canopy, blades, and regulator speed calibration.'
          },
          {
            id: 'elec-fan-repair',
            name: 'Ceiling Fan Repair & Capacitor Change',
            rating: 4.79,
            reviews: '450K',
            price: 199,
            originalPrice: 299,
            duration: '30 mins',
            description: 'Fix wobbling noise, low speed, or burnt capacitor.'
          }
        ]
      },
      {
        id: 'MCB',
        title: 'MCB & Tripping Triage',
        subtitle: 'Distribution board diagnostics, RCCB nuisance tripping, and sub-meter wiring',
        items: [
          {
            id: 'elec-mcb-triage',
            name: 'MCB Tripping & Short Circuit Triage',
            rating: 4.82,
            reviews: '610K',
            price: 399,
            originalPrice: 599,
            duration: '1 hr',
            description: 'Insulation test to locate hidden neutral shorts and replace faulty single/double pole MCB.'
          },
          {
            id: 'elec-submeter',
            name: 'Sub-Meter Installation & Connection',
            rating: 4.89,
            reviews: '120K',
            price: 499,
            originalPrice: 699,
            duration: '1 hr 15 mins',
            description: 'Digital kilowatt-hour sub-meter connection for rental portions or shops.'
          }
        ]
      }
    ]
  },

  plumbing: {
    id: 'plumbing',
    title: 'Plumbing & Water Purifier',
    breadcrumbCategory: 'Water supply & sanitary',
    rating: 4.79,
    bookingsCount: '9.2 M bookings',
    warrantyText: '30 days zero-leakage guarantee',
    badgeText: 'COOPERATIVE CERTIFIED FITTERS',
    copilotBadge: 'DIGITAL TDS & FLOW CHECK',
    copilotTitle: 'Purity & water pressure calibration',
    copilotDescription: 'Digital sensor inspection of incoming line pressure and RO membrane dissolved solids before replacing any cartridge.',
    deviceTitle: 'SS-HYDRO v1.9',
    deviceLines: ['INLET TDS: 480 PPM', 'OUTLET TDS: 42 PPM', 'LINE PRESSURE: 3.2 BAR (GOOD)'],
    subCategories: [
      { key: 'PURIFIER', title: 'Water Purifier (RO)', icon: '💧', sub: 'Filter change' },
      { key: 'TAPS', title: 'Taps & Mixers', icon: '🚰', sub: 'Leak fixes' },
      { key: 'TOILET', title: 'Toilet & Flush', icon: '🚽', sub: 'Sanitary' },
      { key: 'BLOCKAGE', title: 'Blockages & Drains', icon: '🌀', sub: 'Unclogging' }
    ],
    sections: [
      {
        id: 'PURIFIER',
        title: 'Water Purifier (RO)',
        subtitle: 'Filter change, sediment flush, RO membrane service, and UV lamp repair',
        bannerBadge: 'Pure Water Guarantee',
        bannerTitle: 'Certified RO Service & TDS Check',
        bannerSubtitle: 'NSF-certified food-grade activated carbon and reverse osmosis membranes',
        items: [
          {
            id: 'plumb-ro-service',
            name: 'Water Purifier RO Routine Service',
            rating: 4.89,
            reviews: '1.4M',
            price: 499,
            originalPrice: 699,
            duration: '1 hr',
            description: 'Complete filter flushing, sediment replacement, and digital TDS calibration.'
          },
          {
            id: 'plumb-ro-membrane',
            name: 'RO Membrane & Carbon Filter Overhaul',
            rating: 4.86,
            reviews: '820K',
            price: 1899,
            originalPrice: 2499,
            duration: '1 hr 30 mins',
            description: 'Replacement of high-TDS membrane with genuine 75/100 GPD film and post-carbon.'
          }
        ]
      },
      {
        id: 'TAPS',
        title: 'Taps & Mixers',
        subtitle: 'Dripping tap repair, wall mixer spindle replacement, and angle cock fixes',
        items: [
          {
            id: 'plumb-tap-rep',
            name: 'Tap / Mixer Repair & Spindle Replacement',
            rating: 4.82,
            reviews: '1.1M',
            price: 199,
            originalPrice: 299,
            duration: '30 mins',
            description: 'Fix persistent dripping, replace worn brass washer or ceramic disc spindle.'
          },
          {
            id: 'plumb-mixer-install',
            name: 'Wall Mixer / Shower Column Installation',
            rating: 4.87,
            reviews: '490K',
            price: 399,
            originalPrice: 549,
            duration: '45 mins',
            description: 'Hot & cold mixer body mounting with teflon thread sealant and flange.'
          }
        ]
      },
      {
        id: 'BLOCKAGE',
        title: 'Blockages & Drains',
        subtitle: 'Kitchen sink drain unblocking, bathroom floor trap clearing, and siphon repair',
        items: [
          {
            id: 'plumb-drain-unclog',
            name: 'Sink & Washbasin Drain Unclogging',
            rating: 4.81,
            reviews: '780K',
            price: 349,
            originalPrice: 499,
            duration: '45 mins',
            description: 'Mechanical spring snake clearance of grease, food particles, and hair sludge.'
          }
        ]
      }
    ]
  },

  'bathroom-kitchen': {
    id: 'bathroom-kitchen',
    title: 'Bathroom & Kitchen Cleaning',
    breadcrumbCategory: 'Deep cleaning & sanitization',
    rating: 4.76,
    bookingsCount: '6.8 M bookings',
    warrantyText: 'Hospital-grade eco-disinfectants • Stains removal guarantee',
    badgeText: 'COOPERATIVE HYGIENE SQUAD',
    copilotBadge: 'DESCALING PROTOCOL',
    copilotTitle: 'High-RPM mechanized rotary scrub',
    copilotDescription: 'Removes 99.4% hard water stains, grout grime, and kitchen oil grease without damaging tile glazing.',
    deviceTitle: 'SS-STERILE v2.0',
    deviceLines: ['DESCALING LEVEL: 99.4%', 'ECO-DISINFECTANT: PH 7.0 SAFE', 'UV SURFACE SCORE: 98/100'],
    subCategories: [
      { key: 'BATHROOM', title: 'Bathroom Scrub', icon: '🧼', sub: 'Tile descaling' },
      { key: 'KITCHEN', title: 'Kitchen Scrub', icon: '🍳', sub: 'Degreasing' },
      { key: 'COMBO', title: 'Bath + Kitchen Combo', icon: '✨', sub: 'Best Value' }
    ],
    sections: [
      {
        id: 'BATHROOM',
        title: 'Bathroom Scrub',
        subtitle: 'Hard water tile descaling, toilet bowl sanitization, and mirror buffing',
        bannerBadge: 'Intense Clean',
        bannerTitle: 'Rotary Tile Machine Buffing',
        bannerSubtitle: 'Heavy duty rotary brushes remove calcium scale from floor & shower glass',
        items: [
          {
            id: 'bath-1',
            name: 'Intense Bathroom Cleaning (1 Bathroom)',
            rating: 4.78,
            reviews: '1.8M',
            price: 399,
            originalPrice: 599,
            duration: '1 hr 15 mins',
            description: 'Tiles, WC, washbasin, taps, shower fittings, and floor mechanized scrub.'
          },
          {
            id: 'bath-2',
            name: 'Intense Bathroom Cleaning (2 Bathrooms)',
            rating: 4.85,
            reviews: '2.1M',
            price: 699,
            originalPrice: 999,
            duration: '2 hrs',
            description: 'Cooperative 2-person squad cleans master & common bathrooms simultaneously.'
          }
        ]
      },
      {
        id: 'KITCHEN',
        title: 'Kitchen Scrub',
        subtitle: 'Degreasing platform, wall tiles, sink sanitization, and chimney exterior wipe',
        items: [
          {
            id: 'kitchen-deep',
            name: 'Full Kitchen Deep Cleaning & Degreasing',
            rating: 4.81,
            reviews: '920K',
            price: 899,
            originalPrice: 1299,
            duration: '2 hrs 30 mins',
            description: 'Exhaustive grease removal from slabs, cabinets, chimney hood, and sink trap.'
          }
        ]
      }
    ]
  },

  'full-cleaning': {
    id: 'full-cleaning',
    title: 'Full Home Cleaning',
    breadcrumbCategory: 'Deep cleaning & sanitization',
    rating: 4.84,
    bookingsCount: '4.5 M bookings',
    warrantyText: 'Insured against accidental damage • 3-4 member cooperative team',
    badgeText: 'COOPERATIVE PROFESSIONAL SQUAD',
    copilotBadge: 'HEPA VACUUM AUDIT',
    copilotTitle: 'Industrial mechanized cleaning protocol',
    copilotDescription: 'Full floor scrubbing with Taski single-disc machines, HEPA dry & wet vacuuming, window channel wash, and balcony buffing.',
    deviceTitle: 'SS-CLEAN v4.0',
    deviceLines: ['CREW SIZE: 3 SHRAMIKS', 'EQUIPMENT: TASKI SINGLE-DISC + HEPA', 'PARTICULATE REDUCTION: 99%'],
    subCategories: [
      { key: 'APARTMENT', title: 'Apartments', icon: '🏢', sub: '1-3 BHK' },
      { key: 'SOFA', title: 'Sofa & Carpet', icon: '🛋️', sub: 'Shampoo' },
      { key: 'BALCONY', title: 'Balcony & Windows', icon: '🪟', sub: 'High pressure' }
    ],
    sections: [
      {
        id: 'APARTMENT',
        title: 'Apartments',
        subtitle: 'Complete ceiling-to-floor deep mechanized sanitization',
        bannerBadge: 'Full House Makeover',
        bannerTitle: 'Multi-Room Deep Scrub',
        bannerSubtitle: 'Includes bathrooms, kitchen, bedrooms, living area, and balcony',
        items: [
          {
            id: 'home-1bhk',
            name: '1 BHK Full Home Deep Cleaning',
            rating: 4.82,
            reviews: '640K',
            price: 1499,
            originalPrice: 1999,
            duration: '3 hrs',
            description: 'Mechanized floor buffing, all room dusting, 1 kitchen and 1 bathroom deep scrub.'
          },
          {
            id: 'home-2bhk',
            name: '2 BHK Full Home Deep Cleaning',
            rating: 4.85,
            reviews: '1.2M',
            price: 2299,
            originalPrice: 2899,
            duration: '4-5 hrs',
            description: '3-member crew: 2 bathrooms, 1 kitchen, living room, bedrooms, and balcony wash.'
          },
          {
            id: 'home-3bhk',
            name: '3 BHK Full Home Deep Cleaning',
            rating: 4.88,
            reviews: '980K',
            price: 2999,
            originalPrice: 3799,
            duration: '5-6 hrs',
            description: '4-member team with industrial wet vacuum and single-disc rotary scrubbers.'
          }
        ]
      }
    ]
  },

  'smart-locks': {
    id: 'smart-locks',
    title: 'Carpenter & Smart Locks',
    breadcrumbCategory: 'Woodwork & home security',
    rating: 4.80,
    bookingsCount: '5.1 M bookings',
    warrantyText: 'Precision alignment & 30 days wood adjustment guarantee',
    badgeText: 'COOPERATIVE MASTER CARPENTERS',
    copilotBadge: 'LASER ALIGNMENT',
    copilotTitle: 'Digital mortise lock calibration',
    copilotDescription: 'Digital laser leveling ensures zero latch friction, weather-resistant deadbolt seating, and fingerprint sensor calibration.',
    deviceTitle: 'SS-CARPENTER v2.1',
    deviceLines: ['DOOR MARGIN: 2.5MM (OPTIMAL)', 'BOLT PENETRATION: 24MM', 'FINGERPRINT RESPONSE: <0.3S'],
    subCategories: [
      { key: 'LOCKS', title: 'Smart Locks', icon: '🔐', sub: 'Biometric' },
      { key: 'REPAIR', title: 'Furniture Repair', icon: '🪑', sub: 'Hinges & squeaks' },
      { key: 'ASSEMBLY', title: 'Furniture Assembly', icon: '🛏️', sub: 'IKEA & custom' }
    ],
    sections: [
      {
        id: 'LOCKS',
        title: 'Smart Locks',
        subtitle: 'Digital biometric lock installation, mortise carving, and latch strike alignment',
        bannerBadge: 'Home Security',
        bannerTitle: 'Precision Mortise Installation',
        bannerSubtitle: 'Compatible with Yale, Godrej, Ozone, Philips, and Qubo digital locks',
        items: [
          {
            id: 'carp-smart-lock',
            name: 'Digital Smart Door Lock Installation',
            rating: 4.91,
            reviews: '410K',
            price: 699,
            originalPrice: 999,
            duration: '1 hr 30 mins',
            description: 'Precision door slotting, spindle fitting, battery connection, and RFID/app setup.'
          },
          {
            id: 'carp-door-handle',
            name: 'Mortise Lock / Door Handle Replacement',
            rating: 4.83,
            reviews: '550K',
            price: 299,
            originalPrice: 449,
            duration: '45 mins',
            description: 'Fit new brass/steel mortise latch mechanism and handle pair.'
          }
        ]
      },
      {
        id: 'REPAIR',
        title: 'Furniture Repair',
        subtitle: 'Hydraulic soft-close hinges, drawer runners, and loose cabinet doors',
        items: [
          {
            id: 'carp-hinge-rep',
            name: 'Hydraulic Soft-Close Hinge Replacement (Pair)',
            rating: 4.80,
            reviews: '620K',
            price: 249,
            originalPrice: 349,
            duration: '30 mins',
            description: 'Replace squeaky or loose cabinet hinge with self-closing hydraulic hinges.'
          }
        ]
      }
    ]
  },

  'washing-machine': {
    id: 'washing-machine',
    title: 'Washing Machine Repair',
    breadcrumbCategory: 'Appliance repair & service',
    rating: 4.75,
    bookingsCount: '3.8 M bookings',
    warrantyText: '30 days repair warranty • Genuine motor & PCB spares',
    badgeText: 'COOPERATIVE CERTIFIED TECHNICIANS',
    copilotBadge: 'DIGITAL MOTOR TEST',
    copilotTitle: 'Inverter drive & drain pump diagnosis',
    copilotDescription: 'Digital multimeter and tachometer diagnostics check motor windings, spin cycle balance, and inlet valve solenoids.',
    deviceTitle: 'SS-WASH v1.8',
    deviceLines: ['DRUM RPM: 1200 (NOMINAL)', 'PUMP CURRENT: 0.4A', 'ERROR CODE: E04 CLEARED'],
    subCategories: [
      { key: 'REPAIR', title: 'Repair & Noise', icon: '🧺', sub: 'Vibration' },
      { key: 'SERVICE', title: 'Tub Descale', icon: '🫧', sub: 'Deep wash' }
    ],
    sections: [
      {
        id: 'REPAIR',
        title: 'Repair & Noise',
        subtitle: 'Fix spinning issues, water drainage failure, PCB errors, and heavy vibrations',
        items: [
          {
            id: 'wm-diag',
            name: 'Washing Machine Check-up & Diagnosis',
            rating: 4.76,
            reviews: '720K',
            price: 299,
            originalPrice: 499,
            duration: '45 mins',
            description: 'Comprehensive check for front load or top load washing machines.'
          },
          {
            id: 'wm-motor',
            name: 'Drain Pump / Inlet Solenoid Replacement',
            rating: 4.82,
            reviews: '340K',
            price: 649,
            originalPrice: 899,
            duration: '1 hr',
            description: 'Fix OE error or water not filling/draining issues with authentic parts.'
          }
        ]
      }
    ]
  },

  chimney: {
    id: 'chimney',
    title: 'Chimney Repair & Service',
    breadcrumbCategory: 'Appliance repair & service',
    rating: 4.79,
    bookingsCount: '2.1 M bookings',
    warrantyText: '30 days warranty • Deep baffle degreasing',
    badgeText: 'COOPERATIVE KITCHEN APPLIANCE TEAM',
    copilotBadge: 'SUCTION AIRFLOW AUDIT',
    copilotTitle: 'CFM suction power & motor check',
    copilotDescription: 'Anemometer test to measure exact suction airflow before and after baffle filter cleaning.',
    deviceTitle: 'SS-AIR v2.2',
    deviceLines: ['SUCTION: 1250 M3/HR (OPTIMAL)', 'MOTOR DECIBELS: 58DB (QUIET)'],
    subCategories: [
      { key: 'CLEAN', title: 'Deep Cleaning', icon: '🪶', sub: 'Degrease' },
      { key: 'REPAIR', title: 'Motor & Touch', icon: '⚡', sub: 'PCB fix' }
    ],
    sections: [
      {
        id: 'CLEAN',
        title: 'Deep Cleaning',
        subtitle: 'Baffle filter soaking, blower wheel degreasing, and carbon filter inspection',
        items: [
          {
            id: 'chim-clean-std',
            name: 'Kitchen Chimney Deep Cleaning',
            rating: 4.84,
            reviews: '610K',
            price: 549,
            originalPrice: 799,
            duration: '1 hr',
            description: 'Chemical degreasing of mesh/baffle filters, rotor impeller, and outer canopy.'
          }
        ]
      }
    ]
  },

  geyser: {
    id: 'geyser',
    title: 'Geyser Service & Repair',
    breadcrumbCategory: 'Appliance repair & service',
    rating: 4.81,
    bookingsCount: '4.2 M bookings',
    warrantyText: '30 days warranty • High pressure thermostat safety',
    badgeText: 'COOPERATIVE ELECTRICAL APPLIANCE TEAM',
    copilotBadge: 'THERMOSTAT & TANK TEST',
    copilotTitle: 'Immersion heating coil & earth leakage audit',
    copilotDescription: 'Testing heating element resistance and automatic thermal cutout to prevent electric shocks in bathroom.',
    deviceTitle: 'SS-THERM v3.0',
    deviceLines: ['HEATING COIL: 24.2Ω (HEALTHY)', 'EARTH LEAKAGE: 0.0MA (SAFE)', 'CUTOFF TEMP: 65°C'],
    subCategories: [
      { key: 'REPAIR', title: 'Heating Issues', icon: '🔥', sub: 'Coil repair' },
      { key: 'SERVICE', title: 'Tank Descaling', icon: '🛁', sub: 'Rust removal' }
    ],
    sections: [
      {
        id: 'REPAIR',
        title: 'Heating Issues',
        subtitle: 'Fix no hot water, geyser tripping MCB, or thermostat failure',
        items: [
          {
            id: 'gey-check',
            name: 'Geyser Check-up & Diagnosis',
            rating: 4.80,
            reviews: '820K',
            price: 249,
            originalPrice: 399,
            duration: '30 mins',
            description: 'Identify if heating element, thermostat, or tank pressure valve needs replacement.'
          },
          {
            id: 'gey-descale',
            name: 'Geyser Tank Descaling & Element Change',
            rating: 4.87,
            reviews: '490K',
            price: 499,
            originalPrice: 699,
            duration: '1 hr',
            description: 'Drain tank, remove hard water calcium slabs, and fit new copper heating coil.'
          }
        ]
      }
    ]
  },

  refrigerator: {
    id: 'refrigerator',
    title: 'Refrigerator Repair',
    breadcrumbCategory: 'Appliance repair & service',
    rating: 4.77,
    bookingsCount: '3.1 M bookings',
    warrantyText: '30 days warranty • Genuine compressor & gas charging',
    badgeText: 'COOPERATIVE APPLIANCE EXPERTS',
    copilotBadge: 'COMPRESSOR AMP & GAS TEST',
    copilotTitle: 'Cooling coil & defrost cycle audit',
    copilotDescription: 'Digital manifold gauge inspection of suction pressure and defrost thermostat sensor calibration.',
    deviceTitle: 'SS-FROST v1.5',
    deviceLines: ['COMPRESSOR: 0.8A (NORMAL)', 'FREEZER TEMP: -18°C', 'CONDENSER: CLEAN'],
    subCategories: [
      { key: 'REPAIR', title: 'Cooling Issues', icon: '🧊', sub: 'Compressor' },
      { key: 'GAS', title: 'Gas Charging', icon: '🧪', sub: 'R600a/R134a' }
    ],
    sections: [
      {
        id: 'REPAIR',
        title: 'Cooling Issues',
        subtitle: 'Fix ice build-up in frost-free fridges, water leaking, or fridge not cooling',
        items: [
          {
            id: 'fridge-diag',
            name: 'Single / Double Door Refrigerator Check-up',
            rating: 4.79,
            reviews: '760K',
            price: 299,
            originalPrice: 499,
            duration: '45 mins',
            description: 'Diagnostic of relay, overload protector, fan motor, and thermostat.'
          },
          {
            id: 'fridge-gas',
            name: 'Refrigerant Gas Charging & Leak Weld',
            rating: 4.83,
            reviews: '310K',
            price: 1899,
            originalPrice: 2299,
            duration: '2 hrs',
            description: 'Nitrogen leak test, capillary flush, filter drier replacement, and R-600a gas charging.'
          }
        ]
      }
    ]
  },
  maid: {
    id: 'maid',
    title: 'Maid & Domestic Help',
    breadcrumbCategory: 'Domestic Services',
    rating: 4.88,
    bookingsCount: '4.2M',
    warrantyText: '100% Aadhaar KYC & Police Verified Shramiks',
    badgeText: 'COOPERATIVE DOMESTIC FEDERATION',
    copilotBadge: 'BACKGROUND & HEALTH SCREENED',
    copilotTitle: 'Verified & trustworthy domestic shramiks',
    copilotDescription: 'Trained through Maharashtra Shramik Mahamandal with periodic health checks and standard wage protection.',
    deviceReadout: 'POLICE NOC: VERIFIED ✓ | HEALTH SCREENING: FIT (ANNUAL) | SHIFT: FLEXIBLE / RECURRENT',
    subCategories: [
      {
        key: 'HOUSEKEEPING',
        name: 'Daily Housekeeping',
        icon: '🧹',
        desc: 'Sweeping, mopping, dusting',
        items: [
          {
            id: 'maid-mop',
            name: 'Daily Floor Mopping & Dusting (1-2 BHK)',
            rating: 4.87,
            reviews: '2.1M',
            price: 199,
            originalPrice: 299,
            duration: '1 hr',
            description: 'Deep sweeping, wet microfiber mopping with disinfectant, and surface dusting.'
          },
          {
            id: 'maid-vessels',
            name: 'Deep Vessel Washing & Utensils Clean',
            rating: 4.85,
            reviews: '1.4M',
            price: 149,
            originalPrice: 249,
            duration: '45 mins',
            description: 'Sink scrub, degreasing of pots, pans, and spotless hygienic utensil dry rack stacking.'
          },
          {
            id: 'maid-fullday',
            name: 'Full Day Domestic Housekeeping (8 Hours)',
            rating: 4.91,
            reviews: '640K',
            price: 799,
            originalPrice: 1099,
            duration: '8 hrs',
            description: 'Comprehensive day support: mopping, laundry folding, kitchen assistance, and continuous upkeep.'
          }
        ]
      },
      {
        key: 'COOKING',
        name: 'Home Cooking',
        icon: '🍲',
        desc: 'Fresh home meal preparation',
        items: [
          {
            id: 'maid-cook-meal',
            name: 'Home Cook (Lunch or Dinner - up to 4 persons)',
            rating: 4.89,
            reviews: '890K',
            price: 349,
            originalPrice: 499,
            duration: '1.5 hrs',
            description: 'Authentic homely food: Roti/Chapati, Dal, Rice, and two Sabzis as per your recipe preference.'
          },
          {
            id: 'maid-cook-festive',
            name: 'Festive / Party Meal Preparation (up to 10 persons)',
            rating: 4.93,
            reviews: '320K',
            price: 899,
            originalPrice: 1299,
            duration: '3 hrs',
            description: 'Multi-course menu preparation for family gatherings, festivals, or pujas.'
          }
        ]
      }
    ]
  },
  caregiver: {
    id: 'caregiver',
    title: 'Caregivers & Elderly Assistance',
    breadcrumbCategory: 'Healthcare Services',
    rating: 4.92,
    bookingsCount: '1.8M',
    warrantyText: 'Certified Patient Care Attendants with First Aid & CPR',
    badgeText: 'COOPERATIVE HEALTHCARE NETWORK',
    copilotBadge: 'GERIATRIC CARE PROTOCOL',
    copilotTitle: 'Dignified & empathetic elder care',
    copilotDescription: 'Trained in mobility assistance, vital signs logging, medicine schedules, and patient hygiene.',
    deviceReadout: 'VITAL SIGNS LOG: BP, SPO2, GLUCOSE | CPR CERTIFIED: YES | MEDICATION ADHERENCE: 100%',
    subCategories: [
      {
        key: 'ELDERLY',
        name: 'Senior Citizen Care',
        icon: '🩺',
        desc: 'Companionship & mobility',
        items: [
          {
            id: 'cg-halfday',
            name: 'Senior Citizen Daily Companion (4 Hours)',
            rating: 4.93,
            reviews: '820K',
            price: 499,
            originalPrice: 699,
            duration: '4 hrs',
            description: 'Assisted walking, medicine reminders, meal serving, vital signs monitoring, and active companionship.'
          },
          {
            id: 'cg-fullday',
            name: 'Senior Citizen Day Care (8 Hours)',
            rating: 4.95,
            reviews: '610K',
            price: 899,
            originalPrice: 1299,
            duration: '8 hrs',
            description: 'Full day attentive bedside assistance, personal grooming, exercise accompaniment, and companionship.'
          },
          {
            id: 'cg-24hr',
            name: '24-Hour Residential Bedside Caregiver',
            rating: 4.96,
            reviews: '240K',
            price: 1799,
            originalPrice: 2499,
            duration: '24 hrs',
            description: 'Round-the-clock specialized bedside nursing support for bedridden or recuperating seniors.'
          }
        ]
      },
      {
        key: 'RECOVERY',
        name: 'Post-Op & Mother Care',
        icon: '👶',
        desc: 'Specialized recovery assistance',
        items: [
          {
            id: 'cg-postop',
            name: 'Post-Operative Recovery Attendant (4 Hours)',
            rating: 4.91,
            reviews: '340K',
            price: 599,
            originalPrice: 849,
            duration: '4 hrs',
            description: 'Post-surgical assistance, surgical dressing hygiene supervision, and gentle rehabilitation.'
          },
          {
            id: 'cg-mother',
            name: 'New Mother & Infant Care Attendant (4 Hours)',
            rating: 4.94,
            reviews: '290K',
            price: 699,
            originalPrice: 999,
            duration: '4 hrs',
            description: 'Postnatal care, gentle baby massage, feeding support, and mother relaxation assistance.'
          }
        ]
      }
    ]
  },
  driver: {
    id: 'driver',
    title: 'Drivers on Demand',
    breadcrumbCategory: 'Transport Services',
    rating: 4.85,
    bookingsCount: '3.1M',
    warrantyText: 'Commercial Badge & Zero-Violation Verified Chauffeurs',
    badgeText: 'PUNE DISTRICT DRIVERS COOPERATIVE',
    copilotBadge: 'RTO COMMERCIAL BADGE AUDIT',
    copilotTitle: 'Professional chauffeurs for your personal car',
    copilotDescription: 'Expert drivers for manual and automatic cars, thoroughly vetted with verified driving license and police records.',
    deviceReadout: 'DRIVING EXPERIENCE: 8+ YRS | CAR TYPES: MANUAL & AUTOMATIC (EV READY) | SAFETY RATING: 5/5',
    subCategories: [
      {
        key: 'CITY',
        name: 'City Drives',
        icon: '🚗',
        desc: 'Hourly city chauffeur',
        items: [
          {
            id: 'drv-2hr',
            name: 'City Drive - 2 Hours (Within Pune / PCMC)',
            rating: 4.84,
            reviews: '1.2M',
            price: 299,
            originalPrice: 449,
            duration: '2 hrs',
            description: 'Relax in traffic. Professional driver navigates your car for shopping, dining, or errands.'
          },
          {
            id: 'drv-4hr',
            name: 'City Drive - 4 Hours',
            rating: 4.86,
            reviews: '980K',
            price: 499,
            originalPrice: 699,
            duration: '4 hrs',
            description: 'Multiple city stops, office visits, or family hospital visits without parking hassles.'
          },
          {
            id: 'drv-8hr',
            name: 'Full Day City Duty (8 Hours)',
            rating: 4.88,
            reviews: '620K',
            price: 849,
            originalPrice: 1199,
            duration: '8 hrs',
            description: 'Dedicated professional driver at your service for full day city travel.'
          }
        ]
      },
      {
        key: 'OUTSTATION',
        name: 'Outstation Travel',
        icon: '🛣️',
        desc: 'Highway & hill driving experts',
        items: [
          {
            id: 'drv-mumbai',
            name: 'Pune to Mumbai / Navi Mumbai Expressway Round-Trip',
            rating: 4.89,
            reviews: '410K',
            price: 1499,
            originalPrice: 1999,
            duration: '12 hrs',
            description: 'Safe highway expressway driving with ghat experience. Return same day included.'
          },
          {
            id: 'drv-lonavala',
            name: 'Pune to Lonavala / Mahabaleshwar Weekend Trip',
            rating: 4.91,
            reviews: '280K',
            price: 1899,
            originalPrice: 2499,
            duration: '24 hrs',
            description: 'Ghat and hill station driving expert for weekend family getaways.'
          }
        ]
      }
    ]
  },
  gardening: {
    id: 'gardening',
    title: 'Gardening & Landscaping',
    breadcrumbCategory: 'Outdoor & Horticulture',
    rating: 4.79,
    bookingsCount: '950K',
    warrantyText: 'Certified Malis & Organic Plant Care Guarantee',
    badgeText: 'COOPERATIVE HORTICULTURE GUILD',
    copilotBadge: 'ORGANIC BOTANICAL PROTOCOL',
    copilotTitle: 'Lush greenery & healthy plants',
    copilotDescription: 'Professional gardening, hedge pruning, lawn maintenance, and pest-free organic soil treatment.',
    deviceReadout: 'PRUNING TECHNIQUE: HORTICULTURE CERTIFIED | SOIL PH BALANCING: ORGANIC VERMICOMPOST',
    subCategories: [
      {
        key: 'LAWN',
        name: 'Lawn & Pruning',
        icon: '🌱',
        desc: 'Mowing and plant grooming',
        items: [
          {
            id: 'gdn-mow',
            name: 'Garden Lawn Mowing & Weed Extraction (up to 500 sq ft)',
            rating: 4.78,
            reviews: '410K',
            price: 349,
            originalPrice: 499,
            duration: '1.5 hrs',
            description: 'Motorized lawn mower trimming, boundary edging, dead foliage clearing, and weed pulling.'
          },
          {
            id: 'gdn-prune',
            name: 'Ornamental Hedge Trimming & Shrub Shaping',
            rating: 4.82,
            reviews: '280K',
            price: 399,
            originalPrice: 599,
            duration: '1.5 hrs',
            description: 'Topiary shaping, removal of infested branches, and plant rejuvenation pruning.'
          }
        ]
      },
      {
        key: 'BALCONY',
        name: 'Balcony & Nutrition',
        icon: '🪴',
        desc: 'Potting and soil nourishment',
        items: [
          {
            id: 'gdn-repot',
            name: 'Balcony / Terrace Garden Setup & Repotting (up to 8 pots)',
            rating: 4.84,
            reviews: '310K',
            price: 499,
            originalPrice: 699,
            duration: '2 hrs',
            description: 'Root aeration, fresh vermicompost enrichment, pot drainage unclogging, and plant repotting.'
          },
          {
            id: 'gdn-pest',
            name: 'Organic Neem Oil Pest Spray & Foliar Feeding',
            rating: 4.81,
            reviews: '190K',
            price: 299,
            originalPrice: 449,
            duration: '45 mins',
            description: 'Treatment against mealybugs, aphids, and fungal leaf spot with child- and pet-safe organic spray.'
          }
        ]
      }
    ]
  },
  painting: {
    id: 'painting',
    title: 'Painting & Waterproofing',
    breadcrumbCategory: 'Home Renovation',
    rating: 4.83,
    bookingsCount: '2.4M',
    warrantyText: '1-Year Cooperative No-Peel Warranty on Emulsion Paint',
    badgeText: 'PUNE PAINTERS LABOUR COOPERATIVE',
    copilotBadge: 'DIGITAL MOISTURE METER AUDIT',
    copilotTitle: 'Flawless walls with laser-cut masking',
    copilotDescription: 'Trained cooperative painters equipped with mechanized sanders, moisture meters, and furniture drop sheets.',
    deviceReadout: 'WALL MOISTURE: 8% (DRY & READY) | COATS: 1 PRIMER + 2 ACRYLIC EMULSION | WARRANTY: 1 YEAR',
    subCategories: [
      {
        key: 'ROOMS',
        name: 'Interior Painting',
        icon: '🎨',
        desc: 'Walls, ceilings, and touchups',
        items: [
          {
            id: 'pnt-1room',
            name: 'Single Room Fresh Painting (Walls & Ceiling)',
            rating: 4.82,
            reviews: '1.1M',
            price: 1499,
            originalPrice: 1999,
            duration: '1 day',
            description: 'Putty touch-up, sanding with dustless sander, 1 coat primer, and 2 coats premium acrylic emulsion.'
          },
          {
            id: 'pnt-1bhk',
            name: '1 BHK Complete Home Interior Painting',
            rating: 4.85,
            reviews: '680K',
            price: 4999,
            originalPrice: 6499,
            duration: '2 days',
            description: 'Complete home makeover: living room, bedroom, kitchen, hallway with full floor masking protection.'
          },
          {
            id: 'pnt-accent',
            name: 'Festive Designer Accent Wall (Stencil or Texture)',
            rating: 4.89,
            reviews: '410K',
            price: 1199,
            originalPrice: 1599,
            duration: '4 hrs',
            description: 'Stunning feature wall with metallic, stucco, or geometric stencil finish.'
          }
        ]
      },
      {
        key: 'WATERPROOF',
        name: 'Waterproofing & Seepage',
        icon: '💧',
        desc: 'Dampness and crack repair',
        items: [
          {
            id: 'pnt-seepage',
            name: 'Wall Seepage & Dampness Polymer Treatment',
            rating: 4.84,
            reviews: '390K',
            price: 899,
            originalPrice: 1299,
            duration: '3 hrs',
            description: 'Chipping of flaked plaster, waterproof polymer coating, crack bridging, and anti-efflorescence seal.'
          }
        ]
      }
    ]
  },
  wellness: {
    id: 'wellness',
    title: 'Massage & Physiotherapy',
    breadcrumbCategory: 'Personal Care & Wellness',
    rating: 4.89,
    bookingsCount: '1.5M',
    warrantyText: 'Certified Physiotherapists & Ayush Practitioners',
    badgeText: 'COOPERATIVE WELLNESS GUILD',
    copilotBadge: 'HYGIENIC DISPOSABLE PROTOCOL',
    copilotTitle: 'Restorative therapy in the comfort of your home',
    copilotDescription: 'Experienced therapists bringing sanitized single-use sheets, cold-pressed ayurvedic oils, and acupressure tools.',
    deviceReadout: 'HYGIENE DISPOSABLE KIT: SEALED | OIL TYPE: AYURVEDIC COLD-PRESSED | PHYSIO ASSESSMENT: INCLUDED',
    subCategories: [
      {
        key: 'THERAPY',
        name: 'Pain Relief & Physio',
        icon: '💆',
        desc: 'Targeted muscle and joint relief',
        items: [
          {
            id: 'well-physio',
            name: 'Physiotherapy Session (Back, Knee, or Cervical Pain)',
            rating: 4.91,
            reviews: '620K',
            price: 499,
            originalPrice: 749,
            duration: '45 mins',
            description: 'Postural assessment, manual trigger-point therapy, therapeutic stretching, and home exercise guidance.'
          },
          {
            id: 'well-deep-tissue',
            name: 'Deep Tissue Stress Relief Massage (Full Body)',
            rating: 4.88,
            reviews: '510K',
            price: 799,
            originalPrice: 1199,
            duration: '60 mins',
            description: 'Deep pressure on muscle knots, tension release with warmed sesame herbal oil, and warm towel wipe.'
          }
        ]
      },
      {
        key: 'RELAX',
        name: 'Relaxation & Reflexology',
        icon: '🌿',
        desc: 'Head, shoulder, and foot care',
        items: [
          {
            id: 'well-head',
            name: 'Head, Neck & Shoulder Relaxing Therapy',
            rating: 4.87,
            reviews: '430K',
            price: 399,
            originalPrice: 599,
            duration: '30 mins',
            description: 'Acupressure head massage to alleviate headaches, screen fatigue, and shoulder stiffness.'
          },
          {
            id: 'well-foot',
            name: 'Foot Reflexology & Acupressure',
            rating: 4.90,
            reviews: '380K',
            price: 349,
            originalPrice: 499,
            duration: '30 mins',
            description: 'Foot soaking, reflex zone stimulation, and soothing calf massage to improve circulation.'
          }
        ]
      }
    ]
  },
  'pest-control': {
    id: 'pest-control',
    title: 'Pest Control Services',
    breadcrumbCategory: 'Cleaning & Sanitation',
    rating: 4.81,
    bookingsCount: '2.2M',
    warrantyText: '90-Day Free Retreatment Cooperative Guarantee',
    badgeText: 'COOPERATIVE PUBLIC HEALTH GUILD',
    copilotBadge: 'CIB&RC APPROVED HERBAL PROTOCOL',
    copilotTitle: '100% Odorless & child-safe pest eradication',
    copilotDescription: 'Government-certified technicians utilizing non-toxic herbal gel bait and targeted micro-sprays.',
    deviceReadout: 'TOXICITY: 0% FOR PETS & KIDS | EFFICACY: 90 DAYS REMNANT BARRIER | CIB APPROVED: YES',
    subCategories: [
      {
        key: 'COCKROACH',
        name: 'Cockroach & Ant Control',
        icon: '🪳',
        desc: 'Herbal gel treatment',
        items: [
          {
            id: 'pest-cockroach-1bhk',
            name: 'Cockroach & Ant Herbal Gel Treatment (1 BHK)',
            rating: 4.82,
            reviews: '1.2M',
            price: 499,
            originalPrice: 699,
            duration: '30 mins',
            description: 'Odorless herbal gel dots placed in cabinets, sink corners, and electrical conduits. No vacating required.'
          },
          {
            id: 'pest-cockroach-2bhk',
            name: 'Cockroach & Ant Herbal Gel Treatment (2-3 BHK)',
            rating: 4.84,
            reviews: '890K',
            price: 799,
            originalPrice: 1099,
            duration: '45 mins',
            description: 'Comprehensive kitchen, bathroom, and dining area herbal barrier with 90-day warranty.'
          }
        ]
      },
      {
        key: 'SPECIALIZED_PEST',
        name: 'Termite & Bed Bugs',
        icon: '🐜',
        desc: 'Deep barrier elimination',
        items: [
          {
            id: 'pest-termite',
            name: 'Termite Drill-Fill-Seal Chemical Barrier',
            rating: 4.86,
            reviews: '340K',
            price: 1299,
            originalPrice: 1799,
            duration: '2 hrs',
            description: 'Precision 12mm holes drilled at skirting junctions, pumped with termiticide, and sealed with matching chalk.'
          },
          {
            id: 'pest-bedbug',
            name: 'Bed Bug Two-Cycle Eradication (2 Visits)',
            rating: 4.79,
            reviews: '280K',
            price: 899,
            originalPrice: 1299,
            duration: '1.5 hrs',
            description: 'High-temperature steam treatment and residual spray to kill live bugs and newly hatched eggs.'
          }
        ]
      }
    ]
  }
};

export const ServiceCategoryDetailPage: React.FC<ServiceCategoryDetailPageProps> = ({
  categoryId,
  onBack,
  onSubmitBooking,
  cart,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  workers = []
}) => {
  const config = CATEGORY_DATA[categoryId] || CATEGORY_DATA.ac;

  const [activeSubTab, setActiveSubTab] = useState<string>(config.subCategories[0]?.key || 'SERVICE');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Filter verified workers matching this category / trade
  const matchedWorkers = (workers || []).filter(w => {
    const tradeLower = (w.trade || '').toLowerCase();
    const catLower = categoryId.toLowerCase();
    if (catLower === 'electrician' && tradeLower.includes('elec')) return true;
    if (catLower === 'plumbing' && tradeLower.includes('plumb')) return true;
    if (['ac', 'washing-machine', 'geyser', 'refrigerator', 'chimney'].includes(catLower) && (tradeLower.includes('appliance') || tradeLower.includes('elec'))) return true;
    if (catLower === 'smart-locks' && tradeLower.includes('carp')) return true;
    if (['full-cleaning', 'bathroom-kitchen', 'pest-control'].includes(catLower) && tradeLower.includes('clean')) return true;
    if (catLower === 'maid' && (tradeLower.includes('maid') || tradeLower.includes('clean') || tradeLower.includes('shramik'))) return true;
    if (catLower === 'caregiver' && (tradeLower.includes('care') || tradeLower.includes('health') || tradeLower.includes('nurse'))) return true;
    if (catLower === 'painting' && tradeLower.includes('paint')) return true;
    if (catLower === 'driver' && tradeLower.includes('driver')) return true;
    if (catLower === 'gardening' && tradeLower.includes('garden')) return true;
    if (catLower === 'wellness' && (tradeLower.includes('wellness') || tradeLower.includes('therapy'))) return true;
    return false;
  });
  const displayWorkers = matchedWorkers.length > 0 ? matchedWorkers : (workers || []).slice(0, 2);

  const deviceTitle = config.deviceTitle || 'SS-COPILOT v2.4';
  const deviceLines = config.deviceLines || (config.deviceReadout ? config.deviceReadout.split(' | ') : ['STATUS: VERIFIED ✓', 'DISPATCH: CO-OP CERTIFIED']);
  const displaySections = config.sections || config.subCategories.map(sub => ({
    id: sub.key,
    title: sub.title || sub.name || '',
    subtitle: sub.sub || sub.desc || '',
    bannerBadge: undefined,
    bannerTitle: undefined,
    bannerSubtitle: undefined,
    items: sub.items || []
  }));

  // Cart operations
  const addToCart = (item: { id: string; name: string; price: number; originalPrice?: number; duration: string; description: string }) => {
    onAddToCart({
      ...item,
      category: config.title
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    onUpdateQuantity(id, delta);
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // 4-way transparent split calculation
  const workerEarning = Math.round(totalAmount * 0.80);
  const coopShare = Math.round(totalAmount * 0.10);
  const welfareShare = Math.round(totalAmount * 0.06);
  const platformFee = totalAmount - workerEarning - coopShare - welfareShare;

  const handleProceedBooking = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    try {
      await onSubmitBooking({
        customerName: 'Rahul Sharma',
        customerPhone: '+91 98229 33445',
        serviceCategory: config.title,
        subTrade: cart.map(i => `${i.name} (x${i.quantity})`).join(', '),
        urgency: 'STANDARD',
        address: 'Flat 402, Mayur Residency, Kothrud, Pune 411038',
        preferredTime: 'Tomorrow, 10:00 AM',
        estimatedPrice: totalAmount,
        notes: `Selected ${totalItemsCount} services. Split: ₹${workerEarning} direct to technician, ₹${welfareShare} to PM-JAY welfare.`
      });
      onClearCart?.();
      alert(`${config.title} service booked successfully with local Pune Cooperative Society! Check your active booking tracker.`);
      onBack();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="space-y-8 pb-24 font-sans max-w-[1360px] mx-auto">
      
      {/* 1. Back Navigation & Header Breadcrumb */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onBack}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-slate-700 flex items-center gap-1.5 text-xs font-bold shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-semibold text-slate-500">{config.breadcrumbCategory}</span>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-extrabold text-slate-900">{config.title}</span>
      </div>

      {/* 2. Top Title & Diagnostic Readout Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sub-Header (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{config.title}</h1>
            <div className="flex items-center gap-1.5 text-xs mt-1 text-slate-600">
              <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px]">★</span>
              <span className="font-extrabold text-slate-900">{config.rating}</span>
              <span className="text-slate-400 font-medium">({config.bookingsCount})</span>
            </div>
          </div>

          {/* Warranty Cover Pill */}
          <div className="p-3 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                  {config.badgeText}
                </span>
                <p className="text-xs font-bold text-slate-800">{config.warrantyText}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* Select a Service Vertical Mini-Grid */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Select a service
            </span>

            <div className="grid grid-cols-2 gap-2">
              {config.subCategories.map((s) => (
                <button
                  key={s.key}
                  onClick={() => {
                    setActiveSubTab(s.key);
                    const el = document.getElementById(s.key);
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    activeSubTab === s.key
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl mb-1">{s.icon}</span>
                  <div>
                    <span className="text-xs font-bold leading-tight block">{s.title || s.name}</span>
                    <span className={`text-[10px] ${activeSubTab === s.key ? 'text-slate-300' : 'text-slate-400'}`}>
                      {s.sub || s.desc}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Verified Cooperative Workers for this Service */}
          {displayWorkers.length > 0 && (
            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified Local Shramiks
                </span>
                <span className="text-[10px] text-slate-400 font-bold">Pune Cooperative Pool</span>
              </div>
              
              <div className="space-y-2">
                {displayWorkers.slice(0, 2).map((w) => (
                  <div key={w._id} className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                      {w.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black text-slate-900 truncate">{w.name}</p>
                        <span className="text-[10px] font-extrabold text-amber-600">★ {w.customerRating || 4.9}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">
                        {w.experienceYears} yrs exp • {w.cooperativeName}
                      </p>
                      {w.verifiedSkills && w.verifiedSkills.length > 0 && (
                        <span className="inline-block text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-0.5 border border-emerald-100">
                          ✓ {w.verifiedSkills[0].name.slice(0, 32)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 text-center font-medium">
                Verified cooperative booking with doorstep OTP security
              </p>
            </div>
          )}

        </div>

        {/* Center/Right: Diagnostic Readout Banner */}
        <div className="lg:col-span-8">
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-50 via-slate-50 to-blue-50 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
            <div className="space-y-2 max-w-md z-10">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                {config.copilotBadge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {config.copilotTitle}
              </h2>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {config.copilotDescription}
              </p>
            </div>

            {/* Graphic of Handheld Diagnostic Device */}
            <div className="w-60 h-36 bg-slate-900 rounded-2xl shadow-xl border-4 border-slate-800 p-3 flex flex-col justify-between text-white flex-shrink-0 relative">
              <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400">
                <span>{deviceTitle}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <div className="bg-emerald-950/80 p-2 rounded-lg border border-emerald-500/30 text-emerald-300 font-mono text-xs space-y-0.5">
                {deviceLines.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
              <div className="text-[9px] text-slate-400 text-center font-bold">
                AUTHENTICATED CO-OP RECORD
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Main Split View: Services List on Left (8 cols) | Cart & Guarantee on Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
        
        {/* Left Column: Categorized Services List */}
        <div className="lg:col-span-8 space-y-10">
          
          {displaySections.map((section, sIdx) => (
            <div key={section.id} id={section.id} className={`space-y-4 ${sIdx > 0 ? 'pt-6 border-t border-slate-200' : ''}`}>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{section.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{section.subtitle}</p>
              </div>

              {section.bannerTitle && (
                <div className="rounded-2xl p-5 bg-gradient-to-r from-slate-100 to-emerald-50/50 border border-slate-200 flex items-center justify-between">
                  <div>
                    {section.bannerBadge && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md uppercase">
                        {section.bannerBadge}
                      </span>
                    )}
                    <h3 className="text-lg font-extrabold text-slate-900 mt-1">{section.bannerTitle}</h3>
                    <p className="text-xs text-slate-500">{section.bannerSubtitle}</p>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-3.5">
                {section.items.map((item) => {
                  const inCart = cart.find(i => i.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 max-w-lg">
                        <h4 className="text-sm font-extrabold text-slate-900">{item.name}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-extrabold text-slate-900">{item.rating}</span>
                          <span className="text-slate-400 text-[11px]">({item.reviews} reviews)</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500 font-medium text-[11px]">{item.duration}</span>
                        </div>

                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="text-base font-black text-slate-900">₹{item.price}</span>
                          <span className="text-xs text-slate-400 line-through">₹{item.originalPrice}</span>
                        </div>

                        <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center sm:flex-col justify-between sm:justify-center gap-2">
                        {inCart ? (
                          <div className="flex items-center gap-2 bg-slate-900 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-5 h-5 rounded hover:bg-slate-800 flex items-center justify-center font-black"
                            >
                              -
                            </button>
                            <span className="px-1">{inCart.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-5 h-5 rounded hover:bg-slate-800 flex items-center justify-center font-black"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            className="px-5 py-2 rounded-xl border border-purple-600 text-purple-700 hover:bg-purple-50 font-extrabold text-xs transition shadow-sm"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        </div>

        {/* Right Column: Cooperative Promise & Live Cart */}
        <div className="lg:col-span-4 space-y-6 sticky top-28">
          
          {/* Cooperative Promise Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Cooperative Promise
              </h3>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Quality Assured
              </span>
            </div>

            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">100% Skill India Certified Shramiks</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">Hassle-Free Direct Booking</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">Direct Verified Cooperative Booking</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">30 Days Cooperative Warranty</span>
              </li>
            </ul>
          </div>

          {/* Live Cart Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Your Booking Cart
            </h3>

            {cart.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  🛒
                </div>
                <p className="text-xs font-semibold">No items in your cart</p>
                <p className="text-[11px] text-slate-400">Select any service to view booking breakdown</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cart Items List */}
                <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1 text-xs">
                  {cart.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-[11px] text-slate-500">
                          ₹{item.price} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900">
                          ₹{item.price * item.quantity}
                        </span>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total & Service Assurance Preview */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-700">Total Payable:</span>
                    <span className="text-xl font-black text-slate-900">₹{totalAmount}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[11px] space-y-1 text-slate-600">
                    <div className="flex justify-between text-emerald-800 font-semibold">
                      <span>✓ Doorstep OTP Verification:</span>
                      <span>Included</span>
                    </div>
                    <div className="flex justify-between text-blue-700 font-semibold">
                      <span>✓ Certified Cooperative Technician:</span>
                      <span>Assigned</span>
                    </div>
                    <div className="flex justify-between text-purple-700 font-semibold">
                      <span>✓ Cooperative Guarantee:</span>
                      <span>30 Days Free Rework</span>
                    </div>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={handleProceedBooking}
                  disabled={isCheckingOut}
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-emerald-700 text-white font-extrabold text-xs transition shadow-md flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {isCheckingOut ? 'Matching Cooperative Technician...' : `Book Now • ₹${totalAmount}`}
                  </span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
