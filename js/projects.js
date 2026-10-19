/* =========================================================
   projects.js — the "Other projects" list.

   To add a project, copy one { ... } block, paste it at the
   TOP of the list (newest first), and edit the values.
   Every field except title and description is optional,
   but the class guide asks for a screenshot, your contribution
   and a working link when you have one:

   {
     title: "Project name",
     year: "2026",
     description: "One or two sentences on what it does.",
     contribution: "What YOU did on it (solo, or your part in a group).",
     tags: ["HTML", "CSS", "JavaScript"],
     image: "assets/projects/your-screenshot.jpg",   // put the file in assets/projects/
     imageAlt: "What the screenshot shows",
     demo: "https://link-to-live-site",              // shows a "Live demo" button
     demoLabel: "View prototype",                    // optional: changes that button's text
     code: "https://github.com/you/repo"             // shows a "Source code" button
   },

   Leave demo / code as "" if there isn't one yet.
   ========================================================= */
window.PROJECTS = [
  {
    title: "Chester Tourist",
    year: "",
    description:
      "A hotel booking website designed in Figma, with Home, Forum, Webcam and Contact pages and a hotel search where you enter a destination and your arrival and departure dates.",
    contribution:
      "Group project. I worked on the prototyping, connecting the screens in Figma so the design can be clicked through like a real website.",
    tags: ["Figma", "Prototyping", "UI design"],
    image: "assets/projects/chester-tourist.jpg",
    imageAlt: "Chester Tourist homepage design with a navigation bar, a cartoon receptionist and a hotel search form",
    demo: "https://www.figma.com/proto/5WgKMWzSoz5G3SwT59rv9q/Untitled?node-id=3-3&t=m52Q0P43EMHS05Fp-1",
    demoLabel: "View prototype",
    code: ""
  },
  {
    title: "Ovulation Calculator",
    year: "",
    description:
      "A one-page calculator: pick the first day of your last period and it works out the next ovulation date, the six-day fertile window and when the next period is due, all shown on a month calendar.",
    contribution:
      "Group project. I helped write the logic that works out the ovulation date, the fertile window and the next period from the date you pick.",
    tags: ["HTML", "CSS", "JavaScript"],
    image: "assets/projects/ovulation-calculator.jpg",
    imageAlt: "Ovulation calculator showing a date picker above an October calendar",
    demo: "",
    code: ""
  }
];
