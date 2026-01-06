# Grading infrastructure for 6.S913

This repository contains all the grading infrastructure for 6.S913 Fundamentals
of Linux Systems. The production portal can be viewed
[here](https://6s913.mit.junic.kim).

The grading system consists of a webapp that stores student submissions,
stateless workers that will grade incoming student submissions and report
results, and container images used to build student OS images and execute
grading logic against those images.

Students will access the portal via their MIT Email (routed through Google
OAuth) and upload their submissions to the graders. The workers, who access
the webapp's protected endpoints via access tokens, will then pick up the
submission and, once grading is completed, will return the result to the webapp
for the students to view in the portal.

Admins have access to their own portal, from which they can manage users, adjust
permissions, and override grades when necessary. One special user, defined in
environment configuration as `DICTATOR`, is guaranteed permanent administrative
access and cannot be demoted 😈.

## Setup

Please check respective instructions in `./server/` or `./worker/` to set up
development of either the server or the grading worker. Please note that all
projects in this repository require a working docker installation.

## Worker Security

We use docker containers to grade student submissions. The images can be found
in the `./images` directory. The builder and grader containers are designed to
mitigate the effects of potentially hostile code, including limiting resource
usage and mounting all writable filesystems as tmpfs.

## Responsible Disclosure

Security concerns relating to the grading infrastructure should be reported
privately to junickim AT (MIT's email server).

To Registered Students: Please do not attempt to probe or attack the production
grading system. Students who intentionally attempt to interfere with grading
infrastructure may be subject to staff action, including receiving a failing
grade for the course. We hope this policy never needs to be enforced.
