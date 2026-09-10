# KukaKuskaa Website

Official website for KukaKuskaa Oy.

## Development

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

## Contact Form Email

The production contact form posts to the Vercel serverless endpoint:

```text
/api/contact
```

Email is sent through the Resend API. Add these environment variables in Vercel:

```text
RESEND_API_KEY
CONTACT_FROM_EMAIL
```

`CONTACT_FROM_EMAIL` must be a sender address accepted by Resend, typically from a verified sending domain. Form submissions are always sent to `myynti@kukakuskaa.com`.
