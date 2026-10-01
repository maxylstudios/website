# Maxyl Studios

A portfolio catalogue built as one Next.js app. The index, plate pages, catalogue data, and enquiry form all ship together. There is no separate backend.

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Where things live

- `src/lib/catalogue.ts` — starter projects. Replace these with the real work.
- `src/app` — pages. Index, catalogue, plate, studio, contact.
- `src/app/contact/actions.ts` — server action that validates an enquiry. It does not send email yet. Connect a mail provider there before relying on it in production.

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — lint
