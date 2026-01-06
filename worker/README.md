# 6.S913 Grading worker

Grading worker for 6.S913. Proper functioning requires admin key access to the
portal at [6s913.mit.junic.kim](https://6s913.mit.junic.kim).

Note this code calls docker inside a docker container, so it must borrow the
host docker daemon's docker socket. See the [docker
compose](./docker-compose.yml) for further reference on how some of these
variables and mounts are wired up.

## Setup

Make sure to install [uv](https://docs.astral.sh/uv/), then set it up like a
standard python project.

```bash
uv venv
uv pip install -e .
source .venv/bin/activate
cp .env.example .env
```

You now need to edit the `.env` file to include the Admin API Key. Assuming you
have the dev server in `../server` already listening on localhost:3000, go to
`Admin` -> `Manage API Key` (or just http://localhost:3000/admin/apikeys) and
create a new API Key for your dev worker. 

The site will temporarily allow you to copy the API key, which you should then
put into your env file at

```bash
FLS_GRADING_SECRET="your_secret"
```

## Running the worker

Once you have completed the above, you can just run the worker with this
directory as the working directory:

```bash
fls-worker
```
