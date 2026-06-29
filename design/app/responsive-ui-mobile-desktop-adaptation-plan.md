Copyright (c) 2026 PaperProof Labs. All rights reserved.
SPDX-License-Identifier: LicenseRef-PaperProof-Docs-Source-Available

# PaperProof App Responsive UI Adaptation Plan

## 1. Purpose

This document defines a frontend-only UI refactor plan for `paperproof-app` so
that the official website can adapt cleanly to both desktop browsers and mobile
browsers.

The current app is strongly desktop-first. It works well on wide screens, but
its layout system contains several hard constraints that force horizontal
overflow, dense multi-column layouts, and oversized panels on narrow screens.

The goal of this refactor is not to redesign the product concept, protocol
model, or official information architecture. The goal is to keep the current
navigation, content surfaces, and protocol features, while making the site
usable and readable on phones and tablets.

## 2. Scope

This plan covers only `paperproof-app` frontend layout and styling behavior.

This is a UI refactor only. It must not change protocol semantics, app feature
scope, artifact meaning, governance meaning, publish meaning, or wallet action
meaning.

In scope:

- responsive page shell;
- top navigation and utility bar;
- Explore and artifact-type listing pages;
- artifact detail pages;
- Docs, Blog, and Forum reading layouts;
- Governance pages;
- Publish and settings-related forms;
- modal, drawer, panel, and Copilot sizing;
- preview surfaces for Markdown and PDF content;
- responsive spacing, typography, and overflow handling.

Out of scope:

- protocol changes;
- contract changes;
- SDK behavior changes;
- indexer payload changes;
- artifact content changes;
- browser automation changes;
- SEO or SSR redesign.

## 2.1 Functional Safety Constraint

This responsive work must not be treated as a pure visual repaint done in
isolation from interaction design.

Every layout change must preserve or improve the usability of the underlying
feature. A component is not considered successfully adapted if it merely fits
the screen while becoming harder to understand, harder to tap, harder to scan,
or harder to complete.

This means:

- no protocol behavior changes;
- no route meaning changes;
- no action removal unless there is an explicit product decision outside this
  responsive effort;
- no hidden critical controls without a clear replacement interaction;
- no reordering that breaks the mental model of task completion;
- no responsive treatment that makes publishing, governance, commenting,
  reading, or wallet actions materially harder to use.

The responsive implementation must therefore evaluate each major UI surface in
terms of both appearance and task usability.

## 2.2 Desktop Invariance Constraint

This refactor must preserve the current desktop UI as the baseline product
experience.

For desktop-class viewports, the intended result is not a redesign. It is the
same interface, same information hierarchy, same visible control placement, and
same interaction rhythm that users already know.

This means:

- desktop navigation structure should remain visually familiar;
- desktop page ordering should remain visually familiar;
- desktop two-column layouts should remain in place where they already work;
- desktop list/table presentations should remain in place unless a specific
  issue is already known and independently approved for change;
- typography, spacing, and panel proportions on desktop should not visibly
  drift without explicit product approval;
- responsive work should primarily add narrow-screen fallback behavior rather
  than reinterpreting the desktop design.

Implementation guidance:

- desktop styles remain the source of truth;
- tablet/mobile overrides should activate only under explicit width breakpoints;
- avoid broad selector changes that unintentionally alter desktop rendering.

## 2.3 Mobile-Native Usability Constraint

The mobile experience should not behave like a miniaturized desktop page.

It should follow normal phone-browser usage habits:

- vertical scrolling should be the primary navigation pattern within a page;
- top-level actions should remain close to the top of the reading flow;
- touch targets should remain generous and visually distinct;
- menus should be shallow and easy to dismiss;
- content should be readable without pinch-zoom;
- overlays should respect the software keyboard and safe viewport area;
- long forms should read as clear vertical step sequences;
- persistent sidebars should generally become collapsible sections or stacked
  blocks.

The aim is to make the mobile site feel naturally usable in mobile browsers,
including embedded browsers such as WeChat and Telegram webviews, without
changing feature meaning.

## 2.4 Desktop Rendering Lock

For this project, desktop rendering is a locked baseline.

This means the responsive refactor must be treated as:

- desktop baseline preservation;
- tablet/mobile fallback addition;
- component-level narrow-screen adaptation.

It must not be treated as:

- a visual refresh of the desktop site;
- a chance to reinterpret spacing, density, or composition on large screens;
- an opportunity to rename, regroup, or relocate desktop controls unless a
  separate approved product change explicitly requires it.

Practical consequence:

- if a change is visible at ordinary desktop widths and is not required to keep
  the current desktop layout functioning after removal of hard width locks, that
  change should be treated as out of scope.

## 3. Current Root Causes

The current mobile incompatibility is primarily caused by the CSS architecture,
not by route logic, protocol data, or the rendering framework.

Key root causes observed in `paperproof-app/src/styles.css`:

1. Global minimum page width

- `body` uses `min-width: 1160px;`
- this alone prevents the page from shrinking to phone width
- result: mobile browsers must scale the whole desktop page down or allow
  horizontal scrolling

2. Desktop-only top navigation geometry

- `.top-nav` uses `grid-template-columns: 260px minmax(0, 1fr) auto`
- `.utility-bar` uses `grid-template-columns: auto minmax(420px, 560px)`
- the brand, nav, search, and wallet actions are all laid out for wide screens

3. Widescreen two-column page layouts without mobile fallback

- `.artifact-layout` uses `minmax(0, 1fr) 330px`
- `.docs-layout` uses `300px minmax(0, 1fr)`
- `.proposal-layout` uses `minmax(0, 1fr) 340px`
- `.space-grid` and similar sections also assume desktop width

4. Table-like list pages with fixed multi-column grids

- `.artifact-row` uses a fixed seven-column grid
- this works on desktop but is not viable on narrow screens
- rows are content-dense and not designed to collapse gracefully

5. Fixed-width or large-minimum auxiliary surfaces

- governance shell uses explicit viewport-width math plus `min-width: 980px`
- blog/PDF previews use large minimum heights
- floating panels such as Copilot and dialogs assume desktop viewport geometry

6. Lack of width-based responsive breakpoints

- the stylesheet currently has almost no `@media (max-width: ...)` strategy for
  layout adaptation
- existing media queries are mostly motion or height related, not mobile-width
  adaptation

## 4. Design Goals

The responsive refactor should satisfy the following goals:

1. Preserve the current PaperProof information architecture.

Users should still recognize:

- Explore
- Publish
- Governance
- My Space
- Docs
- Blog
- Forum

2. Avoid separate mobile-only pages.

The app should remain a single responsive web app rather than a duplicated
mobile interface.

3. Prioritize readability over desktop symmetry.

On small screens, a vertical flow is preferred over trying to preserve desktop
sidebars and dense data tables.

4. Keep protocol surfaces accessible.

Artifact metadata, version history, comments, governance details, and publish
flows must remain available on mobile, even if their layout becomes more
stacked or progressive.

5. Reduce horizontal scrolling to deliberate exceptions only.

Some content such as code blocks, large tables inside documents, or PDF embeds
may still need horizontal or internal scrolling. The rest of the interface
should not.

6. Preserve functional clarity.

Users should still be able to discover what each page is for, what the primary
action is, and what secondary controls are available, even when the layout is
collapsed for mobile.

7. Preserve task completion efficiency.

Mobile adaptation should not create extra unnecessary taps, hidden state, or
 ambiguous action placement for critical flows such as:

- opening an artifact;
- scanning metadata;
- reading Docs or Blog content;
- navigating version history;
- posting or reading comments;
- voting on proposals;
- publishing or adding a version;
- connecting a wallet;
- using Copilot.

8. Preserve desktop appearance.

For desktop and large-laptop viewports, users should not feel that the site was
visually redesigned. The responsive effort should be perceived as a mobile
adaptation layer, not as a desktop UI refresh.

9. Match device-specific usage habits.

Desktop users expect dense scanning, stable side-by-side comparison, and visible
context. Mobile users expect stacked flow, strong tap affordances, and reduced
horizontal competition. The design should satisfy both without changing the
underlying product model.

## 5. Responsive Strategy

The recommended approach is a desktop-first codebase with explicit responsive
fallback layers.

Primary breakpoints:

- `max-width: 1200px`
  - compact desktop / small laptop adjustments
- `max-width: 960px`
  - tablet landscape and narrow desktop
- `max-width: 768px`
  - primary mobile breakpoint
- `max-width: 480px`
  - small phone refinement

This should be implemented as a structured responsive section near the end of
`styles.css`, not as scattered one-off overrides.

Desktop preservation rule:

- widths above the chosen desktop baseline should continue using the current
  layout rules unless an explicitly scoped desktop bug is being fixed.

Responsive override rule:

- changes for `1200px`, `960px`, `768px`, and `480px` should be additive,
  breakpoint-scoped overrides rather than baseline replacements.

Architecture rule:

- keep one route system, one data model, one feature model, and one desktop
  baseline DOM structure wherever possible;
- prefer CSS breakpoint adaptation first;
- introduce alternate mobile-only structural wrappers only when a pure CSS
  approach would materially harm usability or maintainability;
- if alternate mobile structure is introduced for a page region, the desktop
  structure must remain the authoritative presentation above the mobile
  breakpoint.

## 6. Main Refactor Areas

Before changing any layout group below, the implementation should identify the
primary user task for that surface and preserve that task flow in the responsive
design.

### 6.1 Global page shell

Required changes:

- remove `body { min-width: 1160px; }`
- ensure root containers can shrink below desktop widths
- keep `box-sizing: border-box` and existing full-height behavior

Recommended direction:

- use width-fluid layouts with `max-width` wrappers where needed
- let page sections decide their own maximum readable width
- avoid forcing the browser canvas itself to stay desktop-sized

Desktop preservation constraint:

- do not alter the desktop shell spacing model except where necessary to
  eliminate dependency on a global hard minimum width

### 6.2 Top navigation

Current issue:

- the header assumes enough width for brand, all top-level routes, search, and
  wallet controls to coexist in one desktop row

Target behavior:

- desktop: keep the current general structure
- tablet: reduce gaps and compress utility area
- mobile: split into two layers or collapse navigation into a menu

Recommended mobile model:

- top row: brand + wallet/settings/menu actions
- second row: horizontal scroll nav tabs or an expandable menu
- search field moves below the top row, full-width

Important note:

- do not attempt to keep the full desktop nav in one row on phone screens
- readability and tap targets matter more than preserving desktop geometry

Functional constraints:

- top-level route discoverability must remain strong
- wallet connection must stay visible and understandable
- users must not need to open multiple nested menus just to reach core routes
- if a menu pattern is introduced, the first interaction cost must stay low

Desktop preservation constraint:

- the desktop top-nav composition should remain visually the same

Mobile habit constraint:

- the mobile nav should favor one clear expansion pattern rather than multiple
  overlapping menus

### 6.3 Utility bar and search

Current issue:

- `.utility-bar` reserves a large fixed-width search zone
- this forces squeezing or overflow on narrow screens

Target behavior:

- desktop: inline utility controls remain acceptable
- mobile: stack controls vertically
- search should become full-width

Functional constraints:

- artifact-code search must remain immediately understandable
- deployment/environment indicators must not overpower primary actions
- search submit and clear states must stay easy to operate on touch screens

Desktop preservation constraint:

- desktop search placement and utility emphasis should remain effectively
  unchanged

### 6.4 Explore and artifact-type listing pages

Current issue:

- artifact listings behave like dense data tables
- fixed column widths do not fit mobile screens

Required decision:

Mobile should use card-based listings rather than attempting to preserve the
desktop grid table.

Desktop model:

- keep the current table-like layout

Mobile model:

- each artifact becomes a vertically stacked card
- core fields shown first:
  - title
  - artifact type
  - date / updated
  - current version
  - owner / authors summary
  - likes / comments summary
- lower-priority metadata may collapse into smaller secondary lines

Why this matters:

- responsive tables with seven columns become unreadable on phones
- card layout is significantly more usable for touch navigation

Functional constraints:

- the card must still expose enough information for users to decide whether to
  open the artifact
- primary click/tap target must remain obvious
- status, type, version, and recency signals must remain scannable
- sorting and filtering controls must remain usable without desktop hover

Desktop preservation constraint:

- desktop list/table layout should remain intact

Mobile habit constraint:

- mobile cards should be optimized for scan-and-open behavior, not for
  spreadsheet-like comparison

### 6.5 Artifact detail pages

Current issue:

- the detail view uses a main column plus a fixed side column
- on mobile this should not stay as a sidebar layout

Target behavior:

- desktop: preserve two-column detail layout
- mobile: stack into one column

Recommended mobile order:

1. title and primary metadata
2. artifact summary / description
3. preview or body content
4. version history
5. comments
6. side metadata blocks such as IDs, owner, status, likes, links

Rationale:

- the preview and reading surface should come before low-priority side metadata
- mobile reading flow should feel document-first, not sidebar-first

Functional constraints:

- version history must remain easy to find and page through
- comments must remain visibly attached to the artifact rather than feeling
  buried below unrelated metadata
- artifact IDs, owner, and verification-relevant fields must remain accessible
- action buttons such as download, governance-adjacent controls, or wallet
  gated actions must not become visually detached from their relevant context

Desktop preservation constraint:

- desktop two-column reading/detail balance should remain visually unchanged

Mobile habit constraint:

- mobile should prioritize a top-to-bottom reading flow over simultaneous
  side-by-side metadata visibility

### 6.6 Docs layout

Current issue:

- Docs uses a left sidebar plus reading column
- sticky sidebar is desktop-friendly but too heavy for phone screens

Target behavior:

- desktop: sidebar + content
- mobile: content-first with collapsible docs navigation

Recommended mobile model:

- replace persistent left sidebar with a `Contents` button or top accordion
- docs topic navigation opens inline or in an overlay sheet
- remove sticky sidebar behavior on small screens

Additional reading goal:

- docs reading width should remain stable and comfortable on both desktop and
  mobile
- avoid width jumps caused by content shape differences

Functional constraints:

- users must still be able to understand where they are in the docs hierarchy
- moving the sidebar into a collapsible pattern must not destroy chapter
  discoverability
- docs navigation should require fewer cognitive steps, not more

Desktop preservation constraint:

- desktop docs sidebar and content relationship should remain intact

Mobile habit constraint:

- docs navigation should behave like a lightweight table of contents, not a
  permanent left rail squeezed into a small screen

### 6.7 Blog and Forum reading pages

Current issue:

- content surfaces have desktop-scale preview heights and spacing
- some panels are taller than necessary on phones

Target behavior:

- reduce padding and minimum heights on small screens
- keep text readable without making the user scroll past oversized frames

Examples:

- lower `min-height` for blog body preview on mobile
- lower PDF preview height on mobile
- ensure embedded images scale within viewport width

Functional constraints:

- reading flow must remain primary
- backlinks such as `Back` should remain easy to reach
- comment entry and discussion context must remain visible enough for users to
  understand whether they are reading or interacting

Desktop preservation constraint:

- desktop article reading surfaces should not be visually reformatted beyond
  responsive safety fixes

### 6.8 Governance pages

Current issue:

- governance shell explicitly encodes desktop assumptions, including
  `min-width: 980px`
- proposal cards and vote panels use wide multi-column patterns

Required changes:

- remove hard minimum width behavior
- stack governance sections vertically on smaller screens
- convert statistics blocks into one-column or two-row mobile groupings

Special note:

Governance content is structurally important but often secondary in visit
frequency. The mobile solution should focus on clarity and operability rather
than preserving the current wide dashboard feel.

Functional constraints:

- proposal state, yes/no votes, and timing must remain immediately visible
- vote buttons and claim-related actions must remain hard to mis-tap
- proposal descriptions must remain readable without pushing all voting context
  too far below the fold

Desktop preservation constraint:

- desktop governance board structure should remain recognizable

### 6.9 Forms and publish flows

Current issue:

- many form rows use desktop label-content grid pairs
- some blocks assume wide side-by-side inputs

Target behavior:

- mobile: labels above inputs
- multi-column form sections collapse to one column
- action buttons become full-width or two-up only when space allows

Important flows:

- publish flow
- add version flow
- governance proposal forms
- settings-like forms
- wallet-related configuration

Functional constraints:

- form progression must remain understandable in vertical mobile flow
- required fields, helper text, and validation errors must remain clearly tied
  to the right inputs
- the responsive layout must not increase accidental submission risk
- publish-related steps must still communicate sequence and dependency clearly

Desktop preservation constraint:

- desktop form grouping and overall screen hierarchy should remain effectively
  unchanged

Mobile habit constraint:

- on phones, forms should read as a linear sequence with clear section breaks

### 6.10 Floating panels, dialogs, and Copilot

Current issue:

- fixed widths and desktop-oriented anchoring may fit large screens but can feel
  cramped or clipped on phones

Target behavior:

- mobile dialogs should behave more like bottom sheets or full-height overlays
- Copilot should occupy a controlled mobile drawer, not a cramped floating pane
- ensure close actions, scrolling, and keyboard overlap remain manageable

Functional constraints:

- Copilot must remain useful as an assistant rather than becoming a visual
  obstruction
- settings controls must remain fully reachable even when the software keyboard
  is open
- modal confirmation actions must stay visible and not get hidden below the
  viewport on small screens

Desktop preservation constraint:

- desktop overlay sizing and placement should remain visually familiar

Mobile habit constraint:

- mobile overlays should favor bottom-sheet or full-height patterns over tiny
  floating boxes

## 7. Route-By-Route Responsive Analysis

The responsive plan must cover the full official site surface, not just a few
high-traffic pages.

The current app route families include:

- `explore`
- `type`
- `artifact`
- `add-version`
- `publish`
- `governance`
- `proposal`
- `create-proposal`
- `space`
- `docs`
- `blog`
- `blog-post`
- `forum`
- `forum-topic`

The responsive implementation should analyze and validate each of these route
families separately.

### 7.1 Shared shell: header, utility bar, footer, Copilot

Applies to all pages.

Current concerns:

- header density is too high for small screens
- utility bar assumes desktop width
- Copilot and floating panels are desktop-oriented

Responsive requirements:

- all routes must remain reachable from mobile navigation
- the artifact-code search input must remain usable
- footer text and links must wrap cleanly
- Copilot must not block page use on mobile

### 7.2 Explore page

Primary user tasks:

- browse featured or recent artifacts
- search for an artifact to open
- understand the main categories and current site orientation

Current risks:

- artifact list grid is too wide
- hero / summary sections may compress badly
- controls can compete for the same horizontal row

Responsive requirements:

- convert desktop rows into mobile cards
- preserve tap-first navigation
- keep sorting and paging readable and touch-friendly
- maintain a clear browse-then-open flow

### 7.3 Artifact-type pages

Examples:

- preprints
- blog posts
- technical reports
- datasets
- software releases
- generic files

Primary user tasks:

- scan a filtered set of artifacts of the same class
- compare recency, version, and metadata
- open relevant items quickly

Current risks:

- fixed-column listing layout
- dense metadata can become unreadable

Responsive requirements:

- use the same mobile card system as Explore
- each card must clearly show:
  - title
  - category context
  - date / updated
  - version
  - owner / author summary
- pagination controls must remain accessible on small screens

### 7.4 Artifact detail pages

Primary user tasks:

- verify what the artifact is
- read its summary and current body
- inspect metadata
- move through version history
- read and post comments
- use relevant actions such as download

Sub-surfaces that must each be considered:

- artifact hero
- metadata chips
- description / summary
- Markdown body preview
- PDF preview
- side facts panel
- version history
- likes area
- comments tree

Current risks:

- sidebar squeezes content on small screens
- preview panels are too tall or too rigid
- metadata and actions may become detached from the main reading flow

Responsive requirements:

- stack the page into a reading-first single column on mobile
- keep version history clearly visible
- preserve easy access to identifiers and owner info
- keep comments visually anchored to the artifact

### 7.5 Add-version page

Primary user tasks:

- confirm target artifact
- provide new version data
- understand storage/onchain steps
- submit safely

Current risks:

- desktop-oriented form layout
- side information and main controls may separate poorly
- long forms can become visually confusing on narrow screens

Responsive requirements:

- use a clear vertical step flow
- keep the target artifact context near the form header
- ensure required fields and action buttons stay obvious
- preserve the distinction between content preparation and onchain actions

### 7.6 Publish page

Primary user tasks:

- choose artifact type
- fill metadata
- prepare content package
- complete publish flow safely

Current risks:

- complex forms may become dense on mobile
- step groupings can lose hierarchy when stacked
- preview and attached-content areas may dominate the viewport

Responsive requirements:

- maintain strong section hierarchy
- keep one-column mobile forms with explicit step grouping
- surface validation, help text, and warnings close to the relevant controls
- ensure primary publish actions are not pushed into obscure positions

### 7.7 Governance index page

Primary user tasks:

- scan active and historical proposals
- understand proposal states
- open a target proposal

Current risks:

- governance shell has desktop-only width assumptions
- proposal cards may rely on wide header arrangement
- vote and status summaries can become cramped

Responsive requirements:

- remove hard min-width behavior
- keep proposal cards readable in vertical flow
- maintain strong visibility for state and vote totals

### 7.8 Proposal detail page

Primary user tasks:

- read the proposal
- understand result and timing
- verify binding if needed
- vote or claim

Sub-surfaces:

- proposal header
- verification card
- description body
- yes/no vote summaries
- voting actions
- locked-funds view

Current risks:

- header and summary panes may rely on desktop width
- action controls may drift too far from context on mobile

Responsive requirements:

- keep state, vote totals, and action controls near the top
- keep proposal text readable
- preserve safe interaction spacing for vote actions

### 7.9 Create-proposal page

Primary user tasks:

- choose proposal type
- choose governance action
- fill payload fields
- submit safely

Current risks:

- multiple dynamic field groups can become difficult to parse on small screens
- desktop two-column inputs can break input comprehension

Responsive requirements:

- collapse all form groups into mobile-safe one-column flow
- keep labels, helper text, and controls tightly associated
- maintain strong visual distinction between proposal metadata and payload data

### 7.10 My Space page

Primary user tasks:

- inspect wallet-linked artifacts
- inspect voting history
- inspect balances and protocol-related personal data

Sub-surfaces:

- wallet/balance panel
- my artifacts list
- my votes list

Current risks:

- mixed dashboard/list patterns may not stack gracefully
- personal data panes can feel fragmented on mobile

Responsive requirements:

- maintain a clear section order
- keep wallet and balance context near the top
- convert owned artifacts and vote history into readable mobile blocks

### 7.11 Docs index and docs article pages

Primary user tasks:

- browse the docs hierarchy
- open a topic
- read long-form documentation
- move to adjacent topics

Sub-surfaces:

- docs sidebar navigation
- docs article content
- artifact metadata header in docs articles
- inline tables, code blocks, and images

Current risks:

- sidebar does not fit phone width
- long content can become too narrow or too padded
- metadata block may compete with reading flow

Responsive requirements:

- move navigation into a collapsible mobile pattern
- keep reading width comfortable
- allow article-local horizontal scrolling only where content type requires it

### 7.12 Blog index and blog post pages

Primary user tasks:

- scan official or community long-form posts
- open a post
- read without distraction

Sub-surfaces:

- blog list page
- blog article reading page
- back navigation
- body preview

Current risks:

- article preview height and padding are desktop-sized
- list layout may become dense on smaller screens

Responsive requirements:

- keep list items readable and tappable
- preserve a strong reading-first layout on post pages
- reduce oversized minimum heights on mobile

### 7.13 Forum index and forum topic pages

Primary user tasks:

- browse topics
- open a topic
- read the topic body
- read and participate in discussion

Sub-surfaces:

- forum topic list
- topic body
- comments tree
- comment entry controls

Current risks:

- topic list density may not translate to mobile
- nested comments can become too indented

Responsive requirements:

- keep topic list scannable
- reduce excessive nesting impact on small screens
- preserve comment threading while keeping comment text readable

### 7.14 Deep-link and fallback states

Examples:

- artifact deep-link loading state
- not-found pages
- docs/blog/forum manifest failure states
- data loading banners

Primary user tasks:

- understand what is happening
- recover to a usable route

Responsive requirements:

- empty and loading states must remain centered, readable, and actionable on
  mobile
- retry and back actions must remain obvious
- long technical messages should wrap without breaking the layout

## 8. Cross-Cutting UI Component Review

In addition to route-by-route analysis, the responsive refactor must review
reusable UI components that appear across many routes.

Components requiring dedicated responsive consideration:

- top navigation links
- search form
- primary / secondary buttons
- segmented controls
- list rows / list cards
- side-fact blocks
- metadata chip lines
- form rows
- status banners
- pagination controls
- Markdown preview containers
- PDF preview containers
- comments tree blocks
- likes panel
- verification cards
- wallet/balance panels
- toasts
- dialogs
- Copilot launcher, drawer, settings, messages, and input area

For each component, responsive work should answer:

- what is the primary user task here
- what information must stay visible without extra friction
- what can wrap, collapse, paginate, or move below
- what must remain immediately tappable
- what minimum touch target and spacing is required
- what must remain unchanged on desktop
- what mobile behavior best matches normal phone-browser expectations

## 8.1 Deep Page Design Elaboration

This section adds deeper page-level design guidance so the responsive refactor
can be implemented consistently across the full site.

### 8.1.1 Explore page

Current structure in implementation:

- page heading with product-level explanation
- refresh + publish action cluster
- type grid
- per-type recent artifact lists

Desktop intent to preserve:

- page should continue to feel like an entry dashboard
- type cards remain visible as a multi-card browse surface
- action cluster remains secondary to the page message

Mobile design behavior:

- page heading stacks naturally
- refresh and publish actions may wrap into a vertical or two-row block
- type cards become one-per-row
- each type card keeps:
  - type title
  - short description
  - recent items list
  - view-all link

Mobile interaction goal:

- the user should be able to land, understand what PaperProof is, and open a
  type or artifact within one continuous vertical scroll

### 8.1.2 Artifact-type pages

Current structure in implementation:

- heading with type metadata
- back-to-explore action
- sort segmented control
- artifact table
- pagination
- load-more state / button

Desktop intent to preserve:

- keep the existing table-oriented scan experience
- keep sort controls in the current high-visibility region

Mobile design behavior:

- heading stacks vertically
- back action remains near the top
- segmented sort control may wrap into two rows if needed
- artifact table is replaced by stacked artifact cards

Recommended mobile artifact card content order:

1. title
2. artifact code
3. author summary
4. date + version
5. comment/like summary

Secondary metadata may move into a lower visual line, but the main open target
should remain the entire card.

### 8.1.3 Artifact detail pages

Current structure in implementation:

- artifact hero
- action cluster with download / add version / copy link
- two-column layout:
  - main content column
  - side facts column
- summary / abstract
- optional Markdown preview
- current version block
- optional PDF preview
- version history
- likes
- comments

Desktop intent to preserve:

- hero + action cluster balance
- left reading column plus right metadata column
- current reading hierarchy

Mobile design behavior:

- hero stacks into vertical flow
- action cluster becomes wrapped action rows
- side facts move below the reading content, not above it
- summary / body / current version remain the main narrative sequence

Recommended mobile content order:

1. hero
2. summary or abstract
3. body preview or PDF preview
4. current version
5. version history
6. likes
7. comments
8. side facts / IDs / owner / license

Reason:

- reading and version context are primary
- IDs and protocol facts remain important, but are secondary for mobile reading

Version history specific guidance:

- pager must remain directly attached to version history
- version rows should not become visually ambiguous when stacked
- `View details` and download actions should remain near the relevant version

Comments specific guidance:

- preserve threading
- reduce excessive indentation on small screens
- keep reply context understandable

### 8.1.4 Add-version page

Current structure in implementation:

- heading with target artifact context
- main form
- locked artifact identity panel

Desktop intent to preserve:

- side-by-side editing + locked identity context

Mobile design behavior:

- locked identity moves below the form header or below the main form, but should
  remain easy to inspect
- form blocks stay in explicit sequence:
  - new content
  - common version fields
  - type-specific version fields
  - review and sign

Mobile usability requirement:

- users must always know which artifact they are updating
- the locked identity section must not feel buried or detached

### 8.1.5 Publish page

Current structure in implementation:

- heading
- publish form
- checklist side panel

Desktop intent to preserve:

- current dual-pane “form + checklist” experience

Mobile design behavior:

- checklist becomes an inline support block, likely below the form header or at
  the end of the form
- artifact type selection remains near the top
- content preparation remains visually distinct from onchain submit

Special mobile concern:

- publishing is a high-consequence flow
- on mobile, CTA grouping and step labeling must remain especially explicit

### 8.1.6 Governance index page

Current structure in implementation:

- page heading
- refresh + create proposal actions
- active votes column
- voting history column

Desktop intent to preserve:

- dual governance columns
- dashboard-like overview

Mobile design behavior:

- active votes should appear before history
- both columns become stacked sections
- proposal cards remain compact but readable

Recommended mobile order:

1. heading
2. primary actions
3. chain status banner
4. active votes
5. voting history

### 8.1.7 Proposal detail page

Current structure in implementation:

- page heading with rendered proposal description
- left detail column
- right vote/result panel

Desktop intent to preserve:

- detail + vote panel split

Mobile design behavior:

- vote/result panel should move upward relative to long proposal detail blocks
- users should not scroll through a long description before seeing how to act

Recommended mobile order:

1. proposal heading
2. result / vote panel
3. verification panel
4. proposal detail fields
5. vote summary blocks
6. locked-funds panel

This is one of the few places where mobile ordering may intentionally differ
from desktop in order to preserve task usability.

### 8.1.8 Create-proposal page

Current structure in implementation:

- page heading
- governance shell
- proposal form with dynamic payload sections

Desktop intent to preserve:

- current proposal builder grouping

Mobile design behavior:

- proposal type selector remains early
- action type selector remains early
- payload block follows immediately after the selector that determines it
- dynamic fields should not appear visually detached from their governing
  selection

### 8.1.9 My Space page

Current structure in implementation:

- heading
- wallet panel
- voting records panel
- published artifacts panel

Desktop intent to preserve:

- dashboard-style balance between personal protocol data and lists

Mobile design behavior:

- wallet panel remains first
- voting records second
- published artifacts third
- list rows become mobile-friendly stacked items

Mobile usability goal:

- connected users should quickly understand “who am I here, what do I own, what
  did I vote on”

### 8.1.10 Docs pages

Current structure in implementation:

- heading
- docs sidebar
- docs content article
- breadcrumb
- article header
- lazy-loaded artifact-backed markdown

Desktop intent to preserve:

- sidebar + article reading relation
- stable reading width

Mobile design behavior:

- docs heading remains light
- sidebar becomes a collapsible contents system
- breadcrumb remains but should not consume excessive vertical space
- docs artifact meta and footer should stay present but compact

Docs reading requirement:

- typography should remain calm and document-like
- code blocks, tables, and images must degrade gracefully

### 8.1.11 Blog index and blog post pages

Current structure in implementation:

- blog index:
  - centered heading
  - list of blog cards
- blog post:
  - article header
  - back action
  - rendered article body

Desktop intent to preserve:

- current article reading atmosphere

Mobile design behavior:

- blog list items become full-width stacked cards
- blog article header stacks cleanly
- back action stays easy to reach near the top
- article body padding is reduced modestly, not aggressively

### 8.1.12 Forum index and forum topic pages

Current structure in implementation:

- forum index:
  - heading
  - category blocks
  - topic rows
- forum topic:
  - hero-like topic header
  - topic body
  - comments section

Desktop intent to preserve:

- category grouping
- readable topic rows

Mobile design behavior:

- forum category blocks stack naturally
- topic rows get clearer tap spacing
- topic body stays above comments
- comments nesting is visually compressed where necessary

### 8.1.13 Empty, loading, and failure states

Current structure in implementation:

- doc placeholders
- inline empty states
- chain status banners
- not-found views

Responsive requirement:

- these states must not be an afterthought
- on mobile they should remain fully readable, centered where appropriate, and
  action-oriented

Design rule:

- every empty/failure state should still provide a clear next action, recovery
  path, or orientation cue

## 9. CSS Architecture Recommendations

The refactor should not be implemented as a random collection of overrides.

Recommended structure:

1. Keep existing desktop styles as baseline.
2. Add a clearly separated responsive section near the end of `styles.css`.
3. Group rules by breakpoint.
4. Within each breakpoint, group by layout domain:
   - shell and header
   - explore/listing
   - artifact detail
   - docs/blog/forum
   - governance
   - forms and overlays

Recommended style principles:

- favor `width: 100%` plus `max-width` over hard minimum widths
- favor single-column stacking on narrow screens
- reduce gap/padding/font density rather than just shrinking scale
- allow internal scrolling only for content that naturally needs it

Implementation guardrails:

- do not rewrite desktop baseline selectors unless the change is required for
  responsive safety
- do not change desktop spacing tokens opportunistically
- do not merge unrelated UI cleanups into the responsive branch
- prefer additive `@media (max-width: ...)` rules over changing the default
  desktop declaration values
- if a default declaration must change, add a desktop parity note in the code
  review / task record explaining why it does not alter the visible desktop
  result
- avoid selector broadening that accidentally affects unrelated surfaces
- avoid swapping component markup on desktop when the issue exists only on
  mobile

Recommended implementation pattern:

1. preserve current desktop rules as baseline
2. add narrow-screen overrides
3. introduce mobile-only structural variants only where table-to-card or
   sidebar-to-drawer conversion truly requires it
4. verify that desktop screenshots and interaction flow remain unchanged

## 9.1 Desktop Parity Guardrails

The following rules should be applied during implementation review:

1. No unapproved desktop visual drift

- font sizes, button sizing, card proportions, table density, and panel spacing
  should remain effectively the same on desktop

2. No silent desktop relocation

- desktop actions such as `Publish`, `Back`, `Add Version`, vote actions,
  download actions, and search must remain where users expect them today

3. No desktop-only regressions caused by mobile helpers

- mobile drawers, sheets, accordion states, or card layouts must not leak into
  desktop rendering

4. No mixed-purpose cleanup

- responsive work must not be used to slip in unrelated desktop restyling

5. Desktop remains the comparison baseline

- every responsive change should be reviewed against the current production
  desktop UI, not just against the designer's intention

## 9.1.1 Desktop Baseline Snapshot Requirement

To make desktop invariance enforceable, the project should maintain a practical
desktop baseline comparison set during implementation.

Recommended baseline set:

- home / Explore
- one artifact-type page
- one artifact detail page
- Docs page
- Blog article page
- Forum topic page
- Governance index
- Proposal detail
- Publish
- My Space

For each baseline page, capture:

- full-page desktop screenshot at `1440px`
- full-page desktop screenshot at `1280px`
- if needed, one focused crop for critical controls such as:
  - top navigation
  - artifact hero/action area
  - governance action area
  - publish form header and CTA region

Usage rule:

- before responsive implementation begins, treat these captures as the desktop
  reference state
- after each major workstream, compare against the same desktop routes
- if visible desktop drift appears, fix it before continuing

The purpose is not pixel-perfect anti-change dogmatism. The purpose is to
prevent accidental desktop redesign while making mobile improvements.

## 9.2 `styles.css` Modification Policy

The current stylesheet should be treated as a desktop baseline with layered
responsive extensions.

### 9.2.1 Baseline selector categories

For implementation purposes, selectors fall into three categories:

1. Baseline selectors that should remain desktop-authoritative
2. Baseline selectors that may be minimally edited for responsive safety
3. Selectors that are expected to receive mobile breakpoint overrides

### 9.2.2 Selectors that should not be visually reinterpreted on desktop

These selectors represent stable desktop presentation and should not be
substantively restyled. If mobile adaptation is needed, prefer `@media`
overrides instead of editing their desktop values.

Examples:

- `.site-shell`
- `.top-nav`
- `.brand`
- `.brand-copy`
- `.primary-nav`
- `.utility-bar`
- `.page-heading`
- `.artifact-hero`
- `.artifact-layout`
- `.docs-layout`
- `.governance-shell`
- `.governance-board`
- `.proposal-layout`
- `.space-grid`
- `.publish-layout`
- `.add-version-layout`
- `.blog-list-shell`
- `.blog-article-shell`
- `.forum-board`
- `.copilot-panel`

Rule:

- do not change these selectors' desktop spacing, column model, visual balance,
  or proportions unless the change is necessary to preserve their current
  desktop rendering after introducing responsive support

### 9.2.3 Selectors that may be minimally edited at baseline

These selectors may require cautious baseline adjustments because they encode
 hard desktop assumptions that block responsiveness. Even here, the change must
 be the minimum necessary and should not create a visible desktop redesign.

Examples:

- `body`
  - removing or replacing the hard `min-width`
- wrappers whose width logic currently forces overflow
- isolated overflow/containment rules that are structurally incompatible with
  smaller viewports

Rule:

- if a baseline value must change, the replacement must preserve desktop visual
  parity and push adaptation burden into mobile breakpoints

### 9.2.4 Selectors expected to receive mobile breakpoint overrides

These selectors are normal targets for responsive override blocks.

Examples:

- `.artifact-row`
- `.artifact-table`
- `.type-grid`
- `.action-cluster`
- `.segmented`
- `.meta-line`
- `.blog-body-preview`
- `.pdf-artifact-preview`
- `.pdf-artifact-frame`
- `.docs-sidebar`
- `.docs-content`
- `.blog-list-item`
- `.forum-topic-row`
- `.detail-grid`
- `.version-row`
- `.likes-panel`
- `.comment-branch`
- `.form-row`
- `.proposal-type-row`
- `.payload-grid`
- `.vote-bars`
- `.my-artifact-row`
- `.vote-record-row`
- `.copilot-settings`
- `.copilot-advanced-row`
- `.copilot-composer`

Rule:

- responsive behavior should be added through breakpoint-scoped overrides here

### 9.2.5 Selector handling rules

Allowed:

- add new `@media (max-width: ...)` rules
- add mobile-only helper classes
- add wrapper selectors scoped to mobile behavior
- add mobile variants for card/list presentation

Restricted:

- rewriting broad desktop baseline declarations
- changing desktop typography scale globally
- changing desktop paddings globally
- changing desktop button dimensions globally
- changing desktop panel density globally

Recommended implementation split:

- desktop/base section remains mostly untouched
- responsive section appended near the end of `styles.css`
- each responsive block grouped by breakpoint and then by page domain

## 9.3 Pure CSS vs Local DOM Adaptation Decision Matrix

Not every responsive issue needs markup changes. Some can be solved cleanly with
CSS only, while others need limited structural adaptation in the view layer.

### 9.3.1 Pages/components that should be solved with pure CSS first

These surfaces are primarily spacing, stacking, or width problems.

Usually pure CSS is sufficient:

- page shell spacing
- top-nav wrapping or compression at tablet widths
- utility bar stacking
- artifact detail two-column to one-column stacking
- docs two-column to one-column stacking
- governance two-column to one-column stacking
- proposal detail column stacking
- publish/add-version two-column stacking
- form-row label-above-input conversion
- preview height reduction
- docs/article typography adjustments
- comment indentation reduction
- Copilot width/height and overlay containment

Rule:

- if the semantic structure already matches the task flow and the problem is
  only width competition, use CSS-only adaptation

### 9.3.2 Surfaces that likely require limited local DOM structure adaptation

These surfaces change interaction shape meaningfully between desktop and mobile.

Expected local DOM adaptation candidates:

- desktop artifact table to mobile artifact cards
- desktop docs persistent sidebar to mobile collapsible contents control
- desktop top-nav to mobile menu/tabs pattern
- governance cards if status and metadata need mobile-specific grouping
- My Space record rows if current row structure is too dense for mobile
- comment composer placement if mobile interaction needs reordered action blocks

Rule:

- DOM adaptation is acceptable only when CSS alone would preserve layout but
  produce poor usability

### 9.3.3 Pages by likely implementation mode

Mostly pure CSS:

- artifact detail
- add-version
- publish
- proposal detail
- blog post
- forum topic
- docs article typography
- Copilot overlay sizing

Mixed CSS + local DOM adaptation:

- Explore
- artifact-type pages
- Docs navigation
- top navigation
- Governance index
- My Space lists

Likely no special DOM adaptation beyond shared shell behavior:

- loading states
- empty states
- not-found states
- footer
- small utility/status components

### 9.3.4 DOM adaptation guardrails

If local DOM adaptation is introduced:

- keep route logic unchanged
- keep feature meaning unchanged
- avoid duplicating whole pages
- restrict alternate markup to the smallest practical page region
- keep desktop markup path authoritative above mobile breakpoints
- document each DOM adaptation with its user-task justification

## 10. Main Implementation Tasks

The responsive refactor can be executed in the following sequence.

### Phase 1: unblock the viewport

- remove global `min-width`
- add breakpoint scaffolding
- make top-level wrappers width-fluid

### Phase 2: make core reading surfaces mobile-safe

- artifact detail layout
- Docs layout
- Blog / Forum reading layouts
- preview surface heights

### Phase 3: convert list-heavy surfaces

- Explore page
- artifact-type pages
- governance listing pages
- card-based mobile rows

### Phase 4: form and panel hardening

- publish and proposal forms
- Copilot
- settings dropdowns / dialogs
- modal sizing and overlay behavior

### Phase 5: refinement and regression cleanup

- spacing and typography tuning
- sticky/fixed positioning review
- long-title and long-code handling
- touch target and safe-area validation
- task-flow regression review for core features
- explicit desktop parity review against the current site

## 10.2 Engineering Task Breakdown

This section turns the responsive plan into an implementation task list.

### Workstream A: breakpoint foundation

Tasks:

1. Remove the global hard-width blocker from `body`
2. Add a dedicated responsive section near the end of `styles.css`
3. Establish breakpoint blocks for:
   - `1200px`
   - `960px`
   - `768px`
   - `480px`
4. Add desktop parity comments where a baseline rule must be changed

Deliverable:

- the site can shrink below desktop widths without immediate forced overflow

### Workstream B: shared shell and navigation

Tasks:

1. Adapt `.top-nav` for tablet widths
2. Design and implement mobile nav behavior
3. Stack or reorganize `.utility-bar` for narrow screens
4. Keep wallet and search discoverable
5. Validate footer wrapping

Likely implementation mode:

- CSS + limited local DOM adaptation

### Workstream C: Explore and artifact-type listing adaptation

Tasks:

1. Preserve desktop table/list behavior
2. Design mobile artifact card presentation
3. Implement mobile card rendering for:
   - Explore recent lists if needed
   - artifact-type list pages
4. Keep sort and pagination usable on phones
5. Validate tap-target clarity

Likely implementation mode:

- CSS + local DOM adaptation

### Workstream D: artifact detail adaptation

Tasks:

1. Stack `.artifact-layout` on narrow screens
2. Reorder visual emphasis for mobile reading flow without changing semantics
3. Reduce preview minimum heights on mobile
4. Keep version history and pager clear
5. Compress comments indentation for mobile
6. Keep side facts accessible but secondary

Likely implementation mode:

- mostly CSS

### Workstream E: Docs adaptation

Tasks:

1. Stack `.docs-layout`
2. Replace persistent sidebar behavior with collapsible mobile contents control
3. Preserve stable reading width on desktop
4. Tune docs metadata and footer density for mobile
5. Verify tables/code/images behave safely on small screens

Likely implementation mode:

- CSS + local DOM adaptation for navigation behavior

### Workstream F: Blog and Forum adaptation

Tasks:

1. Adapt blog index cards for mobile
2. Adapt forum topic rows and category blocks for mobile
3. Keep blog/forum article reading surfaces comfortable
4. Reduce oversized preview heights on narrow screens
5. Ensure `Back` controls remain obvious

Likely implementation mode:

- mostly CSS

### Workstream G: Governance adaptation

Tasks:

1. Remove governance hard-width assumptions
2. Stack governance board sections vertically on narrow screens
3. Adapt proposal cards for mobile scanability
4. Rework proposal detail ordering if needed for mobile action clarity
5. Keep vote actions safe and visible

Likely implementation mode:

- CSS + possible local DOM adaptation for proposal/action ordering

### Workstream H: Publish / add-version / create-proposal forms

Tasks:

1. Convert multi-column form regions to mobile-safe one-column flow
2. Keep helper text and validation adjacency intact
3. Keep checklist / locked-info panels contextually attached
4. Ensure CTAs remain obvious after stacking
5. Verify keyboard-safe interaction and scroll behavior

Likely implementation mode:

- mostly CSS

### Workstream I: My Space adaptation

Tasks:

1. Stack dashboard sections clearly
2. Adapt artifact/vote record rows into mobile-friendly blocks
3. Keep wallet/balance summary first
4. Preserve pagination clarity

Likely implementation mode:

- CSS + limited local DOM adaptation for list rows

### Workstream J: Copilot and overlay adaptation

Tasks:

1. Keep desktop overlay behavior unchanged
2. Create phone-friendly panel dimensions
3. Ensure settings area remains reachable with software keyboard
4. Ensure messages and composer remain usable in narrow/tall viewports
5. Validate z-index and dismissal behavior across pages

Likely implementation mode:

- mostly CSS

### Workstream K: regression and deployment validation

Tasks:

1. Capture representative desktop before/after comparisons
2. Validate breakpoint behavior across route families
3. Validate no desktop helper leakage
4. Validate no new horizontal overflow
5. Validate key task flows:
   - open artifact
   - read Docs
   - browse Explore
   - vote proposal
   - publish
   - add version
   - use Copilot

Deliverable:

- release-ready responsive layer with desktop parity preserved

## 10.3 File / Selector / Page Modification Checklist

This section translates the responsive plan into a concrete implementation
checklist organized by source file, selector family, and page family.

### 10.3.1 Primary source files

Main files expected to participate in this work:

- `paperproof-app/src/styles.css`
- `paperproof-app/src/main.ts`

Supporting files that should be reviewed for impact, but should usually not
need architectural change:

- `paperproof-app/src/types.ts`
- `paperproof-app/src/services/site-analytics.ts`
- `paperproof-app/src/services/suins.ts`
- `paperproof-app/src/services/sdk.ts`

Rule:

- responsive work should stay concentrated in `styles.css` plus the smallest
  necessary view-level changes in `main.ts`
- service files should not change unless a UI-only implementation absolutely
  requires different presentation data handling

### 10.3.2 `styles.css` checklist by selector family

#### A. Global shell and header selectors

Selectors to review:

- `body`
- `.site-shell`
- `.top-nav`
- `.brand`
- `.brand-copy`
- `.brand-logo`
- `.primary-nav`
- `.wallet-button`
- `.utility-bar`
- `.utility-actions`
- `.artifact-search`
- `.page-shell`
- `.page-heading`
- `.page-heading.compact`
- `.site-footer`

Expected action type:

- baseline-safe adjustment for `body`
- mostly breakpoint overrides for the rest

Key tasks:

- remove hard desktop width blocker
- make header compress and/or stack at narrow widths
- preserve desktop spacing and alignment
- keep search usable on phones

#### B. Shared list and card selectors

Selectors to review:

- `.type-grid`
- `.type-card`
- `.recent-list`
- `.compact-artifact`
- `.list-toolbar`
- `.segmented`
- `.artifact-table`
- `.artifact-row`
- `.artifact-authors`
- `.pagination`

Expected action type:

- breakpoint overrides
- possible new mobile-only helper classes

Key tasks:

- preserve desktop table/list behavior
- add mobile-friendly stacking behavior
- support card-style presentation where needed

#### C. Artifact detail selectors

Selectors to review:

- `.artifact-hero`
- `.meta-line`
- `.action-cluster`
- `.artifact-layout`
- `.artifact-main`
- `.artifact-side`
- `.side-fact`
- `.detail-grid`
- `.version-list`
- `.version-row`
- `.artifact-version-pagination`
- `.likes-panel`
- `.likes-summary`
- `.likes-actions`
- `.comment-tree`
- `.comment-branch`
- `.comment-node`
- `.comment`
- `.comment.reply`
- `.comment-composer`

Expected action type:

- mostly breakpoint overrides

Key tasks:

- stack main/side regions on mobile
- reduce comment indentation
- maintain readable version rows
- preserve desktop detail balance

#### D. Blog / Markdown / PDF selectors

Selectors to review:

- `.blog-body-section`
- `.blog-body-preview`
- `.pdf-artifact-preview`
- `.pdf-artifact-frame`
- `.pdf-artifact-empty`
- `.markdown-body`
- `.markdown-body img`
- `.markdown-body table`
- `.docs-rendered`
- `.docs-rendered pre`
- `.docs-artifact-footer`

Expected action type:

- breakpoint overrides

Key tasks:

- lower oversized mobile heights
- keep media within viewport width
- keep code/table overflow controlled

#### E. Docs selectors

Selectors to review:

- `.docs-layout`
- `.docs-sidebar`
- `.docs-nav-group`
- `.docs-nav-section`
- `.docs-nav-topics`
- `.docs-content`
- `.docs-breadcrumb`
- `.docs-artifact-meta`
- `.doc-placeholder`

Expected action type:

- breakpoint overrides
- likely mobile-only helper selectors for collapsible navigation

Key tasks:

- preserve desktop sidebar relationship
- implement mobile contents behavior
- keep article reading width stable

#### F. Blog index / Forum index selectors

Selectors to review:

- `.blog-list-shell`
- `.blog-list-item`
- `.blog-category`
- `.blog-article-shell`
- `.blog-article-header`
- `.blog-article-body`
- `.forum-board`
- `.forum-block`
- `.forum-topic-row`

Expected action type:

- mostly breakpoint overrides

Key tasks:

- stack list cards/rows cleanly on mobile
- keep article/topic headers readable

#### G. Form and publish-flow selectors

Selectors to review:

- `.add-version-layout`
- `.publish-layout`
- `.version-form`
- `.form-block`
- `.file-picker-row`
- `.reserve-code-row`
- `.publish-step-button`
- `.reservation-status`
- `.advanced-grid`
- `.blog-editor`
- `.blog-editor-toolbar`
- `.blog-editor-surface`
- `.markdown-preview-pane`
- `.form-row`
- `.proposal-form-block`
- `.proposal-type-row`
- `.payload-grid`

Expected action type:

- breakpoint overrides

Key tasks:

- convert multi-column regions to one-column flow on mobile
- preserve desktop grouping
- keep CTAs visually strong

#### H. Governance selectors

Selectors to review:

- `.governance-shell`
- `.governance-board`
- `.governance-column`
- `.proposal-card`
- `.proposal-layout`
- `.proposal-detail`
- `.verification-card`
- `.vote-bars`
- `.result-pill`
- `.claim-panel`
- `.claim-summary`

Expected action type:

- breakpoint overrides
- possible limited mobile helper classes

Key tasks:

- remove hard-width dependence
- stack index and detail layouts
- keep voting affordances obvious

#### I. My Space selectors

Selectors to review:

- `.space-grid`
- `.wallet-panel`
- `.votes-panel`
- `.published-panel`
- `.balance-grid`
- `.my-artifact-list`
- `.vote-record-list`
- `.my-artifact-row`
- `.vote-record-row`

Expected action type:

- breakpoint overrides
- possible local mobile row/card variants

Key tasks:

- preserve desktop dashboard feel
- improve mobile scanability of personal records

#### J. Overlay and Copilot selectors

Selectors to review:

- `.drawer-backdrop`
- `.drawer`
- `.copilot-launcher`
- `.copilot-minimized`
- `.copilot-panel`
- `.copilot-header`
- `.copilot-window-actions`
- `.copilot-settings`
- `.copilot-model-row`
- `.copilot-inline-field`
- `.copilot-wide-field`
- `.copilot-secret-inline`
- `.copilot-secret-field`
- `.copilot-advanced-settings`
- `.copilot-advanced-row`
- `.copilot-memory-actions`
- `.copilot-messages`
- `.copilot-message`
- `.copilot-composer`
- `.toasts`
- `.toast`

Expected action type:

- mostly breakpoint overrides

Key tasks:

- preserve desktop overlay behavior
- make mobile panel sizing and keyboard interaction safe

### 10.3.3 `main.ts` checklist by view function

Only make structural changes where CSS alone is insufficient.

#### Shared shell and navigation functions

Functions to review:

- top-level app shell rendering around `.site-shell`
- `navLink(...)`
- `copilotView()`
- `copilotSettingsView(...)`

Possible changes:

- mobile menu trigger
- mobile nav wrapper
- mobile-specific shell helper markup if required

#### Explore and type views

Functions to review:

- `exploreView()`
- `typeCard(...)`
- `typeDetailView(...)`
- `artifactTableRow(...)`
- `compactArtifactRow(...)`

Possible changes:

- introduce mobile artifact card markup
- preserve existing desktop table row markup
- optionally render different list structure based on helper classes/containers,
  while keeping route logic unchanged

#### Artifact detail views

Functions to review:

- `artifactDetailView(...)`
- `versionDetailBlock(...)`
- `versionRow(...)`
- `artifactLikesView(...)`
- `commentsView(...)`
- `commentView(...)`

Possible changes:

- only if mobile-specific structure is needed for version rows or comments
- otherwise prefer CSS-only adaptation

#### Add-version and publish views

Functions to review:

- `addVersionView(...)`
- `publishView()`
- `typeSpecificFields(...)`
- `markdownEditorFields(...)`
- `preprintReservationPanel()`

Possible changes:

- keep structure mostly intact
- only introduce wrappers if mobile step grouping becomes unclear with CSS alone

#### Governance views

Functions to review:

- `governanceView()`
- `activeProposalCard(...)`
- `historyProposalCard(...)`
- `proposalDetailView(...)`
- `proposalVerificationPanel(...)`
- `createProposalView()`
- `payloadFieldsView(...)`

Possible changes:

- mobile-friendly proposal card groupings
- possible reorder helpers for vote panel vs long detail blocks
- preserve desktop markup where possible

#### My Space views

Functions to review:

- `spaceView()`
- `myVotesView(...)`
- `myArtifactListView(...)`
- `walletBalanceView(...)`

Possible changes:

- mobile-friendly row/card markup for votes and artifacts if CSS-only approach is
  insufficient

#### Docs / Blog / Forum views

Functions to review:

- `docsView()`
- `blogView()`
- `blogPostView(...)`
- `forumView()`
- `forumTopicView(...)`

Possible changes:

- add collapsible mobile docs navigation wrapper
- preserve current article/body rendering structure
- avoid unnecessary structural branching in blog/forum article views

#### Fallback views

Functions to review:

- `artifactDeepLinkView(...)`
- `notFoundView(...)`

Possible changes:

- likely CSS-only

### 10.3.4 Page-by-page implementation checklist

#### Explore

- `styles.css`
  - `.page-heading`
  - `.action-cluster`
  - `.type-grid`
  - `.type-card`
  - `.compact-artifact`
- `main.ts`
  - review `exploreView()`
  - likely no major DOM split required

#### Artifact-type pages

- `styles.css`
  - `.list-toolbar`
  - `.segmented`
  - `.artifact-table`
  - `.artifact-row`
  - `.pagination`
- `main.ts`
  - `typeDetailView(...)`
  - `artifactTableRow(...)`
  - likely needs mobile card structure

#### Artifact detail

- `styles.css`
  - `.artifact-hero`
  - `.artifact-layout`
  - `.artifact-side`
  - `.detail-grid`
  - `.version-row`
  - `.comment-*`
- `main.ts`
  - `artifactDetailView(...)`
  - CSS-first, markup changes only if necessary

#### Add-version

- `styles.css`
  - `.add-version-layout`
  - `.version-form`
  - `.form-row`
  - `.reserve-code-row`
  - `.blog-editor-*`
- `main.ts`
  - `addVersionView(...)`
  - `typeSpecificFields(...)`

#### Publish

- `styles.css`
  - `.publish-layout`
  - `.form-row`
  - `.file-picker-row`
  - `.publish-step-button`
- `main.ts`
  - `publishView()`
  - `typeSpecificFields(...)`

#### Governance index

- `styles.css`
  - `.governance-shell`
  - `.governance-board`
  - `.governance-column`
  - `.proposal-card`
- `main.ts`
  - `governanceView()`
  - `activeProposalCard(...)`
  - `historyProposalCard(...)`

#### Proposal detail / create proposal

- `styles.css`
  - `.proposal-layout`
  - `.proposal-detail`
  - `.vote-bars`
  - `.proposal-form-block`
  - `.proposal-type-row`
  - `.payload-grid`
- `main.ts`
  - `proposalDetailView(...)`
  - `createProposalView()`
  - `payloadFieldsView(...)`

#### My Space

- `styles.css`
  - `.space-grid`
  - `.balance-grid`
  - `.my-artifact-row`
  - `.vote-record-row`
- `main.ts`
  - `spaceView()`
  - `myVotesView(...)`
  - `myArtifactListView(...)`

#### Docs

- `styles.css`
  - `.docs-layout`
  - `.docs-sidebar`
  - `.docs-content`
  - `.docs-breadcrumb`
  - `.docs-artifact-meta`
- `main.ts`
  - `docsView()`
  - likely requires mobile docs-nav wrapper behavior

#### Blog

- `styles.css`
  - `.blog-list-shell`
  - `.blog-list-item`
  - `.blog-article-shell`
  - `.blog-article-header`
  - `.blog-article-body`
- `main.ts`
  - `blogView()`
  - `blogPostView(...)`

#### Forum

- `styles.css`
  - `.forum-board`
  - `.forum-block`
  - `.forum-topic-row`
  - `.content-section`
- `main.ts`
  - `forumView()`
  - `forumTopicView(...)`

#### Copilot / overlays

- `styles.css`
  - `.copilot-*`
  - `.drawer`
  - `.toast`
- `main.ts`
  - `copilotView()`
  - `copilotSettingsView(...)`

### 10.3.5 Suggested implementation order

Recommended practical sequence:

1. `styles.css`
   - breakpoint scaffold
   - body / shell / header / utility fixes
2. `styles.css`
   - artifact detail / docs / governance stacking
3. `main.ts`
   - mobile list/card structural helpers for type pages
4. `main.ts`
   - docs mobile navigation helper structure
5. `styles.css`
   - forms / publish / add-version / create-proposal
6. `styles.css`
   - My Space / Copilot / overlays
7. full regression and desktop parity review

## 10.1 Functional Review Checklist By Surface

Every responsive implementation pass should include a task-based review, not
just a visual review.

Explore and artifact-type pages:

- can a user quickly scan what the item is
- can a user tap the intended artifact without confusion
- are sort/filter actions still understandable

Artifact detail pages:

- can a user identify the artifact, current version, and summary quickly
- can a user reach preview/body, version history, and comments without getting
  lost
- are metadata and action controls still easy to locate

Docs / Blog / Forum:

- can a user read comfortably
- can a user understand navigation context
- can a user return, switch topics, and continue reading without friction

Governance:

- can a user understand proposal status quickly
- can a user find and use vote controls safely
- can a user read proposal text without losing the action context

Publish / forms:

- can a user understand the step order
- can a user distinguish required input from optional input
- can a user submit confidently without missing hidden controls

Copilot / overlays:

- can a user open, use, and close the panel without blocking core tasks
- can a user access all settings fields on a phone-sized viewport

Desktop regression review:

- does the desktop page still look like the pre-refactor page
- did any desktop spacing, hierarchy, or alignment visibly drift
- did any desktop control move without explicit approval

Mobile habit review:

- does the page read naturally from top to bottom on a phone
- are tap targets comfortable
- is there any unnecessary horizontal competition between controls
- does the page feel like a mobile web page rather than a shrunken desktop

Desktop parity review:

- compare before/after desktop screenshots for each major route family
- confirm that desktop hierarchy, emphasis, and visual rhythm are unchanged
- confirm that no mobile-only helper UI is visible at desktop widths

## 10.1.1 Minimum Mobile Usability Task Set

Responsive success is not achieved merely because content fits on a small
screen. A minimum mobile task set must remain clearly operable.

At minimum, a phone user should be able to do all of the following without
layout confusion or hidden critical controls:

1. Open the site and understand what PaperProof is from the landing surface.
2. Browse Explore and open an artifact from a type list.
3. Open an artifact detail page and:
   - understand what the artifact is
   - find the latest version
   - browse version history
   - access comments
4. Open a Docs article and continue reading without sidebar-related friction.
5. Open a Blog post and return back to the Blog index.
6. Open a Forum topic and understand where the discussion begins.
7. Open Governance and inspect at least one active or historical proposal.
8. Open a proposal detail page and:
   - understand its current status
   - read the proposal text
   - find the vote controls if active
9. Open Publish and understand the first-step flow.
10. Open Add Version and understand which artifact is being updated.
11. Open My Space and understand wallet, balances, votes, and artifacts sections.
12. Open Copilot, read messages, access settings, and close it safely.

If any of these tasks is visually possible but interaction-heavy, confusing, or
dependent on accidental scrolling discovery, the responsive design should be
treated as incomplete.

## 11. Risks

Main risks:

1. Desktop regressions

- responsive overrides may accidentally disturb desktop spacing or alignment

2. Partial mobile adaptation

- if only root widths are changed without converting layouts, pages may become
  even messier on narrow screens

3. Hidden overflow in low-traffic pages

- Governance, Publish, and My Space may still contain overlooked desktop-only
  assumptions even after Docs and Explore look correct

4. Visual inconsistency

- if card-based mobile patterns are not standardized, the app may feel patched
  rather than intentionally responsive

5. Functional regression disguised as UI polish

- a layout may look cleaner on mobile while making key actions slower or less
  obvious
- this is unacceptable for the current scope

6. Desktop drift

- broad responsive edits may unintentionally restyle desktop layouts
- this is a failure, because desktop UI should remain effectively unchanged

7. Responsive implementation overreach

- developers may be tempted to "improve" desktop UI while touching the same
  files
- this must be explicitly resisted during implementation and review

## 12. Acceptance Criteria

The refactor should be considered successful only if all of the following are
true.

### 12.1 Global behavior

- no app-wide forced horizontal scrolling on common phone widths
- no root desktop scaling caused by a hard global minimum width
- desktop viewport rendering remains visually consistent with the current site

### 12.2 Navigation

- top navigation remains operable on phone widths
- search remains accessible without layout breakage
- wallet and settings actions remain reachable
- desktop top navigation remains visually familiar

### 12.3 Core content pages

- Explore is usable on mobile without unreadable seven-column compression
- artifact detail pages are readable and navigable in one-column flow
- Docs pages are readable without persistent sidebar overflow
- Blog and Forum reading pages preserve good typography and media scaling
- desktop versions of the same pages retain their current visual structure

### 12.4 Governance and forms

- governance pages can be opened and read on mobile
- proposal and publish forms remain fillable and understandable on mobile
- desktop governance and forms retain their current visual hierarchy

### 12.5 Overlays

- Copilot and modal surfaces stay inside viewport bounds
- fixed panels do not trap content off-screen
- desktop overlays remain visually consistent with the current site

### 12.6 Functional preservation

- no existing core feature becomes harder to discover in a material way
- no existing core feature requires confusing extra navigation on mobile
- responsive changes improve small-screen usability without reducing task
  completion quality for reading, publishing, governance, wallet, and comment
  flows
- desktop users do not experience an unapproved UI redesign

### 12.7 Desktop visual lock

- 1280px and 1440px desktop renderings remain visually equivalent to the
  current site
- no approved responsive change should be justified by saying desktop users
  "probably will not notice"
- if a desktop-visible difference exists, it must be intentional, minimal,
  documented, and separately approved

## 13. Test Matrix

At minimum, test the following viewport widths:

- `1440px`
- `1280px`
- `1024px`
- `820px`
- `768px`
- `430px`
- `390px`

Desktop parity widths requiring explicit comparison against the current site:

- `1440px`
- `1280px`
- `1024px`

At minimum, validate these route families:

- home
- Explore
- every artifact-type family at least once during the full regression cycle
- one artifact detail page with PDF
- one artifact detail page with Markdown body
- add-version
- Docs index
- one Docs article
- Blog index
- one Blog article
- Forum index
- one Forum topic
- Governance index
- one proposal detail page
- create-proposal
- Publish
- My Space
- not-found / fallback state

Full release validation should ideally touch every route family listed in
Section 7, even if not every individual content item is manually reviewed on
every small change.

Desktop parity validation should include:

- side-by-side screenshot comparison for representative routes
- explicit review of header, utility bar, artifact detail, Docs, Governance,
  Publish, and My Space layouts
- confirmation that desktop spacing and control placement remain unchanged

Minimum mobile task validation should include:

- one complete pass through the task set listed in Section `10.1.1`
- validation at both `430px` and `390px` widths
- validation in at least one embedded mobile browser/webview scenario when
  feasible

## 14. Recommended Deliverable Shape

This responsive effort should land as a coordinated frontend refactor, not a
single isolated tweak.

Recommended deliverables:

- CSS breakpoint framework
- mobile nav behavior
- mobile artifact cards for list pages
- stacked detail layouts
- mobile-safe forms and overlays
- regression checklist for every deploy
- desktop parity checklist for every deploy

## 15. Summary

PaperProof currently behaves like a high-quality desktop interface that has not
yet been given a full responsive adaptation layer.

The main work is not protocol work. It is a frontend layout-system upgrade:

- remove global desktop width assumptions
- add real breakpoint logic
- convert dense multi-column desktop surfaces into mobile-first stacked flows
- standardize responsive behavior across reading, listing, governance, and form
  pages

If this plan is implemented carefully, PaperProof can preserve its current
desktop strength while becoming genuinely usable in mobile browsers.

The non-negotiable constraint is that this outcome must be achieved without
changing the current desktop UI presentation in any material way.
