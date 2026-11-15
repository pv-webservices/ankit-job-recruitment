// Current openings shown on the homepage and the Current Openings page.
// To add a job: drop its poster into public/images/current-openings/, create
// the -640.webp thumbnail and .webp full-size copies, and add an entry here.
export interface Job {
  slug: string;
  title: string;
  company: string;
  tag: string;
  poster: string; // base name inside /images/current-openings/
  location: string;
  salary: string;
  qualification: string;
  age: string;
  department: string;
  highlights: string[];
}

export const jobs: Job[] = [
  {
    slug: "private-banking-freshers",
    title: "Private Banking & Finance Jobs for Freshers",
    company: "ICICI, Axis, HDFC, Yes Bank, IDFC First & more leading banks · Direct payroll",
    tag: "Direct payroll",
    poster: "new-current-opening-1",
    location: "Pan India — posting in your own state",
    salary: "₹3.5 – ₹8 lakh per annum + incentives",
    qualification: "Any graduate / MBA / BBA / BCA, 50%+ throughout",
    age: "Maximum 28 years · Male & female",
    department: "Operations / Sales",
    highlights: ["Assistant Manager", "Associate RM", "BDM", "Cashier", "PF + ESI"],
  },
  {
    slug: "manufacturing-bulk-hiring",
    title: "Bulk Hiring for Freshers — Manufacturing",
    company: "Reputed manufacturing company · Direct company payroll · 2024 / 25 / 26 batch only",
    tag: "Bulk hiring",
    poster: "new-current-opening-2",
    location: "Gujarat, Nashik, Pune, Haryana, Bangalore, Delhi, Chennai, Baddi — open to all of India",
    salary: "₹18,000 – ₹25,000 CTC",
    qualification: "ITI / 10th / 12th / Diploma / B.Tech (any trade)",
    age: "Below 28 years · Male & female",
    department: "Production / Maintenance / Quality",
    highlights: ["PF & ESI", "Accommodation", "Canteen", "Transport", "Bonus & overtime", "Gratuity"],
  },
];

export const jobTitles = jobs.map((job) => job.title);
