export const MOCK_MEETINGS = [
  {
    id: 1,
    title: "Q2 Sprint Planning",
    date: "2026-05-28",
    participants: "Aryan, Priya, Rahul, Sneha",
    status: "completed",
    summary: "Discussed feature priorities for Q2 sprint. Decided to focus on auth module first.",
    mom: `**Meeting Title:** Q2 Sprint Planning\n**Date:** May 28, 2026\n**Attendees:** Aryan, Priya, Rahul, Sneha\n\n**Agenda:**\n1. Feature prioritization\n2. Timeline review\n3. Resource allocation\n\n**Discussion Points:**\n- Auth module identified as critical path item\n- Design handoff scheduled for June 3rd\n- API documentation needs update before dev begins\n\n**Decisions Made:**\n- Auth module moves to top of backlog\n- Weekly syncs every Monday 10am\n\n**Action Items:**\n- Aryan: finalize API spec by June 2\n- Priya: update UI designs by June 3\n- Rahul: set up staging environment\n\n**Next Steps:**\nFollow-up meeting on June 5 to review progress.`,
  },
  {
    id: 2,
    title: "Product Roadmap Review",
    date: "2026-05-20",
    participants: "Meera, Dev, Aisha",
    status: "completed",
    summary: "Reviewed H2 roadmap milestones and adjusted timelines based on engineering capacity.",
    mom: `**Meeting Title:** Product Roadmap Review\n**Date:** May 20, 2026\n**Attendees:** Meera, Dev, Aisha\n\n**Discussion Points:**\n- H2 milestone review\n- Timeline adjustments\n\n**Decisions Made:**\n- MVP launch pushed to August\n\n**Action Items:**\n- Dev: update Jira board\n- Meera: inform stakeholders`,
  },
  {
    id: 3,
    title: "Design System Kickoff",
    date: "2026-05-15",
    participants: "Tara, Kiran, Yash",
    status: "completed",
    summary: "Established design tokens and component library structure for the new system.",
    mom: `**Meeting Title:** Design System Kickoff\n**Date:** May 15, 2026\n**Attendees:** Tara, Kiran, Yash\n\n**Discussion Points:**\n- Design token structure\n- Component library tooling\n\n**Decisions Made:**\n- Use Figma + Storybook combo\n\n**Action Items:**\n- Tara: create initial token set\n- Kiran: set up Storybook`,
  },
];

export const MOCK_TRANSCRIPT = `[00:00] Aryan: Alright everyone, let's get started. Today we're doing the Q2 sprint planning. I'll be taking notes. We have Priya, Rahul, and Sneha joining.

[00:18] Priya: Thanks Aryan. So the main thing I wanted to discuss is the auth module. From a design perspective, we've got the wireframes ready but we need a final call on the flow for password reset.

[00:35] Rahul: From the backend side, the auth module is going to touch a lot of the existing tables. I'd suggest we start with just email-password login and add OAuth in the next sprint.

[00:52] Sneha: That makes sense. The staging environment isn't fully set up yet either, so if we rush OAuth integration it could create blockers for QA.

[01:08] Aryan: Agreed. So decision one — auth module first, OAuth in sprint 3. Rahul, can you have the API spec ready by June 2nd?

[01:20] Rahul: Yes, that's doable. I'll also document the endpoints in Swagger.

[01:28] Priya: I can have the updated UI designs for the login and reset flow by June 3rd. I'll share them in Figma.

[01:40] Aryan: Perfect. Sneha, staging environment by when?

[01:45] Sneha: I can have the base environment up by June 4th. Might need some help from Rahul on the DB config.

[01:52] Rahul: Sure, just ping me on Slack.

[02:00] Aryan: Great. One more thing — weekly syncs. I'm thinking every Monday at 10am. Does that work for everyone?

[02:08] Priya, Rahul, Sneha: Works for us.

[02:12] Aryan: Alright, let's wrap up. We'll do a follow-up on June 5th to check on progress.`;

export const MOCK_MOM = (form: any) => `**Meeting Title:** ${form.title || "Team Meeting"}
**Date:** ${new Date(form.date || new Date().toISOString().split("T")[0]).toLocaleDateString("en-IN", {
  day: "2-digit", month: "short", year: "numeric",
})}
**Attendees:** ${form.participants || "Team Members"}
**Facilitator:** Meeting Host

---

**Agenda:**
${form.agenda || "1. Project updates\n2. Planning\n3. Action items"}

---

**Discussion Points:**

1. **Auth Module Priority** — The team agreed to prioritize email-password authentication in the current sprint. OAuth will be deferred to Sprint 3 to reduce scope and avoid staging environment blockers.

2. **Staging Environment** — The staging environment is not fully ready. Setup is targeted for June 4th, with potential support needed on the database configuration side.

3. **Design Handoff** — UI wireframes for login and password reset flows are ready. Final designs will be shared via Figma by June 3rd.

4. **Weekly Sync Cadence** — The team aligned on a recurring Monday sync at 10:00 AM to maintain project momentum.

---

**Decisions Made:**

- Auth module (email-password only) moves to top priority
- OAuth integration pushed to Sprint 3
- Weekly Monday standups at 10:00 AM

---

**Action Items:**

| Owner | Task | Deadline |
|-------|------|----------|
| Rahul | Finalize API spec + Swagger docs | June 2 |
| Priya | Updated login/reset UI designs in Figma | June 3 |
| Sneha | Staging environment setup | June 4 |

---

**Next Steps:**
Follow-up meeting scheduled for June 5th to review progress on all action items.`;
