# Zettalogix Migration Suite interview guide

## Tell me about this project.

This repository contains React and Electron client surfaces for authenticating, configuring, monitoring, and reviewing content-migration jobs handled by an external backend.

## Why did you build it?

Migration operators need a clear control plane for complex jobs, status, and evidence without dealing directly with backend worker internals.

## What was your contribution?

Discuss the frontend/Electron client architecture, authentication surface, UI behavior, build verification, deployment, portable documentation, and demo. State clearly that the backend is external and owned in another repository.

## What was the hardest technical problem?

Designing useful client states around an external API/auth boundary that is not available in every local environment.

## How does the architecture work?

The React/Vite web client and Electron shell call external API/auth services through environment configuration. Vercel hosts the verified public frontend; migration workers are not in this repository.

## What would you improve?

Add an authorized mock/contract server, API schema validation, client tests, Electron packaging checks, and end-to-end tests against a sanctioned staging backend.

## How did you test it?

The WebUI TypeScript/Vite production build and CI pass, and the public frontend returns HTTP 200. No automated test script or external migration execution is claimed.

## What are its security limitations?

OAuth redirects, Supabase/auth configuration, external API origins, tokens, and desktop storage require environment-specific review. No backend security claim is made here.

## How would you scale it?

The client is mostly static; scale concerns live in external APIs/workers. The UI should paginate job evidence, stream status carefully, and avoid polling overload.

## What did you learn?

Ownership and service boundaries must be explicit. A polished client is not evidence that an external migration engine was authored or production-verified here.
