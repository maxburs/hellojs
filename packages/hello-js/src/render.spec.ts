// @vitest-environment jsdom

import { test, expect } from 'vitest';
import { render } from './render';
import { h } from './template';
import { createSignal } from './signal';

test('basic', () => {
  const dispose = render(
    h(
      'h1',
      { style: 'background-color: blue' },
      'hello',
      ' ',
      h('span', 'world'),
    ),
    document.body,
  );

  expect(document.body).toMatchInlineSnapshot(`
    <body>
      <h1
        style="background-color: blue;"
      >
        hello
         
        <span>
          world
        </span>
      </h1>
    </body>
  `);

  dispose();

  expect(document.body).toMatchInlineSnapshot(`<body />`);
});

test('nested', () => {
  const dispose = render(
    h(
      'h1',
      { style: 'background-color: blue' as any },
      'hello',
      ' ',
      h('span', 'world'),
    ),
    document.body,
  );
  expect(document.body).toMatchInlineSnapshot(`
    <body>
      <h1
        style="background-color: blue;"
      >
        hello
         
        <span>
          world
        </span>
      </h1>
    </body>
  `);
  dispose();
});

test('props', () => {
  const dispose = render(
    h('h1', { style: 'background-color: blue' }, 'hello', ' '),
    document.body,
  );
  expect(document.body).toMatchInlineSnapshot(`
    <body>
      <h1
        style="background-color: blue;"
      >
        hello
         
      </h1>
    </body>
  `);
  dispose();
});

test('child order is maintained', () => {
  const a = createSignal(1);
  const b = createSignal(1);
  const c = createSignal(true);

  const dispose = render(
    h(
      'div',
      () => 'a-' + a().toString(),
      () => 'b-' + b().toString(),
      () => c() && 'c',
    ),
    document.body,
  );

  expect(document.body).toMatchInlineSnapshot(`
    <body>
      <div>
        a-1
        b-1
        c
      </div>
    </body>
  `);

  c.set(false);
  a.set(2);

  expect(document.body).toMatchInlineSnapshot(`
    <body>
      <div>
        a-2
        b-1
        <!---->
      </div>
    </body>
  `);

  c.set(true);
  b.set(2);
  a.set(3);

  expect(document.body).toMatchInlineSnapshot(`
    <body>
      <div>
        a-3
        b-2
        c
      </div>
    </body>
  `);
  dispose();
});
