# 6.S913 Web App

This is the grading website for 6.S913. It uses [NextJS](https://nextjs.org/)
and [Drizzle ORM](https://orm.drizzle.team/) alongside an sqlite3 database for
simplicity.

## Local Setup

If you want to debug the database, you should have sqlite3 installed.

Get the environment variables set up.

1. `cp .env.example .env`
2. Configure `.env` with SMTP credentials (required for sending magic links)
3. Set the `DICTATOR` `.env` variable to your google/MIT email
4. Set the `AUTH_SECRET` `.env` variable to some random string

Now you're basically there. You just need to run

```bash
make dev
```

That will set up the database, install dependencies, and run the server at
localhost:3000 (given nothing already running there).
