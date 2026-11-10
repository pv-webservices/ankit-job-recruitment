// Every generated image has one purpose and one placement on the website.
// `outputs` lists the optimized WebP renditions written to public/images/.

const STYLE =
  "Premium editorial commercial photography, natural skin texture, true-to-life colour, crisp focus, subtle navy blue and warm gold colour grade. No text, no lettering, no signage, no logos, no watermarks.";

export const imageTasks = [
  {
    id: "hero-kolkata",
    placement: "Homepage hero (full-bleed on desktop, framed image on mobile)",
    alt: "Three young Indian professionals — an office executive, a site technician and a customer-service executive — on a Kolkata riverfront at golden hour",
    priority: "hero",
    orientation: "landscape",
    subjects: 3,
    photoreal: true,
    traits: ["complex-lighting", "architecture"],
    outputs: [{ suffix: "", width: 1600 }, { suffix: "-960", width: 960 }],
    prompt: `Photorealistic wide hero photograph for an Indian recruitment and staffing company. Three confident, friendly young adult Indian professionals stand together, framed from mid-thigh up, positioned in the RIGHT 60% of the frame: in front-centre a woman in a tailored navy blazer and white shirt holding a slim black folder; to her right a man in a yellow hard hat and high-visibility vest over a grey work shirt; to her left a man in a crisp light-blue office shirt with an ID lanyard, arms relaxed. All faces sharp, heads fully in frame with headroom. They stand on a riverside promenade in Kolkata at golden hour; behind them, softly out of focus, the steel cantilever silhouette of Howrah Bridge spans the Hooghly river under a deep blue evening sky with warm sunset glow near the horizon. The LEFT 40% of the frame is calm: dark blue sky and river with gentle bokeh, suitable for website headline text. ${STYLE}`,
  },
  {
    id: "loc-kolkata",
    placement: "Locations section card — Kolkata",
    alt: "Howrah Bridge over the Hooghly river in Kolkata at dusk",
    priority: "support",
    orientation: "portrait",
    traits: ["architecture"],
    outputs: [{ suffix: "", width: 720 }],
    prompt: `Vertical photograph of Howrah Bridge in Kolkata at blue hour, viewed from the riverbank, the massive steel cantilever structure glowing with warm lights, reflections on the Hooghly river, a small wooden boat in the foreground water, deep navy sky with warm amber horizon. Calm, majestic, architectural travel photography. ${STYLE}`,
  },
  {
    id: "loc-vizag",
    placement: "Locations section card — Vizag",
    alt: "Visakhapatnam coastline with the beach road and green hills",
    priority: "support",
    orientation: "portrait",
    traits: [],
    outputs: [{ suffix: "", width: 720 }],
    prompt: `Vertical photograph of the Visakhapatnam (Vizag) coastline in the early morning: a curving beach road along the Bay of Bengal, gentle waves on golden sand, green hills rising in the background, modern city buildings along the shore, clear blue sky with soft warm light. Scenic coastal city travel photography. ${STYLE}`,
  },
  {
    id: "loc-odisha",
    placement: "Locations section card — Odisha",
    alt: "Carved stone chariot wheel of the Konark Sun Temple in Odisha",
    priority: "support",
    orientation: "portrait",
    traits: ["architecture"],
    outputs: [{ suffix: "", width: 720 }],
    prompt: `Vertical photograph of the Konark Sun Temple in Odisha: a close, slightly low-angle view of an intricately carved stone chariot wheel on the temple's sandstone wall, warm late-afternoon sunlight raking across the carvings, part of the temple tower visible above against a deep blue sky. Heritage architectural photography, rich texture and detail. ${STYLE}`,
  },
  {
    id: "jobseeker",
    placement: "Homepage candidate registration section (portrait visual beside the form)",
    alt: "A young Indian job seeker smiling while filling in a registration on her phone",
    priority: "key",
    orientation: "portrait",
    subjects: 1,
    photoreal: true,
    traits: [],
    outputs: [{ suffix: "", width: 800 }],
    prompt: `Vertical lifestyle photograph of a cheerful young adult Indian woman job seeker in a smart pastel kurta, sitting at a bright cafe table by a window, holding a smartphone and looking at it with a hopeful smile, a neat folder of documents and a cup of tea on the table beside her. Soft natural daylight, shallow depth of field, warm and optimistic mood, head and shoulders plus upper body in frame with headroom. ${STYLE}`,
  },
  {
    id: "employer",
    placement: "Homepage employer section and For Employers page",
    alt: "A business owner discussing workforce requirements with a recruitment consultant",
    priority: "support",
    orientation: "landscape",
    subjects: 2,
    photoreal: true,
    traits: [],
    outputs: [{ suffix: "", width: 1200 }, { suffix: "-720", width: 720 }],
    prompt: `Landscape photograph of a middle-aged Indian business owner in a pale blue shirt and a young Indian recruitment consultant in a navy blazer shaking hands across a desk in a bright modern office, a glass partition behind them showing a softly blurred warehouse floor. Both smiling naturally, professional and trustworthy atmosphere, faces fully visible, natural daylight. ${STYLE}`,
  },
];
