import { render, h } from 'hello-js';
import { cleanup, createSignal } from '../../hello-js/src/signal';

function Connect4() {
  const text = createSignal('');
  const num = createSignal(1);

  setInterval(() => {
    num.set(num() + 1);
  }, 1_000);

  const ref = (element: HTMLInputElement) => {
    const onChange = (ev: InputEvent) => {
      text.set((ev.target as HTMLInputElement).value);
    };
    element.addEventListener('input', onChange);
    cleanup(() => element.removeEventListener('input', onChange));
  };

  return () =>
    h(
      'div',
      h(
        'h1',
        { style: 'background-color: blue' },
        'hello',
        ' ',
        h('span', 'world'),
      ),
      h('input', { ref }),
      h('div', text),
      h('div', () => num().toString()),
    );
}

render(Connect4(), document.getElementById('app')!);
