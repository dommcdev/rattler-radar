# RattlerEvents

## Getting Started

First, run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## RattlerTracks sync

`src/lib/rattlertracks/` fetches upcoming public events from
[RattlerTracks](https://stmarytx.campuslabs.com/engage/) and normalizes them
into our `RattlerTracksEvent` format.

```bash
bun run sync:rattlertracks   # saves events to data/rattlertracks-events.json
bun test                     # runs unit tests
```
