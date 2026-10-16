# Role Lens v2

A separate private hosted Site. Three seeded jobs: Flybuys AI Platform, Kinetic Data Engineer, Compare the Market AI Data Engineer. Each has independently generated criteria and real Decisions results for the 2020 and 2026 resumes.

## User flow

- Home: search positions and open their individual candidate lists.
- Add a position: upload PDF, Markdown or DOCX, optionally supply a title/company, and generate its rubric using GPT-5.6 Sol with low reasoning. No CV is evaluated at this step.
- Add candidate CVs within a position: upload up to 20 CVs. The browser extracts text and sends it to the private backend. OpenAI Decisions evaluates against the saved rubric; Sol extracts source evidence. Each completed candidate is saved independently so a later failure does not lose earlier successes.
- Remove positions or candidates with the displayed control. Removal is persistent, reversible hiding; Undo restores the record. Removing a position hides its candidate list. Removing a CV affects only that position. Original files are not retained; results, extracted role text, and source quotes are held in private R2 storage.

Positions are stored as R2 records, with overrides for seeded examples. Candidate records are separate per position. A deployment does not overwrite uploaded records. The private Sites access policy protects all routes. Mutations additionally check browser Origin. The project API key is stored only as a Sites runtime secret, never in source or browser code.

## Input limits

10 MB/file; 50–120,000 readable characters; PDF up to 150 pages. PDF uses bundled PDF.js in a browser worker. Scanned/image-only PDFs fail explicitly and require OCR. DOCX body paragraphs and tables are read in document order; headers, text boxes and embedded images are omitted. Only selected DOCX document XML is decompressed, with a 2 MB expansion limit. Markdown uses UTF-8 text. No external parser service receives files.

## Development

Node 22+ is recommended. Run from this directory:

```sh
npm ci
npm test
npm run build
node scripts/dev.mjs
```

Local preview: http://127.0.0.1:4182. Local R2 emulation writes to ignored .local-data; it is separate from hosted storage. Build generates a self-contained Worker using the Sites ESM starter and embeds the frontend, PDF worker and seed data. Hosting manifest declares R2 BUCKET. Set OPENAI_API_KEY as a hosted secret before deployment.

Five backend checks cover seeded live runs, removals and restore, position isolation, rubric-first creation and CV evaluation, duplicate rejection, failed API atomicity, bad input and Origin rejection. Test model responses are mocks; seed results were generated using real API calls.

Scores are role-specific evidence coverage, not calibrated suitability or hiring probability. Do not use them for automatic rejection. Missing evidence is not proof of absent skill. Source quotes are verified against document text; unmatched proposed quotes are omitted and flagged. A human should check the rubric and evidence and verify gaps with candidates.

## Standalone copy

This directory includes only application source, build/dev scripts, dependency manifests, tests, hosting configuration and the three example evaluations. Generated bundles, dependencies, Git history, local uploads/state, original CV files, API caches and deployment archives are excluded. `npm run build` creates the Worker and deployment output.

No credentials are included. For live inference, provide `OPENAI_API_KEY` through the process environment or the hosted Sites secret store. The hosting project ID is a non-secret identifier for the existing v2 Site. Seed data contains the example professional resume evidence and evaluation results.
