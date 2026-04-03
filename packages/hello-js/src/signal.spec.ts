import { test, expect } from 'vitest';
import { cleanup, createRoot, createSignal, effect } from './signal';

test('effect', ({ signal }) => {
  const timeline: string[] = [];

  const signalA = createSignal('a');
  const signalB = createSignal('b');

  createRoot(
    () => {
      effect(() => {
        timeline.push(`[read A1]: ${signalA()}`);
        effect(() => {
          timeline.push(`[read A2]: ${signalA()}`);
        });
      });
      effect(() => {
        timeline.push(`[read B]: ${signalB()}`);
      });

      signalA.set('1');
      signalB.set('2');
    },
    { signal },
  );

  expect(timeline).toMatchInlineSnapshot(`
    [
      "[read A1]: a",
      "[read A2]: a",
      "[read B]: b",
      "[read A1]: 1",
      "[read A2]: 1",
      "[read A2]: 1",
      "[read B]: 2",
    ]
  `);
});

test('cleanup simple', () => {
  const timeline: string[] = [];

  const dispose = createRoot(() => {
    cleanup(() => timeline.push(`[cleanup 1]`));
  });

  dispose();

  expect(timeline).toMatchInlineSnapshot(`
    [
      "[cleanup 1]",
    ]
  `);
});

test('cleanup complex', () => {
  const timeline: string[] = [];

  const signalA = createSignal('a');

  const dispose = createRoot(() => {
    effect(() => {
      cleanup(() => timeline.push(`[cleanup 1]`));
      effect(() => {
        signalA();
        cleanup(() => timeline.push(`[cleanup 2]`));
      });
    });
    effect(() => {
      cleanup(() => timeline.push(`[cleanup 3]`));
    });
  });

  signalA.set('b');

  dispose();

  expect(timeline).toMatchInlineSnapshot(`
    [
      "[cleanup 2]",
      "[cleanup 1]",
      "[cleanup 2]",
      "[cleanup 3]",
    ]
  `);
});

test('compound', () => {
  const timeline: string[] = [];

  const signalA = createSignal('a');
  const signalB = createSignal('b');

  const dispose = createRoot(
    () => {
      effect(() => {
        timeline.push(`[read A1]: ${signalA()}`);
        cleanup(() => timeline.push('[cleanup A1]'));

        effect(() => {
          timeline.push(`[read A2]: ${signalA()}`);
          cleanup(() => timeline.push('[cleanup A2]'));
        });
      });
      effect(() => {
        timeline.push(`[read B]: ${signalB()}`);
        cleanup(() => timeline.push('[cleanup B]'));
      });

      signalA.set('1');
      signalB.set('2');
    }
  );

  dispose();

  expect(timeline).toMatchInlineSnapshot(`
    [
      "[read A1]: a",
      "[read A2]: a",
      "[read B]: b",
      "[cleanup A1]",
      "[cleanup A2]",
      "[read A1]: 1",
      "[read A2]: 1",
      "[read A2]: 1",
      "[cleanup B]",
      "[read B]: 2",
      "[cleanup A1]",
      "[cleanup A2]",
      "[cleanup B]",
    ]
  `);
});
