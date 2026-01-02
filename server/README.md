# 6.S913 Web App

This is the grading website for 6.S913.

## Local Setup

Get the environment variables set up.

1. `cp .env.example .env`
2. Configure `.env` with Google OAuth credentials
3. Set the `DICTATOR` `.env` variable to your email
4. Set the `AUTH_SECRET` `.env` variable to some random string

Now you're basically there.

```bash
make dev
```

Check localhost:3000
