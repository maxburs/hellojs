import { test, expect } from 'vitest';
import {
  cleanup,
  createComputed,
  createRoot,
  createSignal,
  createEffect,
} from './signal';

// TODO: A2 is run an extra time
test('effect', () => {
  const timeline: string[] = [];

  const signalA = createSignal(1);
  const signalB = createSignal(1);

  const dispose = createRoot(() => {
    createEffect(
      () => {
        timeline.push(`[read A1]: ${signalA()}`);
        createEffect(
          () => {
            timeline.push(`[read A2]: ${signalA()}`);
          },
          { name: 'b' },
        );
      },
      { name: 'a' },
    );
    createEffect(
      () => {
        timeline.push(`[read B]: ${signalB()}`);
      },
      { name: 'c' },
    );
  });

  console.log('set a to 2');
  signalA.set(2);
  console.log('set b to 2');
  signalB.set(2);
  console.log('dispose');
  dispose();
  console.log('set b to 3');
  signalB.set(3);

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

test('compound', () => {
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

test.only('effect dispose', () => {
  const timeline: string[] = [];

  const signalA = createSignal(2);

  const dispose = createRoot(() => {
    createEffect(() => {
      timeline.push(`signalA: ${signalA()}`);
      cleanup(() => timeline.push('cleanup'));
    });
  });

  console.log('dispose');
  dispose();

  console.log('set to 8');
  timeline.push('set to 8');
  signalA.set(4);

  expect(timeline).toMatchInlineSnapshot(`
    [
      "read double: 4",
      "set to 4",
      "read double: 8",
    ]
  `);
})
