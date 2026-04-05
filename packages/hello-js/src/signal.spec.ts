import { test, expect } from 'vitest';
import {
  cleanup,
  createComputed,
  createRoot,
  createSignal,
  createEffect,
} from './signal';

// TODO: A2 is run an extra time
test('effect', ({ signal }) => {
  const timeline: string[] = [];

  const signalA = createSignal('a');
  const signalB = createSignal('b');

  createRoot(
    () => {
      createEffect(() => {
        timeline.push(`[read A1]: ${signalA()}`);
        createEffect(() => {
          timeline.push(`[read A2]: ${signalA()}`);
        });
      });
      createEffect(() => {
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
      "[read A2]: 1",
      "[read A1]: 1",
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
    createEffect(() => {
      cleanup(() => timeline.push(`[cleanup 1]`));
      createEffect(() => {
        signalA();
        cleanup(() => timeline.push(`[cleanup 2]`));
      });
    });
    createEffect(() => {
      cleanup(() => timeline.push(`[cleanup 3]`));
    });
  });

  signalA.set('b');

  dispose();

  expect(timeline).toMatchInlineSnapshot(`
    [
      "[cleanup 2]",
      "[cleanup 2]",
      "[cleanup 1]",
      "[cleanup 3]",
    ]
  `);
});

test.only('compound', () => {
  const timeline: string[] = [];

  const signalA = createSignal(2);

  const dispose = createRoot(() => {
    const double = createComputed(() => {
      // cleanup(() => timeline.push('cleanup'));
      // createEffect(() => {
      //   timeline.push('effect1');
      // })
      return signalA() * 2;
    });

    createEffect(() => {
      timeline.push(`read double: ${double()}`);
    });
  });

  console.log('set to 4');
  timeline.push('set to 4');
  signalA.set(4);

  console.log('dispose');
  dispose();

  expect(timeline).toMatchInlineSnapshot(`
    [
      "read double: 4",
      "set to 4",
      "read double: 8",
    ]
  `);
});
