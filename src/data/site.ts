export const business = {
  name: "Ankit Jobs & Staffing India",
  phone: "+91 8348623389",
  tel: "tel:+918348623389",
  email: "ankitjobs99@gmail.com",
  whatsapp: "https://wa.me/918348623389",
  // TODO: replace with the business's own Facebook page URL once supplied.
  facebook: "https://www.facebook.com/",
};
// Google Apps Script web app that writes to the Google Sheet + Drive.
// Public by design (it is called from the browser); see google-apps-script/Code.gs.
export const formEndpoint: string =
  import.meta.env.PUBLIC_FORM_ENDPOINT ||
  "https://script.google.com/macros/s/AKfycbwQ9mtbqJn_pwtEWdd1itmFbEDUGb22dzkU9XEbv05kB_Lv222KgFWRCwLP74prYjlX/exec";

export const navigation = [
  ["Home", "/"],
  ["About Us", "/about-us/"],
  ["Our Services", "/our-services/"],
  ["Candidate Zone", "/candidate-zone/"],
  ["Recruiter Zone", "/recruiter-zone/"],
  ["Current Openings", "/current-openings/"],
  ["Industries We Serve", "/industries-we-serve/"],
  ["Contact Us", "/contact-us/"],
];

export const services = [
  {
    slug: "manpower-recruitment",
    icon: "users",
    image: "manpower",
    title: "Manpower Recruitment",
    text: "End-to-end recruitment of skilled, semi-skilled and unskilled manpower — from sourcing and screening to interview coordination and onboarding.",
    points: ["Bulk and volume hiring", "Pre-screened, verified candidates", "24–48 hour quick deployment"],
  },
  {
    slug: "overseas-placement",
    icon: "globe",
    image: "placement",
    title: "Overseas Placement",
    text: "Guidance and placement support for candidates seeking work abroad, and for overseas employers looking for dependable Indian talent.",
    points: ["Candidate sourcing for overseas roles", "Documentation guidance", "Pre-departure orientation"],
  },
  {
    slug: "staffing-services",
    icon: "briefcase",
    image: "staffing",
    title: "Staffing Services",
    text: "Flexible temporary, contract and permanent staffing so businesses can scale their workforce up or down as demand changes.",
    points: ["Contract and temporary staffing", "Permanent placements", "Workforce management support"],
  },
  {
    slug: "corporate-training",
    icon: "award",
    image: "employer",
    title: "Corporate Training Services",
    text: "Practical training programmes that prepare new hires and upskill existing teams in workplace readiness, soft skills and job-specific skills.",
    points: ["Induction and onboarding training", "Soft skills and communication", "Role-specific skill building"],
  },
];

export const industries = [
  { icon: "health", title: "Healthcare & Pharma", text: "Nursing staff, pharmacists, lab technicians, medical representatives and hospital support teams." },
  { icon: "chip", title: "Technology & Telecom", text: "IT support, developers, field engineers, telecom technicians and customer-service executives." },
  { icon: "bank", title: "Finance & Banking", text: "Relationship officers, tele-callers, collection executives, back-office and accounts staff." },
  { icon: "factory", title: "Manufacturing & Industrial", text: "Machine operators, ITI technicians, supervisors, helpers and quality-control staff." },
  { icon: "cart", title: "Retail & E-commerce", text: "Store staff, sales associates, delivery partners, warehouse pickers and packers." },
  { icon: "building", title: "Construction & Infrastructure", text: "Site engineers, supervisors, masons, electricians, safety officers and skilled labour." },
];
export const careerSupport = [
  "Explore the registration requirements",
  "Enquire about current opportunities",
  "Discuss your career interests",
];
export const steps = [
  {
    title: "Register Your Details",
    icon: "clipboard",
    text: "Review the candidate registration form and the information requested. Online submission will be available after secure processing is enabled.",
  },
  {
    title: "Profile Screening",
    icon: "search",
    text: "The proposed next step is a review of qualifications and the details relevant to an enquiry.",
  },
  {
    title: "Match with Opportunities",
    icon: "calendar",
    text: "Potential opportunities may be discussed according to available vacancies and the requirements of each role.",
  },
  {
    title: "Interview & Selection",
    icon: "handshake",
    text: "An employer may arrange an interview and make its own selection decision. Requirements vary by role.",
  },
  {
    title: "Start Your Career",
    icon: "briefcase",
    text: "If selected, confirm the employment terms and joining arrangements directly with the relevant employer.",
  },
];
export const faqs = [
  {
    q: "How can I register as a job seeker?",
    a: "Visit Candidate Registration to review the form. Online submission is currently unavailable while secure processing and privacy terms are being finalized. You can call the team for a general enquiry in the meantime.",
  },
  {
    q: "What details are required for registration?",
    a: "The form requests your name, parents’ names, mobile number, email, qualification, date of birth, automatically calculated age, gender, state and district. An alternative mobile number is optional. Read the privacy notice before sharing information.",
  },
  {
    q: "Can I contact the team by WhatsApp?",
    a: "Yes. Use WhatsApp for a general enquiry on +91 8348623389. Please do not send completed registration details, family information or sensitive documents through the website’s WhatsApp links.",
  },
  {
    q: "Which locations does the company serve?",
    a: "Job placement support is offered for candidates in Kolkata, Vizag and Odisha. Contact the team to confirm support for your preferred role and location.",
  },
  {
    q: "How can I enquire about current vacancies?",
    a: "Visit the Career page and contact the team for current information. No verified live vacancies have been supplied for publication yet.",
  },
  {
    q: "Does registration guarantee a job?",
    a: "No. An enquiry or registration does not guarantee a vacancy, interview or placement. Selection depends on an employer’s requirements and decisions.",
  },
  {
    q: "Are there any registration or service fees?",
    a: "A fee policy has not been supplied for this website. Ask the team for the applicable terms before making any commitment or payment.",
  },
];

export const reasons = [
  { icon: "shield", title: "Candidate-focused Communication", text: "Clear conversations about your qualifications, interests and next steps." },
  { icon: "users", title: "Recruitment Assistance", text: "Support in connecting job seekers with suitable opportunities." },
  { icon: "briefcase", title: "Career Guidance", text: "Understand the roles you can apply for and the next steps before you commit." },
  { icon: "clipboard", title: "Simple Registration", text: "One straightforward form — your age is calculated automatically from your date of birth." },
  { icon: "pin", title: "Multiple Service Locations", text: "Job placement support for candidates across Kolkata, Vizag and Odisha." },
];
export const locations = [
  { name: "Kolkata", region: "West Bengal" },
  { name: "Vizag", region: "Visakhapatnam, Andhra Pradesh" },
  { name: "Odisha", region: "Eastern India" },
];
