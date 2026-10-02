# Tastora

Restaurant ordering and dining platform.

## Deployment

- **Client:** Deploy `client/` to Vercel using the Next.js framework preset and the default build/output settings. Set `NEXT_PUBLIC_BACKEND_SERVER` to the Render API origin (for example, `https://tastora-api.onrender.com`, without `/api`). Set `NEXT_PUBLIC_RAZORPAY_KEY_ID` to the public Razorpay key ID if online payments are enabled.
- **API and Admin:** The root `render.yaml` defines two Render services: the Express API from `server/` and the Admin static site from `admin/`. Configure the secret values requested by the blueprint in Render. For the Admin service, set `REACT_APP_BACKEND_SERVER` to the API origin, without `/api`.
- **Client environment example:** See `client/.env.example` for the Vercel variable names. Keep database credentials, JWT secrets, and Razorpay secrets only in Render environment variables; never place them in Vercel's `NEXT_PUBLIC_*` variables.
