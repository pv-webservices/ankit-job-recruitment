// Current openings shown on the homepage and the Current Openings page.
// To add a job: drop its poster into public/images/current-openings/, create
// the -560.webp thumbnail and .webp full-size copies, and add an entry here.
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
    slug: "manufacturing-freshers",
    title: "Production Jobs for Freshers",
    company: "Reputed manufacturing company · Direct company payroll",
    tag: "Urgent requirement",
    poster: "current-opening-1",
    location: "Gujarat, Nashik, Pune, Haryana, Bangalore, Delhi, Chennai, Baddi — open to all of India",
    salary: "₹18,000 – ₹25,000 CTC",
    qualification: "ITI / 10th / 12th / Diploma / B.Tech (any trade)",
    age: "Below 28 years · Male & female",
    department: "Production",
    highlights: ["PF & ESI", "Accommodation", "Canteen", "Transport", "Bonus & overtime"],
  },
  {
    slug: "private-bank-freshers",
    title: "Private Bank Jobs for Freshers",
    company: "Top private banks · Direct payroll",
    tag: "Freshers welcome",
    poster: "current-opening-2",
    location: "Pan India — posting in your own state",
    salary: "₹3.5 – ₹8 lakh per annum",
    qualification: "Any graduate / MBA / BBA / BCA, 50%+ throughout",
    age: "Maximum 28 years · Male & female",
    department: "Operations / Sales",
    highlights: ["Assistant Manager", "Relationship Manager", "BDM", "Cashier", "PF + ESI"],
  },
  {
    slug: "banking-finance-direct-payroll",
    title: "Banking & Finance — Direct Payroll Jobs",
    company: "ICICI, Axis, HDFC, Yes Bank & more leading banks",
    tag: "Direct payroll",
    poster: "current-opening-3",
    location: "Pan India — posting in your own state",
    salary: "₹3.5 – ₹8 lakh per annum + incentives",
    qualification: "Any graduate / MBA / BBA / BCA, good communication & computer skills",
    age: "Maximum 28 years · Male & female",
    department: "Operations / Sales",
    highlights: ["Assistant Manager", "Associate RM", "BDM", "Cashier", "Growth opportunities"],
  },
];

export const jobTitles = jobs.map((job) => job.title);
