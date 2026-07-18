# Interview guide

## What is Zettalogix?

A React/Electron migration-control prototype that makes job setup, state, connection evidence, and operational guidance inspectable while keeping the separately owned backend boundary explicit.

## What did you implement here?

The owned work is the web client, synthetic state machine, search, job and connection workflows, evidence-derived readiness, local settings, failure guidance, Electron security boundary, CI, documentation, and authentic demo. Do not imply authorship or verification of the referenced external worker.

## What was technically difficult?

The main challenge was making a useful evaluator path without fake integration claims. Demo mode now bypasses Supabase, provider SDKs, and API fetches; all copy changes with runtime mode; readiness is a pure function over visible state; and Electron captures only its own renderer for repeatable evidence.

## How was it tested?

Seven web tests cover the synthetic workflow and readiness, two Node tests cover desktop external-link enforcement, TypeScript/Vite builds pass for web and relative-asset desktop output, both dependency trees audit clean, and current Electron renderer captures are manually inspected.

## What does v0.3 not prove?

It does not prove production migrations, an owned worker, live provider credentials, OAuth redirect correctness, tenant permissions, installer signing, staging API compatibility, or enterprise accessibility.

## What comes next?

With authority over a backend or sanctioned contract server, add schema validation, discovery inventory, dry-run manifests, checkpoint/retry evidence, paginated history, signed packaging, and end-to-end tests against a controlled staging tenant.
