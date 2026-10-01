# Maxyl Studios

A portfolio site for Maxyl Studios. Stills live in Supabase. Videos live in the `maxylstudios` folder of the S3 bucket. Pages are home, about, ads, entertainment, contact, and pricing.

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Where things live

- `src/lib/taxonomy.ts` — the Ads categories and the Entertainment pages.
- `src/app` — home, about, ads, entertainment, contact, and pricing.
- `src/app/contact/actions.ts` — server action that validates an enquiry. It does not send email yet. Connect a mail provider there before relying on it in production.
- `supabase/` — SQL files. Run `01` through `05` in order. If those are already in, run `06_catalogue.sql`.
- `/admin` — studio desk for uploads. Copy `.env.example` to `.env.local` and fill in the Supabase URL, publishable key, and the AWS values. On Vercel, add the same variables. Do not prefix the AWS keys with `NEXT_PUBLIC_`.

After the first four SQL files, run `supabase/05_admin_password.sql`. The desk at `/admin` then opens with that shared password. There is no email login. Images are cropped in the browser and stored in Supabase. Videos keep the original file, go into `s3://yourailens/maxylstudios/`, and are framed to the ratio you pick.

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — lint
