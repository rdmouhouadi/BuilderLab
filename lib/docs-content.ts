// lib/docs-content.ts
// Docs article registry — slug → article data + rendered content

export type DocArticle = {
  slug: string
  group: string
  title: string
  lead: string
  content: string   // HTML string rendered inside the docs main area
  prev?: { slug: string; label: string }
  next?: { slug: string; label: string }
}

export const DOC_GROUPS: { title: string; articles: { slug: string; label: string }[] }[] = [
  {
    title: 'Getting started',
    articles: [
      { slug: 'introduction',       label: 'Introduction' },
      { slug: 'create-account',     label: 'Create your account' },
      { slug: 'post-first-idea',    label: 'Post your first idea' },
    ],
  },
  {
    title: 'Working in teams',
    articles: [
      { slug: 'joining-a-project', label: 'Joining a project' },
      { slug: 'roles-and-skills',  label: 'Roles & skills' },
    ],
  },
  {
    title: 'Peer review',
    articles: [
      { slug: 'hiveos-workspace',   label: 'The HiveOS workspace' },
      { slug: 'hivecheck',          label: 'How HiveCheck works' },
      { slug: 'giving-feedback',    label: 'Giving good feedback' },
    ],
  },
  {
    title: 'Reference',
    articles: [
      { slug: 'getting-showcased', label: 'Getting showcased' },
      { slug: 'faq',               label: 'FAQ' },
    ],
  },
]

// Flat ordered list for prev/next links
const ORDERED_SLUGS = DOC_GROUPS.flatMap(g => g.articles.map(a => a.slug))

function prevNext(slug: string) {
  const idx = ORDERED_SLUGS.indexOf(slug)
  const prev = idx > 0 ? { slug: ORDERED_SLUGS[idx - 1], label: labelFor(ORDERED_SLUGS[idx - 1]) } : undefined
  const next = idx < ORDERED_SLUGS.length - 1 ? { slug: ORDERED_SLUGS[idx + 1], label: labelFor(ORDERED_SLUGS[idx + 1]) } : undefined
  return { prev, next }
}

function labelFor(slug: string): string {
  for (const group of DOC_GROUPS) {
    const art = group.articles.find(a => a.slug === slug)
    if (art) return art.label
  }
  return slug
}

export function groupFor(slug: string): string {
  for (const group of DOC_GROUPS) {
    if (group.articles.some(a => a.slug === slug)) return group.title
  }
  return 'Docs'
}

const ARTICLES: Record<string, Omit<DocArticle, 'slug' | 'prev' | 'next'>> = {
  introduction: {
    group: 'Getting started',
    title: 'Introduction',
    lead: 'BuilderLab is a platform for learners who want to build real, portfolio-worthy projects with a team — not alone.',
    content: `
<h2>What is BuilderLab?</h2>
<p>BuilderLab connects solo learners — data scientists, software engineers, data analysts, and designers — into cross-functional teams that build real products together. Every project goes through three phases: team formation, active building, and peer review.</p>
<p>Unlike tutorial projects or personal repos, BuilderLab projects are built in public, with real collaborators, real decisions, and real documentation. The result is a portfolio piece that proves you can work in a team.</p>

<h2>Who is it for?</h2>
<p>BuilderLab is for anyone who has finished the tutorials and is asking "what do I build now?" — and more importantly, "how do I build something worth showing?"</p>
<ul>
  <li>Junior developers and data scientists looking for their first real team experience</li>
  <li>Career changers who need portfolio projects to prove their skills</li>
  <li>Bootcamp grads who want to keep building after graduation</li>
  <li>Self-taught learners who want accountability and structure</li>
</ul>

<h2>How it works</h2>
<p>The flow is simple but intentional:</p>
<ol class="doc-steps">
  <li>Someone posts a project idea with a description, required roles, and a rough scope</li>
  <li>Builders browse the feed and request to join projects that match their skills</li>
  <li>The project owner accepts team members and the team begins building</li>
  <li>Progress is shared publicly via build updates throughout the project</li>
  <li>When ready, the team submits for peer review via HiveCheck</li>
</ol>

<div class="callout">
  <svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
  <p>BuilderLab is currently in early access. Features are being shipped continuously — check the <a href="/vision">Vision page</a> for the roadmap.</p>
</div>

<h2>The three layers</h2>
<p>BuilderLab is designed as a layered ecosystem:</p>
<ul>
  <li><strong>BuilderLab Core</strong> — team formation, project feed, build-in-public updates</li>
  <li><strong>HiveOS</strong> — shared workspace for tasks, milestones, and team coordination</li>
  <li><strong>HiveCheck</strong> — structured mid-project and final peer review</li>
</ul>
    `,
  },

  'create-account': {
    group: 'Getting started',
    title: 'Create your account',
    lead: 'Getting started on BuilderLab takes under two minutes. Here\'s what to expect.',
    content: `
<h2>Sign up</h2>
<p>Go to the <a href="/login">Sign up page</a> and create your account with an email and password. No social login is required — a simple email works fine.</p>

<h2>Complete your profile</h2>
<p>After signing up, you'll be prompted to complete your profile. This is important: project owners use your profile to decide whether to accept your join request.</p>
<ul>
  <li><strong>Skills</strong> — add the specific skills you bring (Python, React, SQL, etc.)</li>
  <li><strong>Domain</strong> — choose your primary domain (Data Science, Software Engineering, etc.)</li>
  <li><strong>Level</strong> — be honest about where you are; it helps teams form well</li>
  <li><strong>Bio</strong> — a short description of what you're looking to build and learn</li>
</ul>

<div class="callout">
  <svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
  <p>Profiles with completed skills and a bio get significantly more join request approvals. Take 5 minutes to fill it out properly.</p>
</div>

<h2>Explore the feed</h2>
<p>Once your profile is set, you'll land on the project feed. Browse open projects, read their descriptions, and find ones that match your skills and interests.</p>

<h2>Verify your email</h2>
<p>You'll receive a confirmation email after signing up. Click the link to verify your address — this is required before you can join or post projects.</p>
    `,
  },

  'post-first-idea': {
    group: 'Getting started',
    title: 'Post your first idea',
    lead: 'A well-written project post attracts committed collaborators. Here\'s how to write one.',
    content: `
<h2>What makes a good project post?</h2>
<p>The best project posts are specific, realistic, and honest about what's needed. Vague posts like "I want to build something with AI" attract no one. Specific posts attract the right people.</p>

<h2>Required fields</h2>
<ul>
  <li><strong>Title</strong> — a clear, specific name (not "My portfolio project")</li>
  <li><strong>Problem statement</strong> — what problem does this solve, and for whom?</li>
  <li><strong>Roles needed</strong> — be specific: "1 data scientist for ML modeling, 1 SWE for the API"</li>
  <li><strong>Skills needed</strong> — list the specific technologies and skills required</li>
  <li><strong>Scope</strong> — rough estimate of the project size (small/medium/large)</li>
</ul>

<div class="callout">
  <svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
  <p>Tip: Write your problem statement as a user story. "A student wants to track their job applications but can't find a simple tool that also surfaces insights" is 10× better than "a job tracker app."</p>
</div>

<h2>After posting</h2>
<p>Your project appears in the feed immediately. You'll start receiving join requests from builders who want to collaborate. Review each request and check the applicant's profile before accepting.</p>

<h2>Managing your project</h2>
<p>From your project page you can:</p>
<ol class="doc-steps">
  <li>Review and accept or decline join requests</li>
  <li>Post build updates to share progress with the community</li>
  <li>Manage your team through the HiveOS workspace</li>
  <li>Submit for peer review when ready</li>
</ol>
    `,
  },

  'joining-a-project': {
    group: 'Working in teams',
    title: 'Joining a project',
    lead: 'Find a project that fits your skills, send a strong join request, and hit the ground running.',
    content: `
<h2>Browsing the feed</h2>
<p>The project feed shows all open projects. Use the filters to narrow by skills, domain, or project size. Click any project to read the full description, see the team, and check what roles are still open.</p>

<h2>Sending a join request</h2>
<p>When you find a project you want to join, click "Request to join." You'll write a short message explaining:</p>
<ul>
  <li>Which role you're applying for</li>
  <li>What specific skills you bring to that role</li>
  <li>Why this particular project interests you</li>
  <li>What you hope to build and learn</li>
</ul>
<p>Keep it brief — 3–5 sentences. The project owner will review your profile and your message together.</p>

<div class="callout">
  <svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
  <p>Projects with specific role requirements are more likely to be active and well-organized. Prioritize those when browsing.</p>
</div>

<h2>After you're accepted</h2>
<p>Once accepted, you get access to the full project workspace — task board, team chat, build updates, and documentation. Introduce yourself to the team and check what's already been decided before diving in.</p>

<h2>Commitment</h2>
<p>BuilderLab projects work best when everyone shows up consistently. If you join, be honest with yourself about the time you can commit. It's better to join one project and finish it than to join three and ghost them all.</p>
    `,
  },

  'roles-and-skills': {
    group: 'Working in teams',
    title: 'Roles & skills',
    lead: 'BuilderLab is designed for cross-functional teams. Here\'s how roles and skills work on the platform.',
    content: `
<h2>Primary domains</h2>
<p>BuilderLab focuses on three primary domains that appear in most data-driven products:</p>
<ul>
  <li><strong>Software Engineering</strong> — backend, frontend, infrastructure, APIs</li>
  <li><strong>Data Science</strong> — ML modeling, analysis, experimentation</li>
  <li><strong>Data Analysis & Engineering</strong> — data pipelines, dashboards, analytics</li>
  <li><strong>Design & UX</strong> — product design, user research, prototyping</li>
  <li><strong>Product & Community</strong> — product strategy, community management, outreach</li>
</ul>

<h2>Skills</h2>
<p>Skills are more granular than domains. When posting a project, list the specific skills you need — not just "developer." When building your profile, add the specific skills you actually have.</p>

<div class="code-block"><span class="c">// Example: good role description</span>
<span class="g">Role:</span> Data Scientist
<span class="g">Skills needed:</span> Python, scikit-learn, pandas
<span class="g">Task:</span> Build and evaluate a recommendation model
</div>

<h2>Level</h2>
<p>BuilderLab has four levels: Junior, Mid, Senior, and Not sure. These aren't gating mechanisms — they help teams form with compatible expectations. A team of three juniors building together is great. A junior being mentored by a senior is also great. Just be honest.</p>

<h2>Why cross-functional?</h2>
<p>Real products don't get built by one person with one skill. BuilderLab projects are designed to mirror real team structures — which is why the most successful projects combine SWEs, data folks, and sometimes designers or product thinkers.</p>
    `,
  },

  'hiveos-workspace': {
    group: 'Peer review',
    title: 'The HiveOS workspace',
    lead: 'HiveOS is the shared workspace where your team organizes tasks, tracks milestones, and keeps momentum.',
    content: `
<h2>What is HiveOS?</h2>
<p>HiveOS is the project management layer of BuilderLab. Every project gets a shared workspace with a task board, milestone tracker, team chat, and build update log — all in one place.</p>

<h2>The task board</h2>
<p>Tasks flow through three columns: To Do → In Progress → Done. Any team member can create tasks, assign them, and move them through the board.</p>
<ul>
  <li>Create tasks with a title, description, and assigned owner</li>
  <li>Set a due date and link tasks to a milestone</li>
  <li>Add labels to group tasks by type (feature, bug, research, etc.)</li>
</ul>

<div class="callout">
  <svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
  <p>The team with the most clearly organized task board almost always finishes their project. Good task management is a force multiplier.</p>
</div>

<h2>Milestones</h2>
<p>Milestones are checkpoints that group tasks into larger deliverables. A typical project might have milestones like "MVP features defined," "First working prototype," and "Final review prep." Milestones help the team see progress at a higher level.</p>

<h2>Team chat</h2>
<p>The project chat is a persistent, threaded discussion space for your team. Use it to make decisions, share links, unblock each other, and coordinate — keeping everything in one place rather than scattered across DMs.</p>

<h2>Build updates</h2>
<p>Build updates are public posts from the project team. They serve two purposes: keeping the community updated on your progress, and creating a public record of the project's development. Aim for at least one update per milestone.</p>
    `,
  },

  hivecheck: {
    group: 'Peer review',
    title: 'How HiveCheck works',
    lead: 'HiveCheck is BuilderLab\'s structured peer review system — designed to give meaningful feedback, not grades.',
    content: `
<h2>What is HiveCheck?</h2>
<p>HiveCheck is the quality layer of BuilderLab. It provides two types of peer review: mid-project check-ins when your team is stuck, and a final review before you mark the project complete.</p>

<h2>Mid-project review</h2>
<p>When your team hits a wall — an architectural question, a data problem, a direction disagreement — you can request a mid-project HiveCheck. A reviewer from the community reads your project description and current progress, then gives structured feedback on the specific question you're asking.</p>

<h2>Final review</h2>
<p>Before marking a project complete, teams submit for a final HiveCheck. Reviewers evaluate the project across four dimensions:</p>
<ul>
  <li><strong>Problem clarity</strong> — Is the problem well-defined and worth solving?</li>
  <li><strong>Technical execution</strong> — Does the solution actually work? Is it reasonably well-structured?</li>
  <li><strong>Documentation</strong> — Can someone else understand what was built and why?</li>
  <li><strong>Team collaboration</strong> — Are there signs of real team coordination and shared ownership?</li>
</ul>

<div class="callout">
  <svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
  <p>HiveCheck is currently in beta. Feedback from early reviewers and teams is actively shaping how the system evolves.</p>
</div>

<h2>Who reviews?</h2>
<p>HiveCheck reviewers are BuilderLab members who have completed at least one project. Being a reviewer is a way to give back to the community — and to sharpen your own judgment by analyzing other people's work.</p>
    `,
  },

  'giving-feedback': {
    group: 'Peer review',
    title: 'Giving good feedback',
    lead: 'Feedback is only useful if it helps someone improve. Here\'s how to give feedback that actually lands.',
    content: `
<h2>The goal of feedback</h2>
<p>Good feedback doesn't judge — it illuminates. Your job as a HiveCheck reviewer is to help the team see their project more clearly, not to evaluate whether they're good developers.</p>

<h2>Be specific</h2>
<p>"The data pipeline is confusing" is not useful. "The data pipeline lacks documentation — I couldn't tell what the input format expected at step 3" is. Specificity turns vague criticism into actionable improvement.</p>

<h2>Positive and critical</h2>
<p>Good feedback includes both. Note what's working well — it helps the team understand what to preserve. Then address what needs improvement with concrete suggestions where possible.</p>

<div class="callout">
  <svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
  <p>The best review format: 2–3 things that work well, 2–3 concrete improvements with a brief "why," and one overall observation about the project direction.</p>
</div>

<h2>Focus on the work, not the person</h2>
<p>Review the project. Not the team's experience level, not their career trajectory. "This function is hard to read because it does three things at once — splitting it would make it easier to test" is about the code. "You're clearly a junior developer" is about a person. One is helpful. One is not.</p>

<h2>Calibrating your score</h2>
<p>HiveCheck uses a 1–5 scale per dimension. Use the full range. A 3 means "meets the standard for this project's scope." Save 5s for genuinely exceptional work, and use 1s only when something is fundamentally broken. Most projects land between 2 and 4.</p>
    `,
  },

  'getting-showcased': {
    group: 'Reference',
    title: 'Getting showcased',
    lead: 'Top BuilderLab projects get featured on the platform — here\'s how it works.',
    content: `
<h2>What is showcasing?</h2>
<p>Showcased projects appear in a curated section of the BuilderLab feed, highlighted for the community as examples of strong work. A showcase tag on your project is a signal to anyone reviewing your portfolio that this work passed community-level peer review.</p>

<h2>How projects get selected</h2>
<p>Projects become eligible for showcasing after completing a final HiveCheck review. The editorial team looks at:</p>
<ul>
  <li>HiveCheck scores (generally 3.5+ average across all dimensions)</li>
  <li>Build update history — did the team document their process?</li>
  <li>Problem clarity — is this a real problem with a clear scope?</li>
  <li>Community engagement — did others find this project interesting?</li>
</ul>

<div class="callout">
  <svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
  <p>The best path to a showcase: write detailed build updates throughout the project, document your decisions clearly, and submit for HiveCheck review before marking complete.</p>
</div>

<h2>What happens when your project is showcased?</h2>
<p>The project owner and all team members receive a notification. The project gets a featured badge visible on the feed and on each team member's profile. This badge links directly to the project, making it easy to share with recruiters, hiring managers, or anyone asking about your experience.</p>

<h2>Is showcasing guaranteed?</h2>
<p>No. Not every completed project will be showcased — and that's intentional. The showcase is meaningful because it's selective. Complete your project, give it your best effort, and the quality will speak for itself.</p>
    `,
  },

  faq: {
    group: 'Reference',
    title: 'FAQ',
    lead: 'Common questions about BuilderLab, answered.',
    content: `
<h2>Is BuilderLab free?</h2>
<p>Yes. BuilderLab is free to use during early access. We'll introduce paid features as the platform grows, but the core team formation and build-in-public features will remain free.</p>

<h2>How long do projects take?</h2>
<p>Most BuilderLab projects run 4–12 weeks depending on scope. We recommend starting with a small project (6–8 weeks) so you can finish it and have a complete, showcaseable piece in a reasonable time frame.</p>

<h2>What if a team member goes quiet?</h2>
<p>It happens. If a team member stops contributing, the project owner can remove them from the project. Their contributions up to that point remain documented in the build log. This is one reason we recommend small, committed teams over large ones.</p>

<h2>Can I be on multiple projects at once?</h2>
<p>Yes, but we recommend starting with one. Focus produces better outcomes. Once you've shipped one project, you'll have a much clearer sense of your capacity.</p>

<h2>Can I post a solo project?</h2>
<p>BuilderLab is specifically designed for collaborative projects. If you post a solo project, you won't be taking advantage of what the platform does best. That said, you can start a project and invite collaborators later.</p>

<h2>How do I get peer reviewed?</h2>
<p>See the <a href="/docs/hivecheck">HiveCheck documentation</a> for a full explanation. In short: submit your project for a final review from the HiveCheck tab in your project workspace.</p>

<h2>I found a bug / have a suggestion</h2>
<p>We love hearing from early users. Use the <a href="/contact">Contact page</a> to reach us — choose "Bug report" or "Suggestion" from the subject selector and describe what you found. We read every message.</p>

<h2>Where can I see what's being built next?</h2>
<p>The <a href="/vision">Vision page</a> has the public roadmap. BuilderLab is built in public, so major milestones get announced there and on the feed.</p>
    `,
  },
}

export function getArticle(slug: string): DocArticle | null {
  const art = ARTICLES[slug]
  if (!art) return null
  return { slug, ...art, ...prevNext(slug) }
}

export function getDefaultSlug(): string {
  return ORDERED_SLUGS[0]
}
