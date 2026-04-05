import { test, expect } from 'vitest';
import {
  cleanup,
  createComputed,
  createRoot,
  createSignal,
  createEffect,
} from './signal';

test('effect', () => {
  const timeline: string[] = [];

  const signalA = createSignal(1, { name: 'a' });
  const signalB = createSignal(1, { name: 'b' });

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

  timeline.push('set a to 2');
  signalA.set(2);
  timeline.push('set b to 2');
  signalB.set(2);
  timeline.push('dispose');
  dispose();
  timeline.push('set b to 3');
  signalB.set(3);

  expect(timeline).toMatchInlineSnapshot(`
    [
      "[read A1]: 1",
      "[read A2]: 1",
      "[read B]: 1",
      "set a to 2",
      "[read A1]: 2",
      "[read A2]: 2",
      "set b to 2",
      "[read B]: 2",
      "dispose",
      "set b to 3",
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
      "[cleanup 1]",
      "[cleanup 2]",
      "[cleanup 3]",
    ]
  `);
});

test('compound', () => {
  const timeline: string[] = [];

  const signalA = createSignal(2);

  const dispose = createRoot(() => {
    const double = createComputed(() => {
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
  timeline.push('dispose');
  dispose();

  expect(timeline).toMatchInlineSnapshot(`
    [
      "read double: 4",
      "set to 4",
      "read double: 8",
      "dispose",
    ]
  `);
});

test('effect dispose', () => {
  const timeline: string[] = [];

  const signalA = createSignal(2);

  const dispose = createRoot(() => {
    cleanup(() => timeline.push('cleanup1'));
    createEffect(() => {
      cleanup(() => timeline.push('cleanup2'));
      createEffect(() => {
        timeline.push(`signalA: ${signalA()}`);
        cleanup(() => timeline.push('cleanup3'));
      });
      cleanup(() => timeline.push('cleanup4'));
    });
  });

  timeline.push('set to 4');
  signalA.set(4);

  dispose();

  timeline.push('set to 8');
  signalA.set(4);

  expect(timeline).toMatchInlineSnapshot(`
    [
      "signalA: 2",
      "set to 4",
      "cleanup3",
      "signalA: 4",
      "cleanup1",
      "cleanup2",
      "cleanup3",
      "cleanup4",
      "set to 8",
    ]
  `);
});
