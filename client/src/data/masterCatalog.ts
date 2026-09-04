export interface MasterServiceItem {
  id: string;
  name: string;
  rating: number;
  reviewsCount?: string;
  price: number;
  originalPrice?: number;
  duration: string;
  description: string;
  inclusions?: string[];
  instant?: boolean;
  image?: string;
  rateLabel?: string;
  hideCostEstimate?: boolean;
}

export interface MasterSubTrade {
  id: string;
  title: string;
  icon?: string;
  tagline?: string;
  services: MasterServiceItem[];
}

export interface MasterSector {
  id: string;
  title: string;
  shortTitle: string;
  domain: 'HOME_SERVICES' | 'PROJECTS_CONTRACTS';
  iconName: string;
  rating: number;
  bookingsCount: string;
  coopName: string;
  regNo: string;
  shramiksAvailable: number;
  description: string;
  heroImage: string;
  subTradesList: string[];
  subTrades: MasterSubTrade[];
  bulkWorkforceOptions?: {
    trade: string;
    suggestedTeamSizes: number[];
    dailyRatePerWorker: number;
    description: string;
  }[];
}

export const MASTER_SECTORS: MasterSector[] = [
  // 1. HOME MAINTENANCE & REPAIR
  {
    id: 'home-maintenance',
    title: 'Home Maintenance & Repair',
    shortTitle: 'Home Maintenance',
    domain: 'HOME_SERVICES',
    iconName: 'Wrench',
    rating: 4.88,
    bookingsCount: '48,200+ bookings',
    coopName: 'Brihan-Pune Multi-Trade Nirman & Maintenance Sahakari',
    regNo: 'MAH/PNE/LBR/2018/0091',
    shramiksAvailable: 114,
    description: 'Certified electricians, plumbers, carpenters, painters, masons, roofers, and waterproofing artisans for complete residential maintenance.',
    heroImage: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=1000&q=80',
    subTradesList: ['Electrical', 'Plumbing', 'Carpentry', 'Painting', 'Masonry', 'Flooring & Tiling', 'Roofing', 'Waterproofing', 'General Repairs'],
    subTrades: [
      {
        id: 'electrical',
        title: 'Electrical',
        tagline: 'Installation, rewiring, switches, MCBs, inverter and fault diagnosis',
        services: [
          { id: 'elec-install', name: 'Electrical Installation', rating: 4.85, price: 299, duration: '45 mins', description: 'Complete installation of light fixtures, chandeliers, decorative lamps, and power lines.', instant: true },
          { id: 'elec-rewiring', name: 'Wiring & Rewiring', rating: 4.88, price: 1299, duration: '2-3 hrs', description: 'Complete concealed copper wiring with PVC conduits for heavy domestic appliances.' },
          { id: 'elec-switch', name: 'Switch & Socket Repair', rating: 4.80, price: 149, duration: '30 mins', description: 'Repair or replacement of burnt modular switches, 16A power plugs, and loose wiring contacts.', instant: true },
          { id: 'elec-fan', name: 'Fan Installation / Repair', rating: 4.86, price: 149, duration: '30 mins', description: 'Ceiling, exhaust, and wall fan mounting, regulator replacement, and speed balancing.', instant: true },
          { id: 'elec-light', name: 'Light Installation / Repair', rating: 4.82, price: 129, duration: '30 mins', description: 'LED downlight, cove lighting, batten tube light, and garden fixture fitting.', instant: true },
          { id: 'elec-mcb', name: 'MCB / Distribution Board', rating: 4.90, price: 499, duration: '1 hr', description: 'RCCB earth leakage protector installation, trip diagnosis, and main isolator overhaul.' },
          { id: 'elec-inverter', name: 'Inverter Installation', rating: 4.84, price: 699, duration: '1 hr 30 mins', description: 'Dedicated inverter line setup, battery terminal connection, and auto-cut calibration.' },
          { id: 'elec-fault', name: 'Electrical Fault Diagnosis', rating: 4.89, price: 199, duration: '45 mins', description: 'Digital multimeter inspection for line grounding, short circuits, and phase load imbalance.', instant: true }
        ]
      },
      {
        id: 'plumbing',
        title: 'Plumbing',
        tagline: 'Tap repair, pipe leaks, drainage, water tanks, pumps, and sanitary installation',
        services: [
          { id: 'plumb-tap', name: 'Tap & Faucet Repair', rating: 4.82, price: 149, duration: '30 mins', description: 'Fix dripping bib taps, mixer taps, basin faucets, and angle stop cocks.', instant: true },
          { id: 'plumb-leak', name: 'Pipe Leakage Repair', rating: 4.85, price: 299, duration: '45 mins', description: 'Concealed and external CPVC/UPVC pipe leak detection, joint welding, and repair.', instant: true },
          { id: 'plumb-drain', name: 'Drainage & Blockage Removal', rating: 4.88, price: 349, duration: '45 mins', description: 'Mechanical spring snaking for clogged kitchen sinks, washbasins, and bathroom gullies.', instant: true },
          { id: 'plumb-bath', name: 'Bathroom Plumbing', rating: 4.87, price: 499, duration: '1 hr 30 mins', description: 'Shower head, health faucet, diverter valve, and sanitary commode plumbing.' },
          { id: 'plumb-kitchen', name: 'Kitchen Plumbing', rating: 4.83, price: 399, duration: '1 hr', description: 'Sink drain manifold, RO water inlet connection, and dishwasher outlet line.' },
          { id: 'plumb-tank', name: 'Water Tank Plumbing', rating: 4.91, price: 599, duration: '2 hrs', description: 'Overhead PVC water tank inlet/outlet manifold, overflow line, and brass float valve.' },
          { id: 'plumb-pipe-install', name: 'Pipe Installation', rating: 4.86, price: 899, duration: '2 hrs 30 mins', description: 'New pipeline layout and piping extensions for bathrooms, kitchens, and balconies.' },
          { id: 'plumb-pump', name: 'Water Pump Repair', rating: 4.89, price: 549, duration: '1 hr 30 mins', description: 'Monobloc and submersible pressure pump capacitor, mechanical seal, and check valve fix.' }
        ]
      },
      {
        id: 'carpentry',
        title: 'Carpentry',
        tagline: 'Furniture repair, assembly, doors, windows, cabinets, wardrobes, and custom woodwork',
        services: [
          { id: 'carp-furniture-repair', name: 'Furniture Repair', rating: 4.83, price: 299, duration: '1 hr', description: 'Fix wobbly chairs, dining tables, sofa wooden frames, and broken wooden joints.' },
          { id: 'carp-assembly', name: 'Furniture Assembly', rating: 4.88, price: 599, duration: '2 hrs', description: 'Precision assembly of flat-pack beds, study desks, shoe racks, and bookshelves.' },
          { id: 'carp-door', name: 'Door Repair', rating: 4.84, price: 249, duration: '45 mins', description: 'Planer alignment for jamming doors, hinge lubrication, and stopper installation.', instant: true },
          { id: 'carp-window', name: 'Window Repair', rating: 4.80, price: 249, duration: '45 mins', description: 'Wooden window frame alignment, latch repair, and sliding channel fix.' },
          { id: 'carp-wardrobe', name: 'Cabinet & Wardrobe', rating: 4.87, price: 449, duration: '1 hr 30 mins', description: 'Hydraulic soft-close hinge replacement, drawer slider channel fitting, and lock change.' },
          { id: 'carp-bed', name: 'Bed & Table Repair', rating: 4.82, price: 399, duration: '1 hr', description: 'Hydraulic lift storage mechanism fix, headboard tightening, and ply replacement.' },
          { id: 'carp-custom', name: 'Custom Woodwork', rating: 4.92, price: 799, duration: 'Consultation', description: 'On-site measurement, modular interior woodwork estimates, and bespoke cabinetry design.' }
        ]
      },
      {
        id: 'painting',
        title: 'Painting',
        tagline: 'Interior, exterior, texture, ceiling, waterproof painting, and full repainting',
        services: [
          { id: 'paint-interior', name: 'Interior Painting', rating: 4.88, price: 2800, duration: '1-2 Days', description: 'Double coat acrylic washable emulsion with wall putty sanding and floor masking.' },
          { id: 'paint-exterior', name: 'Exterior Painting', rating: 4.91, price: 8500, duration: '2-4 Days', description: 'Weathercoat elastomeric anti-fungal exterior paint with scaffolding safety gear.' },
          { id: 'paint-wall', name: 'Wall Painting', rating: 4.85, price: 1499, duration: '1 Day', description: 'Single room accent wall or room refreshment painting.' },
          { id: 'paint-ceiling', name: 'Ceiling Painting', rating: 4.82, price: 1299, duration: '4 hrs', description: 'High-opacity brilliant white ceiling paint to eliminate soot and moisture patches.' },
          { id: 'paint-texture', name: 'Texture Painting', rating: 4.93, price: 3499, duration: '1 Day', description: 'Designer metallic, stucco, and roller texture designs for living rooms.' },
          { id: 'paint-waterproof', name: 'Waterproof Painting', rating: 4.90, price: 3999, duration: '1-2 Days', description: 'Elastomeric waterproofing coating to permanently stop wall dampness and peeling.' },
          { id: 'paint-repainting', name: 'Repainting', rating: 4.87, price: 4999, duration: '2-3 Days', description: 'Complete home touchup and repaint for tenant move-in or festival refresh.' }
        ]
      },
      {
        id: 'masonry',
        title: 'Masonry',
        tagline: 'Wall repair, brickwork, plastering, concrete, and minor civil works',
        services: [
          { id: 'mas-wall-repair', name: 'Wall Repair', rating: 4.83, price: 499, duration: '2 hrs', description: 'V-groove chipping, crack filling with polymer mortar, and smooth sand plaster coat.' },
          { id: 'mas-brickwork', name: 'Brickwork', rating: 4.87, price: 1499, duration: '4 hrs', description: 'Red clay brick or fly-ash AAC block partition masonry with cement mortar joints.' },
          { id: 'mas-plastering', name: 'Plastering', rating: 4.86, price: 999, duration: '3 hrs', description: 'Internal smooth neeru plaster or external sand-faced cement plastering.' },
          { id: 'mas-concrete', name: 'Concrete Work', rating: 4.89, price: 1299, duration: '3 hrs', description: 'Door threshold casting, concrete bed leveling, and small platform construction.' },
          { id: 'mas-civil-repairs', name: 'Minor Civil Repairs', rating: 4.85, price: 699, duration: '2 hrs', description: 'Chamber cover raising, drain gullies, balcony railing base grouting, and coping stones.' }
        ]
      },
      {
        id: 'flooring-tiling',
        title: 'Flooring & Tiling',
        tagline: 'Floor tile install, wall tiles, tile replacement, marble, granite, and floor repair',
        services: [
          { id: 'tile-floor-install', name: 'Floor Tile Installation', rating: 4.89, price: 1899, duration: '1 Day', description: 'Precision laying of vitrified and ceramic tiles with spacer leveling clips.' },
          { id: 'tile-wall-install', name: 'Wall Tile Installation', rating: 4.87, price: 1499, duration: '1 Day', description: 'Dado tile installation for kitchen platforms and bathroom shower areas.' },
          { id: 'tile-replacement', name: 'Tile Replacement', rating: 4.84, price: 699, duration: '3 hrs', description: 'Chipping cracked or hollow tiles, resetting on polymer adhesive, and epoxy grouting.' },
          { id: 'tile-marble', name: 'Marble Work', rating: 4.92, price: 2499, duration: '1-2 Days', description: 'Italian and Indian marble cutting, laying, diamond pad grinding, and mirror buffing.' },
          { id: 'tile-granite', name: 'Granite Work', rating: 4.90, price: 1999, duration: '1 Day', description: 'Kitchen granite platform cutting, double moulding, chamfering, and sink cutout.' },
          { id: 'tile-floor-repair', name: 'Floor Repair', rating: 4.82, price: 599, duration: '2 hrs', description: 'Re-grouting faded joints, fixing loose skirting, and leveling uneven tiles.' }
        ]
      },
      {
        id: 'roofing',
        title: 'Roofing',
        tagline: 'Roof repair, roof leakage, installation, and roof maintenance',
        services: [
          { id: 'roof-repair', name: 'Roof Repair', rating: 4.86, price: 999, duration: '3 hrs', description: 'Mangalore tile resetting, asbestos/cement sheet patching, and ridgeline sealing.' },
          { id: 'roof-leakage', name: 'Roof Leakage Solution', rating: 4.91, price: 1499, duration: '4 hrs', description: 'Sealing roof joints, flashing repairs, and downpipe drain clearing to stop seepage.' },
          { id: 'roof-install', name: 'Roof Installation', rating: 4.89, price: 4500, duration: '1-2 Days', description: 'Color-coated corrugated metal profile roofing and Polycarbonate sheet mounting.' },
          { id: 'roof-maintenance', name: 'Roof Maintenance', rating: 4.84, price: 799, duration: '2 hrs', description: 'Pre-monsoon roof inspection, gutter clearance, and waterproof sealant touch-ups.' }
        ]
      },
      {
        id: 'waterproofing',
        title: 'Waterproofing',
        tagline: 'Terrace, bathroom, wall, and basement waterproofing',
        services: [
          { id: 'wp-terrace', name: 'Terrace Waterproofing', rating: 4.93, price: 4999, duration: '1-2 Days', description: 'Multi-layer fiber-mesh elastomeric PU coating with 5-year cooperative warranty.' },
          { id: 'wp-bathroom', name: 'Bathroom Waterproofing', rating: 4.90, price: 2499, duration: '1 Day', description: 'Under-tile chemical barrier coating and sanitary trap junction seal.' },
          { id: 'wp-wall', name: 'Wall Waterproofing', rating: 4.88, price: 1899, duration: '1 Day', description: 'Efflorescence salt removal, moisture barrier injection, and anti-damp primer coat.' },
          { id: 'wp-basement', name: 'Basement Waterproofing', rating: 4.94, price: 5999, duration: '2 Days', description: 'High-pressure polyurethane injection grouting for underground water ingress.' }
        ]
      },
      {
        id: 'general-repairs',
        title: 'General Repairs',
        tagline: 'Drilling, curtain rods, fixture installation, and minor household repairs',
        services: [
          { id: 'gen-drilling', name: 'Drilling & Mounting', rating: 4.82, price: 99, duration: '30 mins', description: 'Hanging wall paintings, mirrors, key holders, clocks, and kitchen shelves.', instant: true },
          { id: 'gen-curtain', name: 'Curtain / Rod Installation', rating: 4.85, price: 149, duration: '45 mins', description: 'Curtain bracket drilling, rod leveling, and track runner installation.', instant: true },
          { id: 'gen-fixture', name: 'Fixture Installation', rating: 4.80, price: 199, duration: '45 mins', description: 'Towel rails, bathroom cabinets, soap dispensers, and corner glass shelves.' },
          { id: 'gen-minor', name: 'Minor Household Repairs', rating: 4.83, price: 249, duration: '1 hr', description: 'Handyman package covering multiple small fix-it tasks in a single visit.', instant: true }
        ]
      }
    ]
  },

  // 2. APPLIANCES & TECHNICAL SERVICES
  {
    id: 'appliances-technical',
    title: 'Appliances & Technical Services',
    shortTitle: 'Appliances & Technical',
    domain: 'HOME_SERVICES',
    iconName: 'Tv',
    rating: 4.87,
    bookingsCount: '42,900+ bookings',
    coopName: 'Maharashtra Tantrik & Upkaran Seva Sahakari',
    regNo: 'MAH/PNE/LBR/2019/0142',
    shramiksAvailable: 96,
    description: 'Expert technicians for AC, refrigeration, washing machines, TV & electronics, water RO, CCTV, Wi-Fi networking, solar, and kitchen appliances.',
    heroImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=80',
    subTradesList: ['Air Conditioning', 'Refrigeration', 'Washing Machines', 'Electronics', 'Water Purification', 'Security & Surveillance', 'Networking', 'Solar & Power', 'Other Appliances'],
    subTrades: [
      {
        id: 'ac',
        title: 'Air Conditioning',
        tagline: 'Installation, repair, servicing, gas refill, and maintenance',
        services: [
          { id: 'ac-install', name: 'AC Installation', rating: 4.88, price: 1199, duration: '2 hrs', description: 'Split/window AC mounting, bracket installation, copper piping, and flare vacuuming.' },
          { id: 'ac-repair', name: 'AC Repair', rating: 4.85, price: 349, duration: '1 hr', description: 'Diagnostic inspection for cooling loss, water dripping, loud compressor, and PCB issues.', instant: true },
          { id: 'ac-servicing', name: 'AC Servicing', rating: 4.89, price: 499, duration: '1 hr 15 mins', description: 'Deep foam pressure jet wash for indoor cooling coils and outdoor condenser fins.', instant: true },
          { id: 'ac-gas-refill', name: 'AC Gas Refill', rating: 4.86, price: 2499, duration: '2 hrs', description: 'Full nitrogen leak test, vacuuming, and genuine R-32 or R-410A refrigerant charging.' },
          { id: 'ac-maintenance', name: 'AC Maintenance', rating: 4.82, price: 699, duration: '1 hr 30 mins', description: 'Comprehensive seasonal check-up, electrical amp draw test, and blower wheel degreasing.' }
        ]
      },
      {
        id: 'refrigeration',
        title: 'Refrigeration',
        tagline: 'Refrigerator repair, deep freezers, and commercial refrigerators',
        services: [
          { id: 'fridge-repair', name: 'Refrigerator Repair', rating: 4.84, price: 299, duration: '1 hr', description: 'Single/double door defrost heater, thermostat, relay, and cooling coil repair.', instant: true },
          { id: 'fridge-freezer', name: 'Deep Freezer Repair', rating: 4.88, price: 599, duration: '1 hr 30 mins', description: 'Chest and commercial vertical deep freezer thermostat and condenser fan fix.' },
          { id: 'fridge-commercial', name: 'Commercial Refrigerator', rating: 4.91, price: 899, duration: '2 hrs', description: 'Display coolers, under-counter chillers, and cold storage maintenance.' }
        ]
      },
      {
        id: 'washing-machines',
        title: 'Washing Machines',
        tagline: 'Repair, installation, and maintenance for top and front load',
        services: [
          { id: 'wm-repair', name: 'Washing Machine Repair', rating: 4.86, price: 349, duration: '1 hr', description: 'Fix spin drum errors, drainage pump clogs, noisy bearings, and PCB faults.', instant: true },
          { id: 'wm-install', name: 'Washing Machine Installation', rating: 4.82, price: 249, duration: '45 mins', description: 'Inlet hose tap adapter fitting, drain pipe routing, and leveling rubber feet.', instant: true },
          { id: 'wm-maintenance', name: 'Washing Machine Maintenance', rating: 4.85, price: 449, duration: '1 hr', description: 'Drum descaling with eco-friendly citrus solution, lint filter cleaning, and calibration.' }
        ]
      },
      {
        id: 'electronics',
        title: 'Electronics',
        tagline: 'TV repair, speaker repair, home theatre, and home electronics',
        services: [
          { id: 'elec-tv', name: 'TV Repair', rating: 4.84, price: 349, duration: '1 hr', description: 'LED/OLED TV backlight repair, display panel fix, motherboard component diagnosis.', instant: true },
          { id: 'elec-speaker', name: 'Speaker Repair', rating: 4.80, price: 249, duration: '45 mins', description: 'Bluetooth speaker driver repair, woofer cone reconing, and audio jack soldering.' },
          { id: 'elec-theatre', name: 'Home Theatre Setup', rating: 4.89, price: 699, duration: '1 hr 30 mins', description: '5.1 / 7.1 surround sound audio calibration, concealed cabling, and amplifier tuning.' },
          { id: 'elec-other', name: 'Other Electronics', rating: 4.79, price: 199, duration: '45 mins', description: 'Stabilizer, smart remote, setup box, and general household electronics repair.' }
        ]
      },
      {
        id: 'water-purification',
        title: 'Water Purification',
        tagline: 'RO installation, repair, servicing, and filter replacement',
        services: [
          { id: 'ro-install', name: 'RO Installation', rating: 4.87, price: 399, duration: '1 hr', description: 'Wall mounting, raw water diverter connection, drain saddle, and tank sanitization.', instant: true },
          { id: 'ro-repair', name: 'RO Repair', rating: 4.83, price: 249, duration: '45 mins', description: 'Booster pump fix, SV auto-cut valve replacement, and pure water flow restoration.', instant: true },
          { id: 'ro-servicing', name: 'RO Servicing', rating: 4.89, price: 349, duration: '1 hr', description: 'Complete system sanitization, TDS calibration, and pressure pump testing.', instant: true },
          { id: 'ro-filters', name: 'Filter Replacement', rating: 4.90, price: 799, duration: '1 hr', description: 'Genuine sediment filter, activated carbon block, and 80 GPD RO membrane change.' }
        ]
      },
      {
        id: 'security-surveillance',
        title: 'Security & Surveillance',
        tagline: 'CCTV installation, repair, DVR/NVR setup, and access control',
        services: [
          { id: 'cctv-install', name: 'CCTV Installation', rating: 4.88, price: 399, duration: '1 hr', description: 'Dome/Bullet camera mounting, coaxial/CAT6 cabling, and angle calibration.' },
          { id: 'cctv-repair', name: 'CCTV Repair', rating: 4.82, price: 299, duration: '45 mins', description: 'Video loss troubleshooting, night vision IR LED fix, and BNC connector replacement.', instant: true },
          { id: 'cctv-dvr', name: 'DVR/NVR Setup', rating: 4.86, price: 499, duration: '1 hr', description: 'Hard drive installation, mobile remote viewing setup, and motion alert config.' },
          { id: 'cctv-access', name: 'Access Control', rating: 4.91, price: 799, duration: '2 hrs', description: 'Biometric fingerprint reader, RFID card lock, and electromagnetic door strike setup.' }
        ]
      },
      {
        id: 'networking',
        title: 'Networking',
        tagline: 'Wi-Fi setup, router configuration, troubleshooting, and LAN cabling',
        services: [
          { id: 'net-wifi', name: 'Wi-Fi Setup', rating: 4.84, price: 299, duration: '45 mins', description: 'High-speed dual-band Wi-Fi router installation and home coverage optimization.', instant: true },
          { id: 'net-router', name: 'Router Configuration', rating: 4.81, price: 249, duration: '30 mins', description: 'SSID security password, guest network, parental controls, and DNS tuning.', instant: true },
          { id: 'net-troubleshoot', name: 'Network Troubleshooting', rating: 4.85, price: 299, duration: '45 mins', description: 'Fix frequent disconnects, IP address conflicts, and speed bottleneck issues.', instant: true },
          { id: 'net-lan', name: 'LAN Installation', rating: 4.88, price: 599, duration: '1 hr 30 mins', description: 'Structured CAT6 RJ45 ethernet cabling for gaming, work desks, and smart TVs.' }
        ]
      },
      {
        id: 'solar-power',
        title: 'Solar & Power',
        tagline: 'Solar installation, maintenance, inverter/battery, and solar water heaters',
        services: [
          { id: 'solar-install', name: 'Solar Installation', rating: 4.93, price: 2499, duration: '1 Day', description: 'On-grid rooftop solar panel mounting, string inverter wiring, and net meter setup.' },
          { id: 'solar-maint', name: 'Solar Maintenance', rating: 4.89, price: 799, duration: '2 hrs', description: 'De-ionized water high-pressure panel cleaning, MC4 connector test, and inverter log audit.' },
          { id: 'solar-inverter', name: 'Inverter/Battery Services', rating: 4.86, price: 399, duration: '1 hr', description: 'Tubular battery gravity test, distilled water top-up, and terminal grease treatment.', instant: true },
          { id: 'solar-heater', name: 'Solar Water Heater', rating: 4.88, price: 599, duration: '1 hr 30 mins', description: 'Evacuated tube descaling, sacrificial anode replacement, and backup electrical coil check.' }
        ]
      },
      {
        id: 'other-appliances',
        title: 'Other Appliances',
        tagline: 'Microwave, geyser, chimney, water heater, mixer/grinder, and dishwasher',
        services: [
          { id: 'app-microwave', name: 'Microwave Repair', rating: 4.82, price: 249, duration: '45 mins', description: 'Fix turntable motor, high-voltage fuse, door safety interlock, and magnetron.', instant: true },
          { id: 'app-geyser', name: 'Geyser Repair', rating: 4.86, price: 299, duration: '45 mins', description: 'Heating element coil replacement, thermostat calibration, and pressure release valve fix.', instant: true },
          { id: 'app-chimney', name: 'Kitchen Chimney Service', rating: 4.87, price: 499, duration: '1 hr', description: 'Baffle filter degreasing, motor carbon cleaning, and oil collector clearing.', instant: true },
          { id: 'app-water-heater', name: 'Water Heater Repair', rating: 4.84, price: 249, duration: '45 mins', description: 'Instant water geyser element replacement and pipeline scale descaling.', instant: true },
          { id: 'app-mixer', name: 'Mixer / Grinder Repair', rating: 4.80, price: 149, duration: '30 mins', description: 'Motor coupler replacement, carbon brushes, jar blade sharpening, and overload switch fix.', instant: true },
          { id: 'app-dishwasher', name: 'Dishwasher Service', rating: 4.89, price: 499, duration: '1 hr', description: 'Spray arm unclogging, water intake valve, heater check, and drain filter cleaning.' }
        ]
      }
    ]
  },

  // 3. CLEANING & SANITATION
  {
    id: 'cleaning-sanitation',
    title: 'Cleaning & Sanitation',
    shortTitle: 'Cleaning & Sanitation',
    domain: 'HOME_SERVICES',
    iconName: 'Sparkles',
    rating: 4.89,
    bookingsCount: '52,100+ bookings',
    coopName: 'Pune Mahila Seva Swachhata Sahakari',
    regNo: 'MAH/PNE/LBR/2020/0219',
    shramiksAvailable: 120,
    description: 'Mechanized home deep cleaning, kitchen & bathroom descaling, sofa fabric shampooing, commercial sanitation, and post-construction dust extraction.',
    heroImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1000&q=80',
    subTradesList: ['Home Cleaning', 'Kitchen & Bathroom', 'Furniture & Fabric', 'Specialized Cleaning', 'Commercial Cleaning', 'Post-Construction', 'Sanitation'],
    subTrades: [
      {
        id: 'home-cleaning',
        title: 'Home Cleaning',
        tagline: 'Regular home cleaning, deep cleaning, move-in, and move-out cleaning',
        services: [
          { id: 'clean-regular', name: 'Regular Home Cleaning', rating: 4.80, price: 999, duration: '2-3 hrs', description: 'Dusting, floor mopping, window sill wiping, cobweb removal, and balcony washing.' },
          { id: 'clean-deep', name: 'Deep Home Cleaning', rating: 4.88, price: 2299, duration: '4-5 hrs', description: 'Mechanized single-disc floor scrubbing, kitchen degreasing, bathroom descaling, and cabinets.' },
          { id: 'clean-movein', name: 'Move-in Cleaning', rating: 4.89, price: 2499, duration: '5 hrs', description: 'Complete sanitization and disinfection of vacant premises before moving your furniture in.' },
          { id: 'clean-moveout', name: 'Move-out Cleaning', rating: 4.86, price: 2199, duration: '4 hrs', description: 'Detailed property handover scrub ensuring full security deposit recovery from landlords.' }
        ]
      },
      {
        id: 'kitchen-bathroom',
        title: 'Kitchen & Bathroom',
        tagline: 'Kitchen deep cleaning, bathroom deep cleaning, and toilet cleaning',
        services: [
          { id: 'clean-kitchen-deep', name: 'Kitchen Deep Cleaning', rating: 4.85, price: 1199, duration: '2-3 hrs', description: 'Exhaust fan de-oiling, tile grout scrubbing, granite platform buffing, and cabinet wiping.' },
          { id: 'clean-bath-deep', name: 'Bathroom Deep Cleaning', rating: 4.87, price: 549, duration: '1 hr 30 mins', description: 'Hard water stain removal, WC bowl descaling, mirror buffing, and tile scrub.', instant: true },
          { id: 'clean-toilet', name: 'Toilet Cleaning', rating: 4.82, price: 349, duration: '45 mins', description: 'Intense chemical sanitization, rim descaling, and odor-neutralizing wash.', instant: true }
        ]
      },
      {
        id: 'furniture-fabric',
        title: 'Furniture & Fabric',
        tagline: 'Sofa cleaning, carpet cleaning, mattress cleaning, and curtain cleaning',
        services: [
          { id: 'clean-sofa', name: 'Sofa Cleaning', rating: 4.88, price: 799, duration: '1 hr 30 mins', description: 'Dual-action foam injection and high-suction water extraction for fabric sofas.' },
          { id: 'clean-carpet', name: 'Carpet Cleaning', rating: 4.85, price: 599, duration: '1 hr', description: 'Shampoo foam wash, fiber dirt extraction, and quick-dry blower treatment.' },
          { id: 'clean-mattress', name: 'Mattress Cleaning', rating: 4.87, price: 699, duration: '1 hr', description: 'UV sterilization and vacuum extraction to eliminate dust mites and dead skin.' },
          { id: 'clean-curtain', name: 'Curtain Cleaning', rating: 4.81, price: 499, duration: '1 hr', description: 'On-site steam extraction cleaning without needing to dismantle curtain rods.' }
        ]
      },
      {
        id: 'specialized-cleaning',
        title: 'Specialized Cleaning',
        tagline: 'Water tank cleaning, balcony cleaning, window cleaning, and terrace cleaning',
        services: [
          { id: 'clean-water-tank', name: 'Water Tank Cleaning', rating: 4.92, price: 899, duration: '2 hrs', description: 'High-pressure water jet wash, sludge extraction, and UV antibacterial sterilization.' },
          { id: 'clean-balcony', name: 'Balcony Cleaning', rating: 4.80, price: 349, duration: '45 mins', description: 'Pigeon dropping removal, floor washing, and railing wipe down.', instant: true },
          { id: 'clean-window', name: 'Window Cleaning', rating: 4.83, price: 399, duration: '1 hr', description: 'Glass pane streak-free buffing and aluminum sliding channel vacuuming.' },
          { id: 'clean-roof', name: 'Roof / Terrace Cleaning', rating: 4.86, price: 999, duration: '2 hrs', description: 'Pressure water wash to clear dry leaves, moss, silt, and rainwater drain blockage.' }
        ]
      },
      {
        id: 'commercial-cleaning',
        title: 'Commercial Cleaning',
        tagline: 'Office, shop, commercial building, and school cleaning',
        services: [
          { id: 'clean-office', name: 'Office Cleaning', rating: 4.90, price: 2999, duration: '4-6 hrs', description: 'Workstation sanitization, carpet buffing, server room dusting, and pantry scrub.' },
          { id: 'clean-shop', name: 'Shop Cleaning', rating: 4.85, price: 1499, duration: '2-3 hrs', description: 'Showroom display glass buffing, floor polishing, and warehouse aisle cleanup.' },
          { id: 'clean-building', name: 'Building Cleaning', rating: 4.92, price: 6500, duration: 'Full Day', description: 'Common lobbies, staircases, lift cabins, and basement parking wash.' },
          { id: 'clean-school', name: 'School Cleaning', rating: 4.89, price: 4999, duration: 'Full Day', description: 'Classroom desk sanitization, washroom disinfection, and playground sweep.' }
        ]
      },
      {
        id: 'post-construction',
        title: 'Post-Construction',
        tagline: 'Construction dust cleaning, debris cleaning, and new property cleaning',
        services: [
          { id: 'clean-dust', name: 'Construction Dust Cleaning', rating: 4.91, price: 2999, duration: '5-6 hrs', description: 'Heavy paint splatter scraping, cement spot removal, and fine dust vacuuming.' },
          { id: 'clean-debris', name: 'Debris Cleaning', rating: 4.88, price: 1999, duration: '3-4 hrs', description: 'Clearing mortar rubble, broken tiles, packaging cartons, and safe disposal.' },
          { id: 'clean-new-prop', name: 'New Property Cleaning', rating: 4.93, price: 3499, duration: 'Full Day', description: 'Turnkey handover cleaning making newly built flats immediately move-in ready.' }
        ]
      },
      {
        id: 'sanitation',
        title: 'Sanitation',
        tagline: 'Disinfection, waste collection, and community sanitation',
        services: [
          { id: 'san-disinfection', name: 'Disinfection Service', rating: 4.90, price: 799, duration: '1 hr', description: 'Hospital-grade cold ULV fogging to eliminate airborne bacteria and viruses.' },
          { id: 'san-waste', name: 'Waste Collection', rating: 4.82, price: 499, duration: '1 hr', description: 'Segregated solid waste and dry garden debris collection and legal disposal.' },
          { id: 'san-community', name: 'Community Sanitation', rating: 4.89, price: 2499, duration: '3 hrs', description: 'Garbage dump sanitization, drain bleaching powder dusting, and pest barrier.' }
        ]
      }
    ]
  },

  // 4. GARDENING & OUTDOOR
  {
    id: 'gardening-outdoor',
    title: 'Gardening & Outdoor',
    shortTitle: 'Gardening & Outdoor',
    domain: 'HOME_SERVICES',
    iconName: 'Shovel',
    rating: 4.87,
    bookingsCount: '18,400+ bookings',
    coopName: 'Pune Krishi & Udyan Shramik Sahakari',
    regNo: 'MAH/PNE/LBR/2021/0451',
    shramiksAvailable: 64,
    description: 'Certified malis and horticulturists for home balcony gardens, lawn care, landscaping, tree pruning, and society green spaces.',
    heroImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1000&q=80',
    subTradesList: ['Home Gardening', 'Lawn Care', 'Landscaping', 'Tree & Plant Services', 'Community Green Spaces'],
    subTrades: [
      {
        id: 'home-gardening',
        title: 'Home Gardening',
        tagline: 'Garden maintenance, plant care, indoor plants, and balcony gardening',
        services: [
          { id: 'mali-maint', name: 'Garden Maintenance', rating: 4.85, price: 499, duration: '2 hrs', description: 'Weeding, khurpi soil aeration, vermicompost top-up, and organic neem spray.', instant: true },
          { id: 'mali-plant-care', name: 'Plant Care', rating: 4.82, price: 349, duration: '1 hr', description: 'Foliar nutrition spray, root rot diagnosis, and dead foliage trimming.', instant: true },
          { id: 'mali-indoor', name: 'Indoor Plants Care', rating: 4.86, price: 399, duration: '1 hr', description: 'Leaf wiping, moisture testing, light orientation advice, and repotting.' },
          { id: 'mali-balcony', name: 'Balcony Gardening', rating: 4.89, price: 899, duration: '2 hrs', description: 'Arranging vertical planter stands, coco-peat potting, and micro-drip setup.' }
        ]
      },
      {
        id: 'lawn-care',
        title: 'Lawn Care',
        tagline: 'Lawn installation, lawn maintenance, grass cutting, and treatment',
        services: [
          { id: 'lawn-install', name: 'Lawn Installation', rating: 4.91, price: 3499, duration: '1 Day', description: 'Natural grass turf roll laying (Bermuda / Korean grass) with organic soil bed.' },
          { id: 'lawn-maint', name: 'Lawn Maintenance', rating: 4.86, price: 799, duration: '2 hrs', description: 'De-thatching, aerating, border shaping, and organic fertilizer feeding.' },
          { id: 'lawn-cut', name: 'Grass Cutting', rating: 4.84, price: 599, duration: '1 hr 30 mins', description: 'Petrol rotary lawn-mower grass cut with clean edge trimming.' },
          { id: 'lawn-treat', name: 'Lawn Treatment', rating: 4.87, price: 899, duration: '2 hrs', description: 'Weed eradication, fungus patch treatment, and overseeding.' }
        ]
      },
      {
        id: 'landscaping',
        title: 'Landscaping',
        tagline: 'Landscape design, installation, garden development, and irrigation',
        services: [
          { id: 'land-design', name: 'Landscape Design', rating: 4.93, price: 1499, duration: 'Consultation', description: '3D master layout planning for villas, society gardens, and farmhouses.' },
          { id: 'land-install', name: 'Landscape Installation', rating: 4.95, price: 8500, duration: '3-5 Days', description: 'Rock gardens, ornamental plant beds, decorative stone pathways, and lighting.' },
          { id: 'land-dev', name: 'Garden Development', rating: 4.90, price: 4999, duration: '2-3 Days', description: 'Complete land leveling, fertile topsoil spreading, and plant selection.' },
          { id: 'land-irrig', name: 'Irrigation Setup', rating: 4.88, price: 1999, duration: '1 Day', description: 'Automatic timer-based drip irrigation and pop-up sprinkler installation.' }
        ]
      },
      {
        id: 'tree-plant-services',
        title: 'Tree & Plant Services',
        tagline: 'Tree trimming, tree pruning, tree removal, and planting',
        services: [
          { id: 'tree-trim', name: 'Tree Trimming', rating: 4.88, price: 999, duration: '2 hrs', description: 'Balcony clearance trimming and overgrown branch thinning.' },
          { id: 'tree-prune', name: 'Tree Pruning', rating: 4.91, price: 1499, duration: '3 hrs', description: 'Pre-monsoon safety pruning to prevent falling branch hazards.' },
          { id: 'tree-remove', name: 'Tree Removal', rating: 4.93, price: 3499, duration: '4-5 hrs', description: 'Controlled sectional felling of dead or hazardous trees with municipal compliance.' },
          { id: 'tree-plant', name: 'Planting Services', rating: 4.86, price: 699, duration: '2 hrs', description: 'Pit digging, root ball placement, manure mixing, and tree staking.' }
        ]
      },
      {
        id: 'community-green-spaces',
        title: 'Community Green Spaces',
        tagline: 'Park maintenance, society garden maintenance, and public gardens',
        services: [
          { id: 'park-maint', name: 'Park Maintenance', rating: 4.92, price: 4500, duration: 'Weekly SLA', description: 'Regular mowing, weeding, litter clearing, and shrub trimming for public parks.' },
          { id: 'soc-garden', name: 'Society Garden Maintenance', rating: 4.94, price: 6500, duration: 'Monthly SLA', description: 'Dedicated cooperative mali visits for residential society lawns and podium gardens.' },
          { id: 'pub-garden', name: 'Public Garden Maintenance', rating: 4.90, price: 9500, duration: 'Monthly SLA', description: 'Municipal and institutional landscape maintenance under cooperative agreement.' }
        ]
      }
    ]
  },

  // 5. CARE & HOUSEHOLD ASSISTANCE
  {
    id: 'care-household',
    title: 'Care & Household Assistance',
    shortTitle: 'Care & Household',
    domain: 'HOME_SERVICES',
    iconName: 'Heart',
    rating: 4.91,
    bookingsCount: '29,800+ bookings',
    coopName: 'Savitribai Phule Mahila Seva & Arogya Sahakari',
    regNo: 'MAH/PNE/LBR/2020/0319',
    shramiksAvailable: 88,
    description: 'Police-verified and background-checked domestic helpers, elderly caregivers, patient attendants, childcare companions, home cooks, and errand assistants.',
    heroImage: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1000&q=80',
    subTradesList: ['Elderly Care', 'Patient Care', 'Childcare', 'Domestic Help', 'Cooking', 'Personal Assistance'],
    subTrades: [
      {
        id: 'elderly-care',
        title: 'Elderly Care',
        tagline: 'Elderly companion, daily assistance, mobility assistance, and home support',
        services: [
          { id: 'eld-companion', name: 'Elderly Companion', rating: 4.92, price: 799, duration: '4 hrs', description: 'Friendly emotional companion, conversational engagement, and walking support.' },
          { id: 'eld-daily-assist', name: 'Daily Assistance', rating: 4.90, price: 1199, duration: '8 hrs', description: 'Full day support with bathing, dressing, meal feeding, and medicine management.' },
          { id: 'eld-mobility', name: 'Mobility Assistance', rating: 4.93, price: 999, duration: '6 hrs', description: 'Assisting bed-to-wheelchair transfers, walking practice, and fall prevention.' },
          { id: 'eld-home-support', name: 'Home Support', rating: 4.88, price: 1499, duration: '12 hrs', description: 'Comprehensive overnight or long-shift home support for senior citizens.' }
        ]
      },
      {
        id: 'patient-care',
        title: 'Patient Care',
        tagline: 'Patient attendant, hospital assistance, home care, and post-illness support',
        services: [
          { id: 'pat-attendant', name: 'Patient Attendant', rating: 4.94, price: 1299, duration: '8 hrs', description: 'Bed-side support, vitals logging, sponge bathing, and catheter drainage monitoring.' },
          { id: 'pat-hospital', name: 'Hospital Assistance', rating: 4.91, price: 1199, duration: '8 hrs', description: 'Dedicated attendant in hospital room for pharmacy runs, test movement, and food.' },
          { id: 'pat-home-care', name: 'Home Care Assistance', rating: 4.93, price: 1599, duration: '12 hrs', description: 'Post-operative recovery monitoring, nebulizer support, and wound dressing help.' },
          { id: 'pat-post-illness', name: 'Post-illness Support', rating: 4.90, price: 1399, duration: '8 hrs', description: 'Rehabilitation care after stroke, fracture, or chronic disease discharge.' }
        ]
      },
      {
        id: 'childcare',
        title: 'Childcare',
        tagline: 'Babysitting, child companion, and school pickup/drop',
        services: [
          { id: 'child-babysit', name: 'Babysitting', rating: 4.89, price: 699, duration: '4 hrs', description: 'Trained babysitter for infant feeding, diaper change, nap routine, and play.' },
          { id: 'child-companion', name: 'Child Companion', rating: 4.87, price: 899, duration: '6 hrs', description: 'Supervising homework, reading stories, and engaging in creative offline games.' },
          { id: 'child-pickup', name: 'School Pickup / Drop', rating: 4.91, price: 499, duration: '2 hrs', description: 'Safe and verified chaperone for school bus stop or tuition pickup and drop.' }
        ]
      },
      {
        id: 'domestic-help',
        title: 'Domestic Help',
        tagline: 'Household helper, dishwashing, laundry assistance, and general housework',
        services: [
          { id: 'dom-helper', name: 'Household Helper', rating: 4.85, price: 399, duration: '2 hrs', description: 'Floor sweeping, mopping, dusting furniture, and trash disposal.', instant: true },
          { id: 'dom-dishes', name: 'Dishwashing', rating: 4.83, price: 299, duration: '1 hr', description: 'Utensil scrubbing, sink sanitization, and drying/stacking in racks.', instant: true },
          { id: 'dom-laundry', name: 'Laundry Assistance', rating: 4.84, price: 349, duration: '1 hr 30 mins', description: 'Washing machine loading, clothes drying, folding, and wardrobe organizing.' },
          { id: 'dom-general', name: 'General Household Work', rating: 4.86, price: 549, duration: '3 hrs', description: 'Comprehensive domestic housekeeping visit covering multiple chores.' }
        ]
      },
      {
        id: 'cooking',
        title: 'Cooking',
        tagline: 'Daily cooking, meal preparation, party/event cooking, and special diet cooking',
        services: [
          { id: 'cook-daily', name: 'Daily Cooking', rating: 4.88, price: 499, duration: '2 hrs', description: 'Fresh preparation of Roti, Sabzi, Dal, and Rice tailored to your taste.', instant: true },
          { id: 'cook-meal-prep', name: 'Meal Preparation', rating: 4.85, price: 699, duration: '3 hrs', description: 'Cooking both Lunch and Dinner in a single extended kitchen session.' },
          { id: 'cook-party', name: 'Party / Event Cooking', rating: 4.92, price: 2499, duration: '4-5 hrs', description: 'Festive cooking for 10-25 guests with starters, main course, and sweets.' },
          { id: 'cook-special-diet', name: 'Special Diet Cooking', rating: 4.89, price: 649, duration: '2 hrs', description: 'Jain, diabetic low-glycemic, keto, or high-protein customized home food.' }
        ]
      },
      {
        id: 'personal-assistance',
        title: 'Personal Assistance',
        tagline: 'Grocery assistance, errand services, medicine pickup, and household errands',
        services: [
          { id: 'pers-grocery', name: 'Grocery Assistance', rating: 4.84, price: 249, duration: '1 hr', description: 'Fresh vegetable, dairy, and supermarket shopping from your preferred stores.', instant: true },
          { id: 'pers-errands', name: 'Errand Services', rating: 4.82, price: 299, duration: '1 hr 30 mins', description: 'Dry cleaning drop/pickup, tailoring delivery, and courier dispatch.', instant: true },
          { id: 'pers-medicine', name: 'Medicine Pickup', rating: 4.89, price: 199, duration: '45 mins', description: 'Urgent prescription medicine pickup from chemist with doorstep delivery.', instant: true },
          { id: 'pers-household-errands', name: 'Household Errands', rating: 4.85, price: 399, duration: '2 hrs', description: 'Bill payments, society office visits, and key handover tasks.' }
        ]
      }
    ]
  },

  // 6. TRANSPORT & VEHICLE SERVICES
  {
    id: 'transport-vehicles',
    title: 'Transport & Vehicle Services',
    shortTitle: 'Transport & Vehicles',
    domain: 'HOME_SERVICES',
    iconName: 'Car',
    rating: 4.86,
    bookingsCount: '24,600+ bookings',
    coopName: 'Maharashtra Shramik Vahan & Parivahan Sahakari',
    regNo: 'MAH/PNE/LBR/2019/0288',
    shramiksAvailable: 72,
    description: 'Commercial-licensed on-demand drivers, local parcel delivery, doorstep vehicle detailing, roadside mechanic assistance, and moving/shifting.',
    heroImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80',
    subTradesList: ['Driver Services', 'Delivery', 'Vehicle Cleaning', 'Vehicle Repair', 'Moving & Shifting'],
    subTrades: [
      {
        id: 'driver-services',
        title: 'Driver Services',
        tagline: 'Personal driver, temporary driver, outstation driver, and event driver',
        services: [
          { id: 'drv-personal', name: 'Personal Driver', rating: 4.88, price: 450, duration: '4 hrs', description: 'Verified chauffeur for your personal vehicle to navigate city traffic and parking.', instant: true },
          { id: 'drv-temp', name: 'Temporary Driver', rating: 4.85, price: 799, duration: '8 hrs', description: 'Full day city driver for hospital visits, shopping trips, or office commute.' },
          { id: 'drv-outstation', name: 'Outstation Driver', rating: 4.92, price: 1400, duration: '12 hrs', description: 'Experienced highway chauffeur for Pune-Mumbai expressway, Mahabaleshwar, or Goa.' },
          { id: 'drv-event', name: 'Event Driver', rating: 4.89, price: 650, duration: '5 hrs', description: 'Safe return driver for wedding parties, late night dinners, and corporate galas.', instant: true }
        ]
      },
      {
        id: 'delivery',
        title: 'Delivery',
        tagline: 'Local delivery, document delivery, grocery delivery, and small parcel delivery',
        services: [
          { id: 'del-local', name: 'Local Delivery', rating: 4.84, price: 149, duration: '45 mins', description: 'Fast intracity delivery of items up to 10 kg via cooperative two-wheeler runner.', instant: true },
          { id: 'del-document', name: 'Document Delivery', rating: 4.87, price: 129, duration: '30 mins', description: 'Confidential document and legal papers hand-delivery with digital signature.', instant: true },
          { id: 'del-grocery', name: 'Grocery Delivery', rating: 4.82, price: 149, duration: '45 mins', description: 'Prompt delivery of weekly staples and heavy grocery bags to your door.', instant: true },
          { id: 'del-parcel', name: 'Small Parcel Delivery', rating: 4.85, price: 179, duration: '1 hr', description: 'Secure transit for electronics, gifts, and fragile packages across Pune.', instant: true }
        ]
      },
      {
        id: 'vehicle-cleaning',
        title: 'Vehicle Cleaning',
        tagline: 'Car washing, bike washing, interior cleaning, and vehicle detailing',
        services: [
          { id: 'veh-car-wash', name: 'Car Washing', rating: 4.83, price: 349, duration: '45 mins', description: 'Doorstep high-pressure water rinse, foam shampoo, and tire dressing.', instant: true },
          { id: 'veh-bike-wash', name: 'Bike Washing', rating: 4.81, price: 199, duration: '30 mins', description: 'Two-wheeler chain degreasing, foam wash, and mirror polishing.', instant: true },
          { id: 'veh-interior', name: 'Interior Cleaning', rating: 4.88, price: 699, duration: '1 hr 30 mins', description: 'Deep vacuum of carpets, roof dry wash, AC vent steam sanitization, and dashboard polish.' },
          { id: 'veh-detail', name: 'Vehicle Detailing', rating: 4.91, price: 1499, duration: '3 hrs', description: 'Exterior 3-step rubbing compound, swirl mark removal, and carnauba wax shield.' }
        ]
      },
      {
        id: 'vehicle-repair',
        title: 'Vehicle Repair',
        tagline: 'General mechanic, battery services, tyre services, oil change, and basic repair',
        services: [
          { id: 'rep-mechanic', name: 'General Mechanic', rating: 4.86, price: 349, duration: '1 hr', description: 'On-site vehicle breakdown diagnosis, clutch adjustment, and brake inspection.', instant: true },
          { id: 'rep-battery', name: 'Battery Services', rating: 4.89, price: 249, duration: '30 mins', description: 'Emergency jump start, terminal corrosion cleaning, and battery voltage health check.', instant: true },
          { id: 'rep-tyre', name: 'Tyre Services', rating: 4.84, price: 199, duration: '30 mins', description: 'Tubeless puncture repair, stepney spare tire swap, and air pressure check.', instant: true },
          { id: 'rep-oil', name: 'Oil Change', rating: 4.85, price: 299, duration: '45 mins', description: 'Engine oil drainage, oil filter swap, and fresh grade synthetic oil filling.' },
          { id: 'rep-basic', name: 'Basic Vehicle Repair', rating: 4.82, price: 399, duration: '1 hr', description: 'Headlight bulb replacement, wiper blade swap, and horn/fuse fixes.', instant: true }
        ]
      },
      {
        id: 'moving-shifting',
        title: 'Moving & Shifting',
        tagline: 'Packing, loading/unloading, local moving, and furniture moving',
        services: [
          { id: 'mov-packing', name: 'Packing Services', rating: 4.88, price: 1299, duration: '3 hrs', description: 'Bubble wrap, corrugated sheet, and stretch film packing for fragile appliances.' },
          { id: 'mov-loading', name: 'Loading / Unloading', rating: 4.90, price: 1499, duration: '3 hrs', description: 'Trained shramiks for heavy lifting up staircases and freight elevator transit.' },
          { id: 'mov-local', name: 'Local Moving (1 BHK)', rating: 4.92, price: 4500, duration: 'Half Day', description: 'Complete 1 BHK home shifting with dedicated mini-truck and packing crew.' },
          { id: 'mov-furniture', name: 'Furniture Moving', rating: 4.87, price: 1199, duration: '2 hrs', description: 'Safe single-item transit for heavy double beds, almirahs, and large sofas.' }
        ]
      }
    ]
  },

  // 7. DIGITAL & PROFESSIONAL SERVICES
  {
    id: 'digital-professional',
    title: 'Digital & Professional Services',
    shortTitle: 'Digital & Professional',
    domain: 'HOME_SERVICES',
    iconName: 'Tv',
    rating: 4.85,
    bookingsCount: '15,600+ bookings',
    coopName: 'Pune Yuva Tantradnya & Vyavasayik Sahakari',
    regNo: 'MAH/PNE/LBR/2022/0511',
    shramiksAvailable: 54,
    description: 'On-site computer and laptop repair, smartphone screen fixes, printer maintenance, Wi-Fi LAN setup, data entry, digital documentation, creative design, and tailoring.',
    heroImage: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1000&q=80',
    subTradesList: ['Computer Services', 'Mobile & Electronics', 'Printer & Office Equipment', 'IT & Networking', 'Data & Office Assistance', 'Creative Services', 'Personal/Handmade Services'],
    subTrades: [
      {
        id: 'computer-services',
        title: 'Computer Services',
        tagline: 'Computer repair, laptop repair, software installation, and OS setup',
        services: [
          { id: 'pc-repair', name: 'Computer Repair', rating: 4.85, price: 399, duration: '1 hr', description: 'Desktop SMPS, RAM upgrade, thermal paste replacement, and motherboard diagnosis.', instant: true },
          { id: 'pc-laptop', name: 'Laptop Repair', rating: 4.87, price: 449, duration: '1 hr 30 mins', description: 'Laptop keyboard fix, hinge repair, overheating fan cleaning, and DC jack repair.', instant: true },
          { id: 'pc-software', name: 'Software Installation', rating: 4.82, price: 249, duration: '45 mins', description: 'Antivirus setup, MS Office activation, PDF suites, and driver updates.', instant: true },
          { id: 'pc-os', name: 'Operating System Setup', rating: 4.89, price: 499, duration: '1 hr 30 mins', description: 'Clean installation of genuine Windows 11 or macOS with full data backup.' }
        ]
      },
      {
        id: 'mobile-electronics',
        title: 'Mobile & Electronics',
        tagline: 'Mobile repair, screen replacement, and software troubleshooting',
        services: [
          { id: 'mob-repair', name: 'Mobile Repair', rating: 4.83, price: 299, duration: '1 hr', description: 'Charging port replacement, microphone/speaker crackle fix, and battery swap.', instant: true },
          { id: 'mob-screen', name: 'Screen Replacement', rating: 4.88, price: 799, duration: '1 hr', description: 'High-grade OLED/LCD touch digitizer glass replacement with warranty.' },
          { id: 'mob-software', name: 'Software Troubleshooting', rating: 4.81, price: 199, duration: '30 mins', description: 'Boot loop fixing, storage freeing, WhatsApp backup recovery, and security checks.', instant: true }
        ]
      },
      {
        id: 'printer-office',
        title: 'Printer & Office Equipment',
        tagline: 'Printer repair, printer installation, and cartridge/toner services',
        services: [
          { id: 'prn-repair', name: 'Printer Repair', rating: 4.84, price: 349, duration: '1 hr', description: 'Paper jam clearance, roller pickup repair, printhead unclogging, and gear fix.', instant: true },
          { id: 'prn-install', name: 'Printer Installation', rating: 4.80, price: 249, duration: '30 mins', description: 'Wi-Fi wireless printer setup, network IP sharing, and scanner driver install.', instant: true },
          { id: 'prn-toner', name: 'Cartridge / Toner Services', rating: 4.86, price: 399, duration: '45 mins', description: 'Laser toner refilling, OPC drum replacement, and inkjet cartridge priming.' }
        ]
      },
      {
        id: 'it-networking',
        title: 'IT & Networking',
        tagline: 'Wi-Fi setup, LAN setup, router configuration, and network troubleshooting',
        services: [
          { id: 'it-wifi', name: 'Wi-Fi Setup', rating: 4.85, price: 299, duration: '45 mins', description: 'Tri-band mesh router node arrangement to blanket duplex flats with high-speed internet.', instant: true },
          { id: 'it-lan', name: 'LAN Setup', rating: 4.89, price: 599, duration: '1 hr 30 mins', description: 'Network switch termination, patch panel punching, and Cat6 cabling.' },
          { id: 'it-router', name: 'Router Configuration', rating: 4.81, price: 249, duration: '30 mins', description: 'Port forwarding, static IP binding, firewall rules, and VPN client setup.' },
          { id: 'it-troubleshoot', name: 'Network Troubleshooting', rating: 4.86, price: 349, duration: '45 mins', description: 'Resolving high ping, DNS resolution failure, and packet drops.' }
        ]
      },
      {
        id: 'data-office',
        title: 'Data & Office Assistance',
        tagline: 'Data entry, document formatting, printing/scanning, and digital documentation',
        services: [
          { id: 'dat-entry', name: 'Data Entry', rating: 4.83, price: 299, duration: '1 hr', description: 'Excel spreadsheet entry, invoice ledger typing, and database transcription.' },
          { id: 'dat-format', name: 'Document Formatting', rating: 4.85, price: 249, duration: '45 mins', description: 'Word resume formatting, legal agreements, affidavits, and thesis typesetting.' },
          { id: 'dat-scan', name: 'Printing / Scanning', rating: 4.80, price: 199, duration: '30 mins', description: 'High-resolution bulk scanning, OCR text conversion, and laminated printouts.' },
          { id: 'dat-doc', name: 'Digital Documentation', rating: 4.88, price: 399, duration: '1 hr', description: 'e-Shram card registration, Aadhaar updates, PAN applications, and government portal filing.' }
        ]
      },
      {
        id: 'creative-services',
        title: 'Creative Services',
        tagline: 'Graphic design, poster design, photo editing, and video editing',
        services: [
          { id: 'cre-graphic', name: 'Graphic Design', rating: 4.90, price: 599, duration: '2 hrs', description: 'Custom social media flyers, business visiting cards, and product branding.' },
          { id: 'cre-poster', name: 'Poster Design', rating: 4.87, price: 499, duration: '1 hr 30 mins', description: 'High-resolution event posters, sale banners, and digital display graphics.' },
          { id: 'cre-photo', name: 'Photo Editing', rating: 4.86, price: 399, duration: '1 hr', description: 'Portrait background removal, color grading, blemish cleanup, and retouching.' },
          { id: 'cre-video', name: 'Video Editing', rating: 4.91, price: 899, duration: '2 hrs', description: 'Reels and YouTube video editing with titles, music sync, and clean cuts.' }
        ]
      },
      {
        id: 'personal-handmade',
        title: 'Personal / Handmade Services',
        tagline: 'Tailoring, alterations, embroidery, and craft work',
        services: [
          { id: 'tai-tailoring', name: 'Doorstep Tailoring', rating: 4.88, price: 499, duration: '1 hr', description: 'On-site measurement for custom blouses, kurtis, suits, and dress materials.' },
          { id: 'tai-alter', name: 'Alterations & Fitting', rating: 4.84, price: 199, duration: '30 mins', description: 'Trousers length shortening, waist tightening, zip replacement, and sleeve adjustments.', instant: true },
          { id: 'tai-embroid', name: 'Embroidery Work', rating: 4.92, price: 699, duration: '1 Day', description: 'Traditional Aari, Zardozi, and hand needlework for sarees and dupattas.' },
          { id: 'tai-craft', name: 'Craft & Handmade Work', rating: 4.86, price: 449, duration: '1-2 hrs', description: 'Festival toran making, gift wrapping, fabric tassels, and decorative home artifacts.' }
        ]
      }
    ]
  },

  // 8. EMERGENCY SERVICES
  {
    id: 'emergency-services',
    title: 'Emergency Services (<15 Mins)',
    shortTitle: '🚨 Emergency Services',
    domain: 'HOME_SERVICES',
    iconName: 'AlertTriangle',
    rating: 4.96,
    bookingsCount: '8,900+ urgent responses',
    coopName: 'Pune Sahakar Aapatkalin Pratisaad Dasta',
    regNo: 'MAH/PNE/LBR/2021/SOS-99',
    shramiksAvailable: 42,
    description: 'Special priority response squads dispatched within 15 minutes for critical residential hazards, power blackouts, pipe bursts, and lockout crises.',
    heroImage: 'https://images.unsplash.com/photo-1509783236416-c9ad59bae472?auto=format&fit=crop&w=1000&q=80',
    subTradesList: ['Electrical Emergency', 'Plumbing Emergency', 'Home Emergency', 'Appliance Emergency', 'Other Urgent Help'],
    subTrades: [
      {
        id: 'sos-electrical',
        title: 'Electrical Emergency',
        tagline: 'Power failure, short circuit, electrical fault, and MCB/fuse problem',
        services: [
          { id: 'sos-power', name: 'Power Failure Resolution', rating: 4.96, price: 499, duration: '15-25 mins', description: 'Rapid fault tracing on main incoming phase to safely restore residential electricity.', instant: true },
          { id: 'sos-short', name: 'Short Circuit Emergency', rating: 4.97, price: 549, duration: '15-25 mins', description: 'Immediate disconnection of smoking cables or sparking switchboards.', instant: true },
          { id: 'sos-fault', name: 'Electrical Fault Clearing', rating: 4.94, price: 499, duration: '20 mins', description: 'Isolating shorted loops causing recurring inverter or RCCB tripping.', instant: true },
          { id: 'sos-mcb', name: 'MCB / Fuse Problem', rating: 4.95, price: 449, duration: '20 mins', description: 'Emergency replacement of melted or jammed circuit breakers.', instant: true }
        ]
      },
      {
        id: 'sos-plumbing',
        title: 'Plumbing Emergency',
        tagline: 'Major water leakage, burst pipe, blocked drain, and overflowing tank',
        services: [
          { id: 'sos-leak', name: 'Major Water Leakage', rating: 4.96, price: 499, duration: '15-25 mins', description: 'Urgent isolation of leaking concealed lines to stop indoor flooding.', instant: true },
          { id: 'sos-burst', name: 'Burst Pipe Emergency', rating: 4.98, price: 599, duration: '20 mins', description: 'Heavy pipe clamp sealing and temporary bypass for broken CPVC/GI mains.', instant: true },
          { id: 'sos-blocked-drain', name: 'Blocked Drain Emergency', rating: 4.93, price: 449, duration: '25 mins', description: 'Emergency clearing of overflowing sewage line or bathroom gully trap.', instant: true },
          { id: 'sos-overflow-tank', name: 'Overflowing Tank Fix', rating: 4.94, price: 399, duration: '20 mins', description: 'Shutting off jammed float valve and stopping water tank terrace wastage.', instant: true }
        ]
      },
      {
        id: 'sos-home',
        title: 'Home Emergency',
        tagline: 'Door/lock emergency, broken window, and structural minor damage',
        services: [
          { id: 'sos-lock', name: 'Door / Lock Emergency', rating: 4.95, price: 499, duration: '20 mins', description: 'Non-destructive emergency lock opening and cylinder replacement for lockouts.', instant: true },
          { id: 'sos-window', name: 'Broken Window Hazard', rating: 4.92, price: 449, duration: '25 mins', description: 'Safe extraction of shattered glass panes and temporary weather sealing.', instant: true },
          { id: 'sos-structural', name: 'Structural Minor Damage', rating: 4.94, price: 599, duration: '30 mins', description: 'Emergency prop support for sagging false ceiling or cracking parapet plaster.', instant: true }
        ]
      },
      {
        id: 'sos-appliance',
        title: 'Appliance Emergency',
        tagline: 'AC failure, refrigerator failure, water heater failure, and appliance failure',
        services: [
          { id: 'sos-ac', name: 'AC Failure (Extreme Heat)', rating: 4.92, price: 499, duration: '30 mins', description: 'Emergency capacitor swap or contactor repair to restore cooling.', instant: true },
          { id: 'sos-fridge', name: 'Refrigerator Failure', rating: 4.93, price: 499, duration: '30 mins', description: 'Emergency relay and compressor check to prevent food and medicine spoilage.', instant: true },
          { id: 'sos-geyser', name: 'Water Heater Failure', rating: 4.90, price: 399, duration: '30 mins', description: 'Fixing electrical short or tank leak in bathroom geyser.', instant: true },
          { id: 'sos-other-app', name: 'Electrical Appliance Failure', rating: 4.89, price: 349, duration: '30 mins', description: 'Rapid diagnosis of smoking or sparking kitchen appliances.', instant: true }
        ]
      },
      {
        id: 'sos-other',
        title: 'Other Urgent Help',
        tagline: 'Emergency driver, emergency moving assistance, and urgent household assistance',
        services: [
          { id: 'sos-driver', name: 'Emergency Driver', rating: 4.97, price: 599, duration: '15 mins dispatch', description: 'Immediate chauffeur dispatch for hospital emergencies or late night transit.', instant: true },
          { id: 'sos-moving', name: 'Emergency Moving Assistance', rating: 4.91, price: 899, duration: '1 hr', description: 'Urgent manpower to shift furniture away from water seepage or ceiling leaks.', instant: true },
          { id: 'sos-household', name: 'Urgent Household Assistance', rating: 4.90, price: 499, duration: '30 mins', description: 'First-responder help for elderly falls, heavy lifting, or domestic crisis.', instant: true }
        ]
      }
    ]
  },

  // 9. CONSTRUCTION & RENOVATION (PROJECTS & CONTRACTS)
  {
    id: 'construction-renovation',
    title: 'Construction & Renovation (Contractor Guild)',
    shortTitle: 'Construction & Renovation',
    domain: 'PROJECTS_CONTRACTS',
    iconName: 'Building2',
    rating: 4.90,
    bookingsCount: '540+ completed projects',
    coopName: 'Maharashtra Nirman & Bandhkam Sahakari Mahasangh',
    regNo: 'MAH/PNE/LBR/2017/0014',
    shramiksAvailable: 140,
    description: 'Registered Mukaddams and civil contractor gangs for residential construction, full-flat renovations, bathroom overhauls, and structural repairs.',
    heroImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=1000&q=80',
    subTradesList: ['New Construction', 'Renovation', 'Civil Work', 'Finishing Work', 'Installation', 'Specialized Projects'],
    subTrades: [
      {
        id: 'civil-renovation',
        title: 'Full Home & Civil Renovation',
        tagline: 'Turnkey interior civil redesign, partition walls, false ceiling, tile laying',
        services: [
          { id: 'renov-bath', name: 'Bathroom Modernization (Turnkey Civil)', rating: 4.92, price: 28500, duration: '5 Days', description: 'Demolition of old tiles, concealed CPVC plumbing, waterproofing layer, and vitrified tiles.' },
          { id: 'renov-kitchen', name: 'Modular Granite Platform & Dado Renovation', rating: 4.88, price: 22000, duration: '4 Days', description: 'Granite counter cutting, double-edge polishing, and sink manifold plumbing.' },
          { id: 'renov-full', name: 'Full Apartment Turnkey Renovation (2 BHK)', rating: 4.95, price: 85000, duration: '15 Days', description: 'Complete civil overhaul including plastering, wiring, plumbing, flooring, and paint.' },
          { id: 'renov-terrace', name: 'Terrace Waterproofing', rating: 4.94, price: 16500, duration: '3 Days', description: 'Polyurethane chemical coating, fiber mesh reinforcement, and 72-hr ponding test.' },
          { id: 'renov-tile', name: 'Floor Tile Installation', rating: 4.91, price: 12000, duration: '2-3 Days', description: 'Laser-leveled vitrified tile laying with anti-skid epoxy joint grouting.' },
          { id: 'renov-plaster', name: 'Plastering', rating: 4.89, price: 8500, duration: '2 Days', description: 'Sand-faced river sand cement mortar plastering for interior and exterior walls.' }
        ]
      }
    ]
  },

  // 10. INSTITUTIONAL & COMMERCIAL SERVICES (PROJECTS & CONTRACTS)
  {
    id: 'institutional-commercial',
    title: 'Institutional & Commercial Facility Services',
    shortTitle: 'Societies & Commercial',
    domain: 'PROJECTS_CONTRACTS',
    iconName: 'Building2',
    rating: 4.89,
    bookingsCount: '340+ township contracts',
    coopName: 'Pune Sahakari Sanstha & Vasahat Seva Federation',
    regNo: 'MAH/PNE/LBR/2018/0055',
    shramiksAvailable: 160,
    description: 'Dedicated multi-worker maintenance squads and SLAs for Gated Housing Societies (RWAs), commercial office parks, and educational institutes.',
    heroImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
    subTradesList: ['Building Maintenance', 'Housing Society', 'Facility Cleaning', 'Infrastructure Maintenance', 'Outdoor Maintenance', 'Sanitation'],
    subTrades: [
      {
        id: 'rwa-society',
        title: 'Housing Society (RWA) Operations',
        tagline: 'Common area lighting, STP & water pump maintenance, lift power backup, clubhouse',
        services: [
          { id: 'rwa-monthly', name: 'Housing Society Monthly Common Area Maintenance SLA', rating: 4.93, price: 18500, duration: 'Monthly SLA', description: 'Bi-weekly electrical and plumbing audits, overhead tank sanitization, and emergency coverage.' },
          { id: 'rwa-stp', name: 'Sewage Treatment Plant (STP) Operations SLA', rating: 4.91, price: 14500, duration: 'Monthly SLA', description: 'Blower servicing, dosing pump chemical management, and treated water quality test.' },
          { id: 'rwa-cctv', name: 'CCTV Installation', rating: 4.90, price: 12500, duration: '1 Day', description: 'Gated society 16-channel IP surveillance cameras, optical fiber cabling, and security cabin monitoring.' },
          { id: 'rwa-clean', name: 'Building Cleaning', rating: 4.88, price: 9500, duration: '1 Day', description: 'High-pressure mechanized pressure washing of society podiums, driveways, and basements.' },
          { id: 'rwa-tank', name: 'Water Tank Cleaning', rating: 4.92, price: 4500, duration: '4 hrs', description: '6-stage scientific sanitization with sludge de-watering, high-pressure rotary jet, and UV treatment.' },
          { id: 'rwa-garden', name: 'Society Garden Maintenance', rating: 4.89, price: 6500, duration: 'Monthly SLA', description: 'Lawn aerating, ornamental plant feeding, pathway cleaning, and tree branch safety trimming.' }
        ]
      }
    ]
  },


  // 12. CONTRACTS & RECURRING SERVICES (AMC)
  {
    id: 'contracts-recurring',
    title: 'Contracts & Recurring Services (AMC)',
    shortTitle: 'AMCs & Recurring',
    domain: 'PROJECTS_CONTRACTS',
    iconName: 'FileText',
    rating: 4.91,
    bookingsCount: '580+ annual agreements',
    coopName: 'Maharashtra Sahakari Varshik Karar Sanstha',
    regNo: 'MAH/PNE/LBR/2020/0398',
    shramiksAvailable: 110,
    description: 'Formal Annual Maintenance Contracts (AMCs) for housing societies, commercial offices, and bungalows. Guaranteed SLA turnaround with scheduled preventative servicing.',
    heroImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80',
    subTradesList: ['Maintenance Contracts', 'Cleaning Contracts', 'Gardening Contracts', 'Facility Management', 'Labour Contracts', 'Long-Term Projects'],
    subTrades: [
      {
        id: 'annual-amc',
        title: 'Annual Maintenance Contracts (AMC)',
        tagline: 'Comprehensive Electrical, Plumbing, AC, and Water Pump AMCs',
        services: [
          { id: 'amc-home', name: 'Complete Home Comprehensive AMC (1 Year)', rating: 4.92, price: 4999, duration: '365 Days', description: '4 scheduled preventive visits + unlimited emergency breakdown visits for electrical and plumbing.' },
          { id: 'amc-society-pumps', name: 'Housing Society Water Pump & STP Annual AMC', rating: 4.95, price: 24000, duration: '1 Year', description: 'Monthly motor alignment, bearing greasing, capacitor check, and STP aeration blower audit.' },
          { id: 'amc-ac-society', name: 'AC Maintenance', rating: 4.91, price: 7999, duration: '1 Year', description: 'Quarterly indoor coil chemical foam washing, gas pressure verification, and condenser servicing.' },
          { id: 'amc-solar', name: 'Solar Maintenance', rating: 4.93, price: 8500, duration: '1 Year', description: 'Bi-monthly rooftop solar panel dusting, inverter efficiency checks, and wiring terminal safety tests.' },
          { id: 'amc-lift-generator', name: 'Inverter/Battery Services', rating: 4.89, price: 5500, duration: '1 Year', description: 'Electrolyte gravity testing, terminal anti-corrosion coating, and full load changeover verification.' },
          { id: 'amc-fire-safety', name: 'Roof Maintenance', rating: 4.90, price: 6200, duration: '1 Year', description: 'Annual terrace rainwater gutter clearing, down-pipe joint inspection, and pre-monsoon seal checks.' }
        ]
      }
    ]
  }
];
