#!/usr/bin/env python3
import logging
import random
import time
import traceback

from .worker import run_once

# ------------------------------------------------------------
# configuration knobs
# ------------------------------------------------------------

IDLE_SLEEP_SECONDS = 15
ERROR_SLEEP_SECONDS = 60
MAX_BACKOFF_SECONDS = 300


# ------------------------------------------------------------
# logging
# ------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

log = logging.getLogger("fls-main")


# ------------------------------------------------------------
# main loop
# ------------------------------------------------------------


def main() -> None:
    log.info("grading worker starting")

    backoff = ERROR_SLEEP_SECONDS

    while True:
        try:
            did_work = run_once()

            if did_work:
                # reset backoff after successful work
                backoff = ERROR_SLEEP_SECONDS
                continue

            # idle path
            sleep_for = IDLE_SLEEP_SECONDS + random.uniform(-3, 3)
            log.debug("idle, sleeping for %.1fs", sleep_for)
            time.sleep(max(1.0, sleep_for))

        except KeyboardInterrupt:
            log.info("received keyboard interrupt, exiting")
            return

        except Exception:
            # this should never happen, but if it does,
            # we *do not* crash the worker
            log.error("unhandled exception in main loop")
            traceback.print_exc()

            log.info("sleeping for %ds before retry", backoff)
            time.sleep(backoff)

            backoff = min(backoff * 2, MAX_BACKOFF_SECONDS)


# ------------------------------------------------------------
# entrypoint
# ------------------------------------------------------------

if __name__ == "__main__":
    main()
