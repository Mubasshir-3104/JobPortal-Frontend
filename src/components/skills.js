// Shared skill helpers used by the job feed and the job form.

// Suggestions offered while typing a skill. Selection is NOT limited to this
// list — any skill can be typed and added with Enter.
export const SKILL_OPTIONS = [
  "JavaScript",
  "TypeScript",
  "Java",
  "Python",
  "C++",
  "C#",
  "Go",
  "Rust",
  "Kotlin",
  "Swift",
  "PHP",
  "Ruby",
  "React",
  "Angular",
  "Vue.js",
  "Next.js",
  "Node.js",
  "Express.js",
  "Django",
  "Flask",
  "Spring Boot",
  ".NET",
  "GraphQL",
  "REST API",
  "MongoDB",
  "MySQL",
  "PostgreSQL",
  "Redis",
  "Firebase",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "Google Cloud",
  "Git",
  "CI/CD",
  "Jenkins",
  "Terraform",
  "Linux",
  "Tailwind CSS",
  "HTML5",
  "CSS3",
  "Redux",
  "TensorFlow",
  "PyTorch",
  "Machine Learning",
  "Microservices",
];

const TONE_COUNT = 6;

// Deterministic tone class so a given skill always renders in the same colour.
export const skillToneClass = (skill = "") => {
  let hash = 0;
  for (let i = 0; i < skill.length; i += 1) {
    hash = (hash + skill.charCodeAt(i) * (i + 1)) % 997;
  }
  const tone = hash % TONE_COUNT;
  return tone === 0 ? "skill" : `skill skill--tone-${tone}`;
};

export const formatExperience = (years) => {
  const n = Number(years);
  if (years === "" || years == null || Number.isNaN(n)) return "Experience n/a";
  return n <= 0 ? "Fresher" : `${n}+ Yrs Exp`;
};
