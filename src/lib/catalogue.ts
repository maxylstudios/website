export const disciplines = ["Identity", "Digital", "Editorial", "Spatial"] as const;

export type Discipline = (typeof disciplines)[number];

export type Project = {
  slug: string;
  number: string;
  title: string;
  client: string;
  year: string;
  discipline: Discipline;
  excerpt: string;
  body: string[];
  services: string[];
  cover: {
    from: string;
    to: string;
    ink: string;
  };
};

export const projects: Project[] = [
  {
    slug: "northline",
    number: "01",
    title: "Northline",
    client: "Harbour ferry",
    year: "2024",
    discipline: "Identity",
    excerpt: "A ferry line named for the route it actually runs.",
    body: [
      "Northline needed a mark that could sit on a hull, a timetable, and a ticket without losing its shape. The wordmark is cut wide so it reads at a distance from the quay.",
      "The colour is the deep green of the channel on an overcast morning. Supporting type stays plain so departure times stay readable in weather.",
    ],
    services: ["Naming", "Identity", "Signage"],
    cover: { from: "#1d3a32", to: "#0e1c18", ink: "#e7f0ea" },
  },
  {
    slug: "paper-room",
    number: "02",
    title: "Paper Room",
    client: "Independent bookshop",
    year: "2025",
    discipline: "Digital",
    excerpt: "A shop site that behaves like the shelves: quiet, ordered, easy to wander.",
    body: [
      "Paper Room sells new and used books from a single room. The site lists stock the way the shelves do — by subject first, then by what arrived this week.",
      "Pages are mostly type. Covers are shown small. The point is to find a book, not to browse a marketplace.",
    ],
    services: ["Website", "Catalogue", "Editorial"],
    cover: { from: "#8c3b2a", to: "#4a2218", ink: "#f6ebe4" },
  },
  {
    slug: "field-issue",
    number: "03",
    title: "Field Issue",
    client: "Quarterly journal",
    year: "2023",
    discipline: "Editorial",
    excerpt: "A journal of land use, set as if it might be read outdoors.",
    body: [
      "Each issue follows one stretch of ground: a marsh, a quarry, a high street being rebuilt. The design keeps essays, maps, and captions in one column so they can be read in order.",
      "The cover changes colour with the issue. The grid and the folio numbers stay put.",
    ],
    services: ["Art direction", "Layout", "Cover system"],
    cover: { from: "#c46a2f", to: "#7a3e16", ink: "#fff4e8" },
  },
  {
    slug: "copper-kettle",
    number: "04",
    title: "Copper Kettle",
    client: "Coffee roaster",
    year: "2025",
    discipline: "Identity",
    excerpt: "Bags, cups, and a short menu, drawn from one kettle silhouette.",
    body: [
      "The roaster already had a kettle they liked. The identity starts from that outline and stops there — no extra mascot, no script logo.",
      "Labels list origin, process, and a tasting note in the same three lines, so a bag on a shelf and a page online tell the same story.",
    ],
    services: ["Identity", "Packaging", "Menu"],
    cover: { from: "#a86432", to: "#6a3a1e", ink: "#f8efe4" },
  },
  {
    slug: "lumen-hall",
    number: "05",
    title: "Lumen Hall",
    client: "Gallery",
    year: "2024",
    discipline: "Spatial",
    excerpt: "Wall labels and a wayfinding system for a hall with almost no walls that are straight.",
    body: [
      "Lumen Hall sits in a converted assembly room. Sightlines are odd, so titles are set large and short. Longer text lives on a single sheet you can hold.",
      "The hanging signs use the same type as the printed list at the door, so the room and the handout agree.",
    ],
    services: ["Wayfinding", "Exhibition graphics", "Print"],
    cover: { from: "#243044", to: "#121820", ink: "#e8eef6" },
  },
  {
    slug: "still-room",
    number: "06",
    title: "Still Room",
    client: "Ceramic studio",
    year: "2022",
    discipline: "Editorial",
    excerpt: "A printed catalogue of vessels, photographed on the same table they are thrown on.",
    body: [
      "Still Room makes small runs of tableware. The catalogue is a booklet, not a lookbook: one object per spread, with clay, glaze, and dimensions underneath.",
      "Nothing is styled. The paper is uncoated so the photographs stay close to the colour of the clay.",
    ],
    services: ["Catalogue", "Photography direction", "Print"],
    cover: { from: "#5e6a58", to: "#2c3329", ink: "#f3f6ef" },
  },
  {
    slug: "octave",
    number: "07",
    title: "Octave",
    client: "Chamber festival",
    year: "2026",
    discipline: "Identity",
    excerpt: "A week of concerts, reduced to eight notes and a timetable.",
    body: [
      "Octave lasts eight evenings in one church. The identity is an eight-part mark that also works as a single ticket stamp.",
      "Programmes are folded sheets. The evening’s order is the largest type on the page. Everything else gets out of the way.",
    ],
    services: ["Identity", "Programme", "Tickets"],
    cover: { from: "#3a2458", to: "#1a1028", ink: "#f3eaff" },
  },
  {
    slug: "market-lane",
    number: "08",
    title: "Market Lane",
    client: "Neighbourhood market",
    year: "2023",
    discipline: "Spatial",
    excerpt: "Signs for a lane of stalls that moves every Saturday and returns on Sunday.",
    body: [
      "Stallholders change. The lane does not. The system is a set of hanging boards: category on the street side, the stall name on the lane side.",
      "Type is heavy enough to read between shoulders. Colour marks food, plants, and goods, and nothing else.",
    ],
    services: ["Wayfinding", "Sign system", "Maps"],
    cover: { from: "#1f4d3a", to: "#10281e", ink: "#e7f6ee" },
  },
  {
    slug: "brine",
    number: "09",
    title: "Brine",
    client: "Restaurant",
    year: "2025",
    discipline: "Digital",
    excerpt: "A menu that changes with the tide, published the same way every day.",
    body: [
      "Brine writes a short menu each morning. The site is a single page: today’s plates, a booking note, and the address.",
      "There is no gallery of the dining room. The type is the same as the printed card on the table, so a guest who looked online is not surprised.",
    ],
    services: ["Website", "Menu system"],
    cover: { from: "#1a4a62", to: "#0d2430", ink: "#e5f4fb" },
  },
];

export function isDiscipline(value: string | undefined): value is Discipline {
  return disciplines.some((discipline) => discipline === value);
}

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function relatedProjects(slug: string, limit = 2) {
  const current = getProject(slug);
  if (!current) return [];

  const others = projects.filter((project) => project.slug !== slug);
  const sameDiscipline = others.filter(
    (project) => project.discipline === current.discipline,
  );
  const rest = others.filter(
    (project) => project.discipline !== current.discipline,
  );

  return [...sameDiscipline, ...rest].slice(0, limit);
}
