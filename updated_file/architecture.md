# Architecture Design Plan: Osasu Imarhiagbe's Personal Website

> A complete rebuild from Jekyll/Beautiful Jekyll into a modern React + TypeScript application that tells your life story — blending professional credentials with personality, warmth, and energy.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Design Philosophy & Color Palette](#2-design-philosophy--color-palette)
3. [Site Architecture & Page Structure](#3-site-architecture--page-structure)
4. [Detailed Page Designs](#4-detailed-page-designs)
5. [Component Architecture](#5-component-architecture)
6. [Photo Strategy & Placeholders](#6-photo-strategy--placeholders)
7. [Social Feed Integration](#7-social-feed-integration)
8. [Blog Migration Plan](#8-blog-migration-plan)
9. [Animations & Interactions](#9-animations--interactions)
10. [Deployment & CI/CD](#10-deployment--cicd)
11. [Migration Phases](#11-migration-phases)

---

## 1. Tech Stack

| Layer              | Technology                          | Rationale                                                                 |
| ------------------ | ----------------------------------- | ------------------------------------------------------------------------- |
| **Framework**      | Next.js 14+ (App Router)            | SSR/SSG for SEO, file-based routing, built-in image optimization          |
| **Language**       | TypeScript                          | Type safety, better developer experience                                  |
| **Styling**        | Tailwind CSS + Framer Motion        | Utility-first CSS for rapid design; Framer Motion for scroll animations   |
| **Content**        | MDX (Markdown + JSX)                | Write blog/adventure posts in Markdown with embedded React components     |
| **Deployment**     | Vercel (or GitHub Pages via export) | Zero-config deploys, edge functions for API routes                        |
| **Social Feeds**   | Next.js API routes (server-side)    | Proxy LinkedIn/Twitter/Instagram APIs to avoid CORS and rate limits       |
| **Image Handling** | Next.js `<Image>` + Cloudinary (optional) | Automatic lazy loading, responsive sizes, blur placeholders         |
| **Analytics**      | Google Analytics (`G-MBMZ051LW0`)   | Continuity with existing tracking                                         |

### Key Dependencies

```json
{
  "next": "^14.x",
  "react": "^18.x",
  "typescript": "^5.x",
  "tailwindcss": "^3.x",
  "framer-motion": "^11.x",
  "@next/mdx": "^14.x",
  "next-mdx-remote": "^4.x",
  "next-themes": "^0.x",
  "react-tweet": "^3.x",
  "rehype-pretty-code": "^0.x",
  "rehype-katex": "^7.x",
  "remark-math": "^6.x",
  "sharp": "^0.x"
}
```

---

## 2. Design Philosophy & Color Palette

### Vibe

*"A founder who codes, researches, lifts heavy, and eats well — telling his story."*

Not a sterile academic CV. Not a corporate SaaS landing page. Think **editorial magazine meets personal blog**. Warm, confident, grounded.

### Primary Palette

| Role            | Color               | Hex       | Usage                                                              |
| --------------- | ------------------- | --------- | ------------------------------------------------------------------ |
| **Deep Night**  | Rich dark navy      | `#0F1724` | Page backgrounds, nav bar                                          |
| **Warm Amber**  | Golden amber        | `#E8A838` | Accent highlights, CTAs, active states (Nigerian cultural warmth)  |
| **Ivory Cream** | Off-white           | `#FAF7F2` | Text on dark backgrounds, light section backgrounds                |
| **Sky Teal**    | Muted teal/cyan     | `#3DBCC1` | Secondary accent, links, tags                                      |
| **Ember Red**   | Warm terracotta     | `#C75B3A` | Hover states, notification dots, blog category badges              |
| **Soft Slate**  | Medium gray         | `#8B95A5` | Body text, muted labels                                            |

### Tailwind Config Extension

```ts
// tailwind.config.ts — colors extension
colors: {
  night:  '#0F1724',
  amber:  '#E8A838',
  cream:  '#FAF7F2',
  teal:   '#3DBCC1',
  ember:  '#C75B3A',
  slate:  '#8B95A5',
}
```

### Typography

| Role             | Font Family                       | Weight    | Usage                                  |
| ---------------- | --------------------------------- | --------- | -------------------------------------- |
| **Headings**     | `Space Grotesk` or `Clash Display`| 600–700   | Page titles, section headers           |
| **Body**         | `Inter` or `DM Sans`              | 400–500   | Paragraphs, UI text                    |
| **Accent/Quote** | `Playfair Display`                | 400 italic| Editorial pull-quotes, chapter titles  |

### Design Principles

- **Dark mode first** (matches existing LinkedIn aesthetic), with light mode toggle
- **Generous whitespace** — let photos and content breathe
- **Full-bleed hero images** with overlaid text
- **Scroll-triggered animations** — sections fade/slide in as you scroll
- **Mobile-first responsive** — everything looks great on phones

---

## 3. Site Architecture & Page Structure

### Route Map

```
/                          → Home (Hero + Life Chapters + Photo Mosaic)
/about                     → Extended bio + personal story (chapters format)
/work                      → Professional experience timeline
/projects                  → Projects showcase (Xyricon, StudyRadar, NSA, etc.)
/research                  → Academic research + publications + certifications
/adventures                → Travel, food, gym, life moments (photo-rich blog/gallery)
/adventures/[slug]         → Individual adventure story (MDX with photo galleries)
/blog                      → Technical blog (migrated ML posts + new content)
/blog/[slug]               → Individual blog post (MDX with code + math)
/feed                      → Social feed aggregator (LinkedIn, Twitter, Instagram)
/resume                    → Interactive resume + downloadable PDF
```

### Navigation Structure

```
┌──────────────────────────────────────────────────────────────────────┐
│  Logo: "O." or "Osasu"                                               │
│  Links: Home · About · Work · Projects · Adventures · Blog · Feed   │
│  Right: Theme Toggle (☀/🌙) · Resume button                         │
└──────────────────────────────────────────────────────────────────────┘
```

Sticky nav bar with `backdrop-filter: blur()` glass-morphism effect on scroll.

---

## 4. Detailed Page Designs

### 4.1 HOME (`/`)

The homepage is the gateway — immediately conveys a multidimensional person.

```
┌──────────────────────────────────────────────────────────────┐
│  NAVIGATION BAR (sticky, glass-morphism on scroll)           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  HERO SECTION (full viewport height)                         │
│  ┌──────────────────────────────────────────────────┐        │
│  │  [HERO PORTRAIT PHOTO — parallax effect]         │        │
│  │   use: 20260206_081553(1).jpg or similar          │        │
│  │                                                   │        │
│  │  "I build intelligent systems,                    │        │
│  │   chase summits, and eat my way                   │        │
│  │   through every city I visit."                    │        │
│  │                                                   │        │
│  │  Osasumwen Imarhiagbe                             │        │
│  │  ML Engineer · Founder · Researcher               │        │
│  │                                                   │        │
│  │  [Scroll indicator ↓]                             │        │
│  └──────────────────────────────────────────────────┘        │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  "CHAPTERS" SECTION (horizontal scroll cards)                │
│  Life story told in visual chapters:                         │
│                                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Nigeria │ │  Grad   │ │Research │ │ Xyricon │ ...        │
│  │ Origins │ │ School  │ │  & AI   │ │ & Build │           │
│  │         │ │         │ │         │ │         │           │
│  │ [photo] │ │ [photo] │ │ [photo] │ │ [photo] │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│                                                              │
│  Each card links deeper into the site                        │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  WHAT I'M UP TO NOW                                          │
│  Auto-updated from social feeds:                             │
│  Latest LinkedIn post │ Latest tweet │ Current status        │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  PHOTO MOSAIC (masonry grid, subtle hover zoom)              │
│  Mix of: gym, travel, conferences, food, friends             │
│  ┌──────┬──────────┬──────┐                                  │
│  │ grad │   gym    │ hike │                                  │
│  │      │          │      │                                  │
│  ├──────┴────┬─────┴──────┤                                  │
│  │  conf     │   food     │                                  │
│  │           │            │                                  │
│  └───────────┴────────────┘                                  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  FEATURED WORK (3 spotlight cards)                           │
│  Xyricon / StudyRadar / Nigeria Startup Act                  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  FOOTER                                                      │
│  Social links · Contact · "Built with love and code"         │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 ABOUT (`/about`)

Not a formal bio — a first-person story told in chapters with photos woven in.

```
┌──────────────────────────────────────────────────────────────┐
│  CINEMATIC HEADER                                            │
│  [B&W photo: 20250905_185610(1).jpg — editorial candid]     │
│  "The Story So Far"                                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  CHAPTER: ORIGINS                                            │
│  Growing up in Nigeria. Early interest in tech.              │
│  BSc at Benson Idahosa University (4.84/5.00).              │
│  Software engineering at Gygital. Data science at ZAIR.      │
│  [PLACEHOLDER: Nigeria / childhood / university photos]      │
│                                                              │
│  CHAPTER: THE LEAP                                           │
│  Moving to Canada. Starting MSc at ULethbridge.              │
│  Alberta winters. Building a new life from scratch.          │
│  Coca-Cola Graduate Admission Award.                         │
│  [PLACEHOLDER: Canada arrival / campus / Alberta photos]     │
│                                                              │
│  CHAPTER: THE GRIND                                          │
│  Research life. TA-ing 4 courses across 5 terms.             │
│  Long lab nights. BoRefAttnNet and DySTTM.                   │
│  The thesis defense: 3 intense hours.                        │
│  "Fight or flight? I chose to fight — because mama           │
│   didn't raise a quitter."                                   │
│  [PLACEHOLDER: research / lab / thesis defense photos]       │
│                                                              │
│  CHAPTER: BEYOND THE LAB                                     │
│  Gym, soccer, food adventures, road trips, kayaking.         │
│  The human behind the ML models.                             │
│  [USE: 20251224_100824.jpg (gym)]                            │
│  [PLACEHOLDER: soccer, food, hiking, kayaking photos]        │
│                                                              │
│  CHAPTER: WHAT DRIVES ME                                     │
│  Family. Community. The Nigeria Startup Act impact.          │
│  Building Xyricon. AIRI Foundation advisory.                 │
│  "For LIFE to remain on EARTH, the FUTURE must be            │
│   ARTIFICIAL... !?!"                                         │
│  [USE: graduation family photos, Xyricon pitch photo]        │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  QUICK FACTS (floating sidebar or cards)                     │
│  - Based in: Calgary, AB, Canada                             │
│  - From: Nigeria                                             │
│  - Currently: Founder @ Xyricon Technologies                 │
│  - Favorite workout: [your answer]                           │
│  - Gym PR: [your answer]                                     │
│  - Favorite food spot: [your answer]                         │
│  - Currently reading: [your answer]                          │
└──────────────────────────────────────────────────────────────┘
```

### 4.3 WORK (`/work`)

Interactive career timeline — not a boring resume list.

```
┌──────────────────────────────────────────────────────────────┐
│  ANIMATED VERTICAL TIMELINE (reveals on scroll)              │
│                                                              │
│  2026 ─── AI Coding Expert @ Micro1 (Titan Pandora)         │
│           Evaluating frontier LLMs for production tasks      │
│                                                              │
│  2025 ─┬─ Founder/CEO @ Xyricon Technologies                │
│        │  Auron: edge-first 911 AI emergency copilot         │
│        │  [USE: IMG_20260202_230156_873.jpg — pitch]         │
│        │                                                     │
│        └─ ML Engineer / Tech Lead @ StudyRadar.AI            │
│           RAG pipeline, voice OSCE stations                  │
│           Yahoo Finance feature                              │
│                                                              │
│  2023 ─┬─ Researcher @ ULethbridge                           │
│  to    │  Alberta Innovates Scholar                          │
│  2025  │  BoRefAttnNet, DySTTM — schizophrenia research     │
│        │  IHPCSS Lisbon 2025 (1 of 10 Canadians)            │
│        │  ICICT 2026 oral presentation accepted              │
│        │                                                     │
│        └─ Graduate Teaching Assistant @ ULethbridge           │
│           Discrete Structures, Stats, Programming II         │
│           5 terms, 60–90 students/term                       │
│                                                              │
│  2022 ─── Specialist Consultant @ Nigeria Startup Act        │
│  to 2023  Drafting/Review → Bill signed into law             │
│           Presidential Recognition certificate               │
│                                                              │
│  2022 ─── Startup Mentor @ NewChip Accelerator (Remote)      │
│  to 2023  Growth strategy for early-stage startups           │
│                                                              │
│  2020 ─── Software Engineer (Contract) @ Britkay Enterprise  │
│  to 2022  E-commerce platform expansion                      │
│                                                              │
│  2018 ─── Data Scientist @ ZAIR                              │
│  to 2023  Churn prediction (XGBoost, 18% attrition cut)     │
│           Docker + GCP deployment, MLOps                     │
│                                                              │
│  2015 ─── Software Engineer @ Gygital                        │
│  to 2018  Enterprise client solutions, backend services      │
│                                                              │
│  2025 ─── Advisory Board Member @ AIRI Foundation            │
│           AI for Responsible Inclusion                        │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  [Download Full Resume — PDF]                                │
└──────────────────────────────────────────────────────────────┘
```

### 4.4 PROJECTS (`/projects`)

Large visual showcases with alternating left-right layout.

**Projects to feature:**

| #  | Project                    | Stack                                    | Links                        |
| -- | -------------------------- | ---------------------------------------- | ---------------------------- |
| 1  | **Xyricon / Auron**        | Python, Edge AI, NG9-1-1, WebSocket      | [Live] [Pitch Deck]          |
| 2  | **StudyRadar.AI**          | Django-REST, React, GPT-4, GCP, Docker   | [Live] [Yahoo Finance Press] |
| 3  | **BoRefAttnNet**           | PyTorch, 3D U-Net, MLflow, GCP           | [Paper] [Code]               |
| 4  | **DySTTM**                 | PyTorch, sMRI+fMRI, Transformers         | [Thesis] [Code]              |
| 5  | **Nigeria Startup Act**    | Policy / Legislative                     | [Law Text] [Recognition]     |
| 6  | **AIRI Foundation**        | Advisory / Community                     | [Website]                    |

Each project card includes:
- Hero image or screenshot
- Tech stack badges (pill-style)
- 2–3 sentence description
- Impact metric (if applicable)
- Action links

### 4.5 RESEARCH (`/research`)

```
┌──────────────────────────────────────────────────────────────┐
│  THESIS HIGHLIGHT (hero banner)                              │
│  "Advanced Boundary-Enhanced Instance Segmentation and       │
│   Spatial-Temporal Transformer Models for Automated          │
│   Schizophrenic Investigation"                               │
│  MSc Thesis · University of Lethbridge · 2025               │
│  [Download Thesis PDF] [View Defense Slides]                 │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  PUBLICATIONS (filterable cards)                             │
│  - BoRefAttnNet — ICICT 2026 (Springer LNNS)               │
│    Oral presentation accepted                                │
│    0.97 Dice, +13% over baseline, 52% faster inference      │
│  - [Additional publications as they come]                    │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  CERTIFICATIONS (grid of badge cards)                        │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐               │
│  │ TensorFlow │ │ CNNs in TF │ │ NLP in TF  │               │
│  │ Developer  │ │ Coursera/  │ │ Coursera/  │               │
│  │ Google     │ │ DL.AI      │ │ DL.AI      │               │
│  │ 2024–2027  │ │ 2022       │ │ 2022       │               │
│  └────────────┘ └────────────┘ └────────────┘               │
│  ┌────────────┐                                              │
│  │ Neural Nets│                                              │
│  │ & DL       │                                              │
│  │ DL.AI      │                                              │
│  │ 2022       │                                              │
│  └────────────┘                                              │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  TRAINING & CONFERENCES (photo-enriched cards)               │
│  - IHPCSS Lisbon 2025 — 1 of 10 Canadian researchers        │
│    [USE: IHPCSS certificate + group photos from LinkedIn]    │
│  - Inventures 2025 Calgary — Alberta Innovates sponsored     │
│    [USE: conference photos from LinkedIn]                    │
│  - Upper Bound 2025 Edmonton — AMII                         │
│    Met Richard Sutton (father of RL)                         │
│  - BBVA Innovation Expo 2026 — recognized as 1 of 7         │
│    Black founders in Canada's innovation ecosystem           │
└──────────────────────────────────────────────────────────────┘
```

### 4.6 ADVENTURES (`/adventures`) — The Life Blog

Photo-rich, story-driven blog. The heart of the "not-so-professional" side.

#### Listing Page

Pinterest-style **masonry grid** of adventure "cards", each with:
- Cover photo (fills card)
- Title overlay at bottom
- Date + location
- Category tag(s)

#### Categories / Tags

| Tag           | Content                                            |
| ------------- | -------------------------------------------------- |
| `travel`      | Lisbon, Luxembourg, Memphis, road trips            |
| `food`        | Restaurants, cooking, food discoveries              |
| `fitness`     | Gym sessions, soccer games, PRs                    |
| `graduation`  | Convocation, party, family visit                   |
| `conferences` | IHPCSS, Inventures, Upper Bound, BBVA              |
| `friends`     | Graduation party, hangouts, hosting                |
| `hiking`      | Mountain and trail adventures                      |
| `kayaking`    | Water adventures                                   |
| `road-trips`  | Cross-country/province drives                      |

#### Individual Adventure Post (`/adventures/[slug]`)

```
┌──────────────────────────────────────────────────────────────┐
│  FULL-BLEED COVER IMAGE (parallax)                           │
│  Title overlay: "Graduation Day: Two Years in Three Hours"   │
│  October 2025 · Lethbridge, AB                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  STORY TEXT (MDX — markdown with embedded components)        │
│                                                              │
│  [Embedded PhotoCarousel component]                          │
│  ┌────┬────┬────┬────┐                                       │
│  │    │    │ ►  │    │  ← swipeable photo gallery            │
│  └────┴────┴────┴────┘                                       │
│                                                              │
│  More narrative text...                                      │
│                                                              │
│  [Full-width cinematic photo]                                │
│                                                              │
│  More narrative text...                                      │
│                                                              │
│  [PhotoGrid — 2x2 or 3-column masonry]                       │
│  ┌────┬────┬────┐                                            │
│  │    │    │    │                                            │
│  └────┴────┴────┘                                            │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  RELATED ADVENTURES                                          │
│  [card] [card] [card]                                        │
└──────────────────────────────────────────────────────────────┘
```

**Photo Transition Styles (powered by Framer Motion):**

| Style              | Use Case                                 |
| ------------------ | ---------------------------------------- |
| Fade-in on scroll  | Photos appear as you scroll down         |
| Carousel / Slider  | Event photo sets (graduation party)      |
| Lightbox           | Click any photo for full-screen view     |
| Parallax           | Cover images move slower than text       |
| Hover zoom         | Masonry grid photos scale subtly         |
| Staggered reveal   | Grid photos appear one-by-one on scroll  |

### 4.7 BLOG (`/blog`)

Migrates existing 60+ ML/DL posts from Jekyll, plus new content.

**Layout:** Card-based listing with search bar and category filter pills.

**Categories:**
- Machine Learning
- Deep Learning
- Computer Vision
- HPC / Parallel Computing
- Conference Notes
- Career & Reflections

**Post Features:**
- Syntax highlighting via `rehype-pretty-code` (Shiki-based)
- LaTeX math rendering via KaTeX (`remark-math` + `rehype-katex`)
- Table of contents sidebar (auto-generated from headings)
- Estimated reading time
- Share buttons (Twitter, LinkedIn, copy link)

### 4.8 SOCIAL FEED (`/feed`)

Unified feed pulling from all social platforms.

```
┌──────────────────────────────────────────────────────────────┐
│  FILTER BAR                                                  │
│  [All] [LinkedIn] [Twitter/X] [Instagram]                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─ LinkedIn ──────────────────────────────────────┐         │
│  │  Osasu Imarhiagbe · 3w                          │         │
│  │  "It's Black History Month and I am honoured    │         │
│  │   to be recognized as one of this year's 7      │         │
│  │   Black founders..."                            │         │
│  │  [Embedded image]                               │         │
│  │  [Read more on LinkedIn →]                      │         │
│  └─────────────────────────────────────────────────┘         │
│                                                              │
│  ┌─ Twitter/X ─────────────────────────────────────┐         │
│  │  @osasumwen · 2d                                │         │
│  │  "Just shipped the new version of..."           │         │
│  │  [View on Twitter →]                            │         │
│  └─────────────────────────────────────────────────┘         │
│                                                              │
│  ┌─ Instagram ─────────────────────────────────────┐         │
│  │  [Photo grid from latest posts]                 │         │
│  │  [View on Instagram →]                          │         │
│  └─────────────────────────────────────────────────┘         │
│                                                              │
│  [Load more...]                                              │
└──────────────────────────────────────────────────────────────┘
```

### 4.9 RESUME (`/resume`)

- Interactive skills visualization (radar or bar chart)
- Embedded PDF viewer for the formal resume
- Prominent download button for `Osasumwen_Raphael_Imarhiagbe_FlowCV_Resume.pdf`

---

## 5. Component Architecture

### Directory Structure

```
src/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout (nav + footer + theme provider)
│   ├── page.tsx                      # Home
│   ├── about/
│   │   └── page.tsx
│   ├── work/
│   │   └── page.tsx
│   ├── projects/
│   │   └── page.tsx
│   ├── research/
│   │   └── page.tsx
│   ├── adventures/
│   │   ├── page.tsx                  # Adventures listing (masonry grid)
│   │   └── [slug]/
│   │       └── page.tsx              # Individual adventure (MDX rendered)
│   ├── blog/
│   │   ├── page.tsx                  # Blog listing with search + filters
│   │   └── [slug]/
│   │       └── page.tsx              # Individual blog post (MDX rendered)
│   ├── feed/
│   │   └── page.tsx                  # Social feed aggregator
│   ├── resume/
│   │   └── page.tsx
│   └── api/                          # Server-side API routes
│       ├── linkedin/
│       │   └── route.ts
│       ├── twitter/
│       │   └── route.ts
│       └── instagram/
│           └── route.ts
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                # Sticky nav with glass-morphism
│   │   ├── Footer.tsx                # Site footer with social links
│   │   ├── ThemeToggle.tsx           # Dark / light mode switch
│   │   └── MobileMenu.tsx            # Hamburger menu for mobile
│   │
│   ├── home/
│   │   ├── HeroSection.tsx           # Full-viewport hero with portrait photo
│   │   ├── ChapterCards.tsx          # Horizontal-scroll life chapter cards
│   │   ├── NowSection.tsx            # "What I'm up to" live social feed
│   │   ├── PhotoMosaic.tsx           # Masonry image grid
│   │   └── FeaturedWork.tsx          # 3 project spotlight cards
│   │
│   ├── about/
│   │   ├── ChapterSection.tsx        # Story chapter with photo + text
│   │   └── QuickFacts.tsx            # Fun facts sidebar / card grid
│   │
│   ├── work/
│   │   ├── Timeline.tsx              # Animated vertical timeline container
│   │   └── TimelineItem.tsx          # Individual timeline entry
│   │
│   ├── projects/
│   │   ├── ProjectCard.tsx           # Large showcase card (image + details)
│   │   └── TechBadge.tsx             # Tech stack pill badge
│   │
│   ├── research/
│   │   ├── ThesisHighlight.tsx       # Hero banner for thesis
│   │   ├── PublicationCard.tsx       # Publication entry card
│   │   └── CertBadge.tsx             # Certification badge card
│   │
│   ├── adventures/
│   │   ├── AdventureGrid.tsx         # Masonry grid of adventure cards
│   │   ├── AdventureCard.tsx         # Individual card in the grid
│   │   ├── PhotoCarousel.tsx         # Swipeable photo gallery (in-post)
│   │   ├── PhotoGrid.tsx             # In-post 2x2 or 3-col photo grid
│   │   ├── FullBleedImage.tsx        # Parallax cover image component
│   │   └── Lightbox.tsx              # Full-screen photo viewer overlay
│   │
│   ├── blog/
│   │   ├── PostCard.tsx              # Blog listing card
│   │   ├── PostHeader.tsx            # Post hero with title + metadata
│   │   ├── TableOfContents.tsx       # Floating TOC sidebar
│   │   └── SearchBar.tsx             # Blog search input
│   │
│   ├── feed/
│   │   ├── SocialCard.tsx            # Generic social post card
│   │   ├── LinkedInEmbed.tsx         # LinkedIn post styled card
│   │   ├── TweetEmbed.tsx            # Twitter/X post embed (react-tweet)
│   │   └── InstagramEmbed.tsx        # Instagram post/photo card
│   │
│   ├── shared/
│   │   ├── AnimateOnScroll.tsx       # Framer Motion scroll trigger wrapper
│   │   ├── SectionHeading.tsx        # Consistent section title component
│   │   ├── Tag.tsx                   # Category / tag pill
│   │   ├── Button.tsx                # Reusable button component
│   │   └── ImagePlaceholder.tsx      # "Add your photo here" dev placeholder
│   │
│   └── mdx/                          # Custom components available in MDX
│       ├── PhotoCarousel.tsx         # <PhotoCarousel images={[...]} />
│       ├── PhotoGrid.tsx             # <PhotoGrid images={[...]} cols={3} />
│       ├── Callout.tsx               # <Callout type="info">...</Callout>
│       └── CodeBlock.tsx             # Enhanced code block with copy button
│
├── content/
│   ├── adventures/                   # MDX files for adventure blog posts
│   │   ├── graduation-day.mdx
│   │   ├── lisbon-ihpcss-2025.mdx
│   │   ├── memphis-road-trip.mdx
│   │   ├── inventures-2025.mdx
│   │   ├── upper-bound-2025.mdx
│   │   ├── bbva-innovation-expo.mdx
│   │   └── ...
│   │
│   ├── blog/                         # MDX files — migrated + new posts
│   │   ├── transformers-explained.mdx
│   │   ├── ...                       # (60+ migrated from _posts/)
│   │   └── ...
│   │
│   └── data/
│       ├── projects.ts               # Project metadata (typed)
│       ├── timeline.ts               # Work experience entries (typed)
│       ├── publications.ts           # Publication entries (typed)
│       ├── certifications.ts         # Certification entries (typed)
│       └── social-posts.ts           # Curated social post IDs/URLs
│
├── lib/
│   ├── social/
│   │   ├── linkedin.ts              # LinkedIn API client
│   │   ├── twitter.ts               # Twitter API v2 client
│   │   └── instagram.ts             # Instagram Basic Display API client
│   ├── mdx.ts                       # MDX processing (compile, serialize)
│   ├── content.ts                   # Content fetching utilities
│   └── utils.ts                     # General helpers (date formatting, etc.)
│
├── hooks/
│   ├── useScrollProgress.ts         # Track scroll position (0–1)
│   ├── useInView.ts                 # Detect element in viewport
│   └── useTheme.ts                  # Theme toggle hook
│
├── types/
│   └── index.ts                     # Shared TypeScript interfaces
│
├── styles/
│   ├── globals.css                  # Tailwind directives + CSS custom properties
│   └── fonts.ts                     # next/font configuration
│
├── public/
│   ├── images/
│   │   ├── hero/                    # Hero portrait photos
│   │   ├── adventures/              # Adventure photos (organized by slug)
│   │   │   ├── graduation/
│   │   │   ├── lisbon/
│   │   │   ├── memphis/
│   │   │   └── ...
│   │   ├── projects/                # Project screenshots / logos
│   │   ├── work/                    # Conference and work photos
│   │   ├── research/                # Diagrams, certificates
│   │   └── gallery/                 # General photo mosaic images
│   ├── resume.pdf                   # Downloadable resume
│   ├── favicon.ico
│   └── og-image.png                 # Open Graph social sharing image
│
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
├── package.json
└── README.md
```

### Key TypeScript Interfaces

```ts
// types/index.ts

interface Project {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  coverImage: string;
  techStack: string[];
  links: { label: string; url: string }[];
  featured: boolean;
}

interface TimelineEntry {
  year: string;
  title: string;
  company: string;
  location?: string;
  description: string;
  highlights: string[];
  image?: string;
  icon: string;
}

interface Adventure {
  slug: string;
  title: string;
  date: string;
  location: string;
  coverImage: string;
  tags: string[];
  excerpt: string;
}

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  excerpt: string;
  readingTime: number;
}

interface SocialPost {
  platform: 'linkedin' | 'twitter' | 'instagram';
  id: string;
  url: string;
  content?: string;
  image?: string;
  date: string;
}

interface Publication {
  title: string;
  venue: string;
  year: number;
  authors: string[];
  links: { label: string; url: string }[];
  highlight?: string;
}

interface Certification {
  title: string;
  issuer: string;
  date: string;
  credentialId: string;
  credentialUrl?: string;
}
```

---

## 6. Photo Strategy & Placeholders

### Photos Already Available (from `updated_file/`)

| File                             | Suggested Use                            | Page / Section         |
| -------------------------------- | ---------------------------------------- | ---------------------- |
| `20260206_081553(1).jpg`         | **Hero portrait** (suit + bookshelf)     | Home hero              |
| `20260206_081555(1).jpg`         | **Alt hero** or About header             | Home / About           |
| `20250905_185610(1).jpg`         | **About page header** (B&W candid)       | About cinematic hero   |
| `20260128_104813.jpg`            | **Casual portrait** (sweater + books)    | About "Beyond the Lab" |
| `20251224_100824.jpg`            | **Gym / fitness**                        | Adventures / About     |
| `IMG-20251019-WA0024.jpg`        | **Graduation** — with family             | Adventures: Graduation |
| `IMG-20251019-WA0032.jpg`        | **Graduation** — with family             | Adventures: Graduation |
| `IMG-20251019-WA0074.jpg`        | **Graduation party** — friends group     | Adventures: Grad party |
| `20251018_123204.jpg`            | Graduation / event                       | Adventures: Graduation |
| `20251018_123935.jpg`            | Graduation / event                       | Adventures: Graduation |
| `20251019_153851.jpg`            | Graduation ceremony                      | Adventures: Graduation |
| `20251019_154123(0).jpg`         | Graduation ceremony                      | Adventures: Graduation |
| `20251019_180014(0).jpg`         | Graduation / event                       | Adventures: Graduation |
| `IMG_20251122_114710.jpg`        | **Conference** — suited with colleagues  | Work / Projects        |
| `IMG_20260202_230156_873.jpg`    | **Xyricon pitch** — on stage presenting  | Projects: Xyricon      |
| `20251010_205135.jpg`            | Personal / lifestyle                     | Photo mosaic           |
| `20250927_084114.jpg`            | Personal / lifestyle                     | Photo mosaic           |

### Placeholders Needed (photos to add later)

| Category                  | What to Add                                                  | Suggested Location         |
| ------------------------- | ------------------------------------------------------------ | -------------------------- |
| **Hiking / Trails**       | Photos from hiking adventures                                | `public/images/adventures/hiking/`     |
| **Kayaking**              | Action shots on the water                                    | `public/images/adventures/kayaking/`   |
| **Road Trips**            | Car selfies, scenic drives, Memphis trip                     | `public/images/adventures/road-trips/` |
| **Food Adventures**       | Restaurant visits, dishes, cooking                           | `public/images/adventures/food/`       |
| **Soccer / Football**     | Playing or team photos                                       | `public/images/adventures/soccer/`     |
| **Lisbon / Luxembourg**   | Travel photos from IHPCSS trip extension                     | `public/images/adventures/lisbon/`     |
| **Nigeria Nostalgia**     | Earlier life, hometown, family, university                   | `public/images/about/origins/`         |
| **Lab / Research**        | Working at computer, lab setup, whiteboard                   | `public/images/research/`              |
| **Canada Life**           | Alberta landscapes, campus, first snow                       | `public/images/about/canada/`          |
| **Friends & Community**   | Hangouts beyond graduation party                             | `public/images/gallery/`               |

---

## 7. Social Feed Integration

### LinkedIn

| Aspect          | Detail                                                                   |
| --------------- | ------------------------------------------------------------------------ |
| **Strategy**    | LinkedIn API v2 via Next.js API route, OR curated manual approach        |
| **Fallback**    | Store post URLs + excerpts in `content/data/social-posts.ts`, render as styled cards |
| **Cache**       | ISR (Incremental Static Regeneration) — rebuild every 6 hours            |
| **Display**     | Dark-themed cards mimicking LinkedIn's aesthetic                          |
| **Profile URL** | `linkedin.com/in/osasumwen`                                              |

> **Note:** LinkedIn's API is restrictive for personal profiles. The most reliable approach is the curated fallback: you add post URLs/content to a data file, and the site renders them beautifully. You can also use LinkedIn's oEmbed endpoint for individual posts.

### Twitter / X

| Aspect          | Detail                                                                   |
| --------------- | ------------------------------------------------------------------------ |
| **Strategy**    | `react-tweet` by Vercel — renders tweets as static HTML at build time    |
| **Advantage**   | No API key needed; no rate limits; fast rendering                        |
| **Config**      | Store tweet IDs in `content/data/social-posts.ts`                        |
| **Display**     | Native-looking tweet embeds, themed to match site                        |
| **Profile**     | `@sasumwen`                                                               |

### Instagram

| Aspect          | Detail                                                                   |
| --------------- | ------------------------------------------------------------------------ |
| **Strategy**    | Instagram Basic Display API → fetch latest 12 posts via API route        |
| **Cache**       | ISR every 12 hours                                                       |
| **Fallback**    | Manual photo grid with links to posts                                    |
| **Display**     | Photo grid with caption on hover; click opens Instagram                  |

### Fallback: Curated Approach

If API access proves too restrictive, the data file approach works well:

```ts
// content/data/social-posts.ts
export const socialPosts: SocialPost[] = [
  {
    platform: 'linkedin',
    id: 'bbva-2026',
    url: 'https://linkedin.com/posts/...',
    content: "It's Black History Month and I am honoured to be recognized...",
    image: '/images/feed/bbva-post.jpg',
    date: '2026-02-05',
  },
  {
    platform: 'twitter',
    id: '1234567890',
    url: 'https://twitter.com/sasumwen/status/...',
    date: '2026-02-20',
  },
  // ...
];
```

---

## 8. Blog Migration Plan

### Source

60+ Markdown posts in `_posts/` directory, formatted as `YYYY-MM-DD-title.md` with YAML frontmatter.

### Migration Steps

1. **Parse** existing Jekyll `YYYY-MM-DD-title.md` files
2. **Transform** YAML frontmatter to MDX-compatible format:
   ```yaml
   # Before (Jekyll)                    # After (MDX)
   ---                                  ---
   layout: post                         title: "Post Title"
   title: "Post Title"                  date: "2024-03-15"
   tags: [ml, deep-learning]            category: "Machine Learning"
   mathjax: true                        tags: ["ml", "deep-learning"]
   ---                                  excerpt: "First paragraph..."
                                        ---
   ```
3. **Replace** MathJax delimiters with KaTeX-compatible syntax:
   - `$$...$$` → stays (compatible)
   - `$...$` → stays (compatible)
   - `\(...\)` → `$...$` inline
4. **Preserve** URLs via redirects in `next.config.mjs` so old links (`/:year-:month-:day-:title/`) don't break:
   ```js
   // next.config.mjs
   async redirects() {
     return [
       { source: '/:year-:month-:day-:slug', destination: '/blog/:slug', permanent: true },
     ];
   }
   ```
5. **Categorize** posts into taxonomy: ML, DL, CV, HPC, Conference Notes, Career

### Automation Script

A one-time Node.js migration script (`scripts/migrate-posts.ts`) will:
- Read all files from `_posts/`
- Parse frontmatter + body
- Transform to MDX format
- Write to `content/blog/`
- Generate a report of any issues (broken images, invalid math, etc.)

---

## 9. Animations & Interactions

| Element             | Animation                        | Implementation                          |
| ------------------- | -------------------------------- | --------------------------------------- |
| Page transitions    | Fade + slide between routes      | Framer Motion `AnimatePresence`         |
| Scroll reveals      | Fade-up with stagger delay       | Framer Motion `useInView` + `motion.div`|
| Photo mosaic        | Scale on hover, lightbox on click| Framer Motion `whileHover` + portal     |
| Timeline dots       | Pulse glow when in viewport      | CSS `@keyframes` animation              |
| Chapter cards       | Horizontal drag/scroll with snap | CSS `scroll-snap-type` + Framer `drag`  |
| Photo carousels     | Swipe with spring physics        | Framer Motion `drag="x"` + constraints  |
| Nav bar             | Glass-morphism appears on scroll | CSS `backdrop-filter` + scroll listener |
| Theme toggle        | Smooth color crossfade           | CSS `transition` on custom properties   |
| Social feed cards   | Skeleton → content fade-in       | Framer Motion `initial`/`animate`       |
| Hero text           | Typewriter or word-by-word fade  | Framer Motion `variants` with delay     |
| Project cards       | Tilt on hover (3D perspective)   | CSS `transform: perspective() rotateX()`|

---

## 10. Deployment & CI/CD

### Primary: Vercel

```
GitHub Repository (sasumwen.github.io)
       │
       ▼
   Push to main branch
       │
       ▼
   Vercel Auto-Deploy
   ├── Install dependencies
   ├── Build Next.js (SSG + ISR pages)
   ├── Generate static blog pages from MDX
   ├── Pre-render social feed cards (ISR)
   └── Deploy to Vercel Edge CDN
       │
       ▼
   Live at osasumwen.com (custom domain)
   or sasumwen.github.io (fallback)
```

### Alternative: GitHub Pages

```
GitHub Repository
       │
       ▼
   Push to main branch
       │
       ▼
   GitHub Actions Workflow
   ├── Install dependencies
   ├── Run `next build && next export`
   ├── Output to `out/` directory
   └── Deploy to GitHub Pages (gh-pages branch)
       │
       ▼
   Live at sasumwen.github.io
```

> **Tradeoff:** GitHub Pages only supports fully static export (no ISR, no API routes). Social feeds would need to be client-side fetched or pre-built. Vercel is recommended.

### Environment Variables

```env
# .env.local (not committed)
LINKEDIN_ACCESS_TOKEN=...
TWITTER_BEARER_TOKEN=...
INSTAGRAM_ACCESS_TOKEN=...
NEXT_PUBLIC_GA_ID=G-MBMZ051LW0
```

---

## 11. Migration Phases

| Phase   | Scope                                                                                   | Key Deliverables                                      |
| ------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **P1**  | Project scaffolding, design system, layout (Navbar, Footer, ThemeToggle), Home page      | Running Next.js app with hero, chapters, mosaic        |
| **P2**  | About page (story chapters), Work page (animated timeline)                               | Two complete story-driven pages                        |
| **P3**  | Projects showcase, Research page (thesis, publications, certs, conferences)               | Portfolio & academic content live                      |
| **P4**  | Adventures section (MDX setup, photo components, first 3–5 adventure stories)            | Photo-rich life blog functional                        |
| **P5**  | Technical blog migration (60+ posts converted from Jekyll, search, categories)           | All existing content preserved and searchable          |
| **P6**  | Social feed integration (LinkedIn, Twitter, Instagram API routes or curated fallback)    | Live social feed page                                  |
| **P7**  | Resume page, dark/light mode polish, animations, SEO meta tags, OG images, analytics     | Polished experience                                    |
| **P8**  | Mobile optimization, performance audit (Lighthouse 90+), accessibility pass, launch       | Production-ready ship                                  |

---

## Quick Reference: Adventure Stories to Write First

These are ready to go based on your photos and LinkedIn posts:

1. **"Graduation Day: Two Years in Three Hours"** — thesis defense, convocation, family visit, the party
2. **"IHPCSS Lisbon 2025: Representing Canada"** — the summer school, presenting BoRefAttnNet, Luxembourg extension
3. **"Inventures & Upper Bound: A Week of Innovation"** — Edmonton + Calgary back-to-back conferences, meeting Richard Sutton
4. **"BBVA Innovation Expo: 7 Black Founders"** — Black History Month recognition, presenting Xyricon/Auron
5. **"Building Auron: Why 911 Can't Have Dead Air"** — the Xyricon origin story, meeting Chief of Police

---

*This document is the single source of truth for the portfolio redesign. Update it as decisions evolve.*
