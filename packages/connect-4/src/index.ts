import { render, h } from 'hello-js';

render(
  h(
    'h1',
    { style: 'background-color: blue' as any },
    'hello',
    ' ',
    h('span', 'world'),
  ),
  document.getElementById('app')!,
);
