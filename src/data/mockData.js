export const mockData = {
  store_locations: [
    { store_id: 'store_a', store_name: 'Downtown Flagship', city: 'Chicago', max_capacity: 120, latitude: 41.8827, longitude: -87.6233 },
    { store_id: 'store_b', store_name: 'North Side Store', city: 'Chicago', max_capacity: 95, latitude: 41.9742, longitude: -87.6685 },
    { store_id: 'store_c', store_name: 'Evanston', city: 'Evanston', max_capacity: 80, latitude: 42.0451, longitude: -87.6877 },
    { store_id: 'store_d', store_name: 'Naperville', city: 'Naperville', max_capacity: 110, latitude: 41.7508, longitude: -88.1535 },
    { store_id: 'store_e', store_name: 'Schaumburg', city: 'Schaumburg', max_capacity: 100, latitude: 42.0334, longitude: -88.0834 },
  ],

  fn_store_kpi: [
    { store_id: 'store_a', store_name: 'Downtown Flagship', conversion_rate: 38.2, rev_per_party: 64, party_count: 312, total_revenue: 19968 },
    { store_id: 'store_b', store_name: 'North Side Store',  conversion_rate: 31.4, rev_per_party: 48, party_count: 245, total_revenue: 11760 },
    { store_id: 'store_c', store_name: 'Evanston',          conversion_rate: 29.1, rev_per_party: 44, party_count: 198, total_revenue: 8712  },
    { store_id: 'store_d', store_name: 'Naperville',        conversion_rate: 26.8, rev_per_party: 38, party_count: 167, total_revenue: 6346  },
    { store_id: 'store_e', store_name: 'Schaumburg',        conversion_rate: 24.3, rev_per_party: 34, party_count: 143, total_revenue: 4862  },
  ],

  // Four zones: Entrance, Clothing, Electronics, Checkout
  fn_zone_kpi: [
    { zone_id: 'z1', zone_name: 'Entrance',    zone_type: 'transit',  promo_zone_flag: false, visitors: 481, avg_dwell_seconds: 72,  conversion_rate: 12, revenue: 1800,  lost_opp: 423 },
    { zone_id: 'z3', zone_name: 'Electronics', zone_type: 'product',  promo_zone_flag: false, visitors: 198, avg_dwell_seconds: 486, conversion_rate: 38, revenue: 11200, lost_opp: 123 },
    { zone_id: 'z4', zone_name: 'Clothing',    zone_type: 'product',  promo_zone_flag: true,  visitors: 156, avg_dwell_seconds: 312, conversion_rate: 28, revenue: 4200,  lost_opp: 112 },
    { zone_id: 'z6', zone_name: 'Checkout',    zone_type: 'checkout', promo_zone_flag: false, visitors: 312, avg_dwell_seconds: 252, conversion_rate: 91, revenue: 18200, lost_opp: 28  },
  ],

  fn_basket_by_dwell: [
    { dwell_bucket: '<30s',    avg_basket: 18, transaction_count: 42,  total_revenue: 756   },
    { dwell_bucket: '30-60s',  avg_basket: 32, transaction_count: 118, total_revenue: 3776  },
    { dwell_bucket: '60-120s', avg_basket: 48, transaction_count: 156, total_revenue: 7488  },
    { dwell_bucket: '120s+',   avg_basket: 71, transaction_count: 89,  total_revenue: 6319  },
  ],

  fn_promo_roi: [
    { zone_id: 'z4', zone_name: 'Clothing',    promo_flag: true,  visitors: 156, revenue: 4200,  avg_dwell_seconds: 312 },
    { zone_id: 'z3', zone_name: 'Electronics', promo_flag: false, visitors: 198, revenue: 11200, avg_dwell_seconds: 486 },
  ],

  fn_avg_dwell_by_hour: [
    { hour: '9am',  avg_dwell_min: 3.2 }, { hour: '10am', avg_dwell_min: 4.1 },
    { hour: '11am', avg_dwell_min: 5.8 }, { hour: '12pm', avg_dwell_min: 4.4 },
    { hour: '1pm',  avg_dwell_min: 5.1 }, { hour: '2pm',  avg_dwell_min: 6.2 },
    { hour: '3pm',  avg_dwell_min: 5.9 }, { hour: '4pm',  avg_dwell_min: 6.8 },
    { hour: '5pm',  avg_dwell_min: 5.3 }, { hour: '6pm',  avg_dwell_min: 4.1 },
    { hour: '7pm',  avg_dwell_min: 3.8 }, { hour: '8pm',  avg_dwell_min: 2.9 },
  ],

  fn_weekly_traffic_heatmap: {
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    hours: ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm'],
    values: [
      [12, 18, 22, 20, 28, 45, 42],
      [18, 24, 30, 28, 42, 68, 62],
      [22, 30, 38, 35, 55, 72, 68],
      [34, 40, 55, 50, 72, 92, 86],
      [28, 34, 45, 40, 60, 78, 72],
      [24, 30, 40, 36, 55, 70, 66],
      [20, 26, 35, 30, 50, 65, 60],
      [28, 34, 44, 40, 62, 80, 74],
      [32, 38, 50, 45, 68, 88, 82],
      [26, 32, 42, 38, 58, 74, 70],
      [18, 24, 32, 28, 45, 60, 55],
      [10, 14, 18, 16, 28, 42, 38],
    ],
  },

  fn_staff_impact: [
    { hour: '9am',  staffed_conv: 28, unstaffed_conv: 14 },
    { hour: '10am', staffed_conv: 35, unstaffed_conv: 18 },
    { hour: '11am', staffed_conv: 42, unstaffed_conv: 21 },
    { hour: '12pm', staffed_conv: 38, unstaffed_conv: 20 },
    { hour: '1pm',  staffed_conv: 46, unstaffed_conv: 24 },
    { hour: '2pm',  staffed_conv: 44, unstaffed_conv: 22 },
    { hour: '3pm',  staffed_conv: 40, unstaffed_conv: 19 },
    { hour: '4pm',  staffed_conv: 48, unstaffed_conv: 25 },
    { hour: '5pm',  staffed_conv: 45, unstaffed_conv: 23 },
    { hour: '6pm',  staffed_conv: 34, unstaffed_conv: 16 },
  ],

  summary_cards: {
    party_conversion_rate: { value: 34.2, delta: 3.1,  up: true,  unit: '%' },
    avg_basket_size:       { value: 47.80, delta: 2.40, up: true,  unit: '$' },
    avg_group_size:        { value: 2.3,   delta: null,  up: null,  note: 'mostly couples' },
    promo_zone_revenue:    { value: 12440, delta: -1.2, up: false, unit: '$' },
  },

  // Layout: Clothing | Checkout | Electronics (top row), Entrance (bottom center)
  fn_zone_heatmap: [
    { zone_id:'z4', zone_name:'Clothing',    map_x:20,  map_y:20,  map_width:120, map_height:80, visit_count:156, avg_dwell_seconds:312, promo_zone_flag:true,  live_count:2 },
    { zone_id:'z6', zone_name:'Checkout',    map_x:160, map_y:20,  map_width:120, map_height:80, visit_count:312, avg_dwell_seconds:252, promo_zone_flag:false, live_count:6 },
    { zone_id:'z3', zone_name:'Electronics', map_x:300, map_y:20,  map_width:120, map_height:80, visit_count:198, avg_dwell_seconds:486, promo_zone_flag:false, live_count:3 },
    { zone_id:'z1', zone_name:'Entrance',    map_x:155, map_y:190, map_width:130, map_height:70, visit_count:481, avg_dwell_seconds:72,  promo_zone_flag:false, live_count:8 },
  ],

  fn_zone_flows: [
    { from_zone:'z1', to_zone:'z4', customer_count:168, from_x:195, from_y:190, to_x:80,  to_y:100 },
    { from_zone:'z1', to_zone:'z6', customer_count:142, from_x:220, from_y:190, to_x:220, to_y:100 },
    { from_zone:'z1', to_zone:'z3', customer_count:110, from_x:245, from_y:190, to_x:360, to_y:100 },
    { from_zone:'z4', to_zone:'z6', customer_count:95,  from_x:140, from_y:60,  to_x:160, to_y:60  },
    { from_zone:'z3', to_zone:'z6', customer_count:88,  from_x:300, from_y:60,  to_x:280, to_y:60  },
  ],

  fn_top_paths: [
    { path:'Entrance → Electronics → Checkout',            count:168, pct:39.2 },
    { path:'Entrance → Clothing → Checkout',               count:132, pct:30.8 },
    { path:'Entrance → Checkout',                          count:62,  pct:14.5 },
    { path:'Entrance → Clothing → Electronics → Checkout', count:38,  pct:8.9  },
    { path:'Entrance → Electronics → Clothing → Checkout', count:28,  pct:6.5  },
  ],
}
