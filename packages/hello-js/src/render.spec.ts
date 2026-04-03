// @vitest-environment jsdom

import { test, expect } from 'vitest';
import { render } from './render';
import { h } from './template';

test('basic', () => {
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
    h('h1', { style: 'background-color: blue' as any }, 'hello', ' '),
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
