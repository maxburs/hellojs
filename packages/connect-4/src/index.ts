import { render, h } from 'hello-js';
import { createSignal } from '../../hello-js/src/signal';

function Connect4() {
  const text = createSignal('');
  const num = createSignal(1);

  setInterval(() => {
    num.set(num() + 1);
  }, 1_000);

  return () =>
    h(
      'div',
      h(
        'h1',
        { style: 'background-color: blue' as any },
        'hello',
        ' ',
        h('span', 'world'),
      ),
      h('input'),
      h('div', text),
      h('div', () => num().toString())
    );
}

render(Connect4(), document.getElementById('app')!);
