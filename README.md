# Will You Go on a Date With Me? 💚

A romantic invitation site for **October 3, 2026**. Plain HTML/CSS/JS built with Vite. No frameworks, and the database is optional.

## Run it
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs /dist
```

## How it works
- **Page 1:** the question. YES bursts hearts/petals, then fades to page 2.
- **NO:** dodges (mouse hover, or tap/Enter) inside the card up to 7 times, then stops and can be chosen. A "No, thank you" link is always available, so nobody is trapped.
- **Page 2:** the confirmation and a "Can't Wait ❤️" heart burst.
- Reduced-motion settings are respected.

## Optional: Supabase
1. Run `supabase/schema.sql` in the Supabase SQL editor (table `date_responses`: id, response, created_at; row-level security allows inserts only).
2. Copy `.env.example` to `.env` and fill in your project URL and **anon** key. Never use the service-role key.
3. No env vars? The site works and simply saves nothing.

## Deploy
- **Vercel / Netlify:** import the GitHub repo. Build command `npm run build`, output `dist`. Add the two `VITE_` variables in the dashboard if using Supabase.
- **GitHub Pages:** build with a GitHub Actions workflow that runs `npm run build` and publishes `dist` (store the `VITE_` values as repository secrets).

## Customize
Edit the text in `index.html`, colors in the `:root` block of `src/styles.css`. To use a real rose photo, add it to `public/` and set it as a `body` background image.
