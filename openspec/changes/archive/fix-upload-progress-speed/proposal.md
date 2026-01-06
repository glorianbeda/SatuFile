# Fix Upload Progress Speed Display

## Problem
Upload progress shows delayed/inaccurate speed due to chunked upload architecture. Current implementation calculates speed based on total bytes uploaded divided by total elapsed time, which causes:
1. Speed shows 0 or very low initially
2. Speed doesn't reflect actual current transfer rate
3. Progress feels laggy/unresponsive

## Proposed Solution
Implement a sliding window speed calculation that tracks recent transfer rates instead of cumulative averages.

### Changes Required

#### Frontend (`HomePage.tsx`)
1. **Sliding Window Speed Calculation**
   - Track last N chunk upload times and sizes (e.g., last 5 chunks)
   - Calculate speed from recent chunks only, not cumulative
   - Use exponential moving average (EMA) for smoother display

2. **Per-Chunk Timing**
   - Record start/end time for each chunk upload
   - Calculate instantaneous speed per chunk
   - Blend with previous readings for stability

3. **Optimistic Progress Updates**
   - Update progress immediately when chunk starts (not just when complete)
   - Show "uploading chunk X of Y" for better UX

### Implementation Details

```typescript
// Sliding window for speed calculation
interface SpeedTracker {
  samples: { bytes: number; duration: number }[];
  maxSamples: number;
}

const calculateSpeed = (tracker: SpeedTracker): number => {
  if (tracker.samples.length === 0) return 0;
  
  const totalBytes = tracker.samples.reduce((sum, s) => sum + s.bytes, 0);
  const totalTime = tracker.samples.reduce((sum, s) => sum + s.duration, 0);
  
  return totalTime > 0 ? totalBytes / totalTime : 0;
};
```

## Benefits
- More accurate real-time speed display
- Responsive progress feedback
- Better user experience during large file uploads
