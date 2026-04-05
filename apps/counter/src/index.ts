import { render, h } from 'hello-js';
import {
  cleanup,
  createSignal,
} from '../../../packages/hello-js/src/signal.ts';

function Counter() {
  const num = createSignal(1);

  function increment() {
    num.set(num() + 1);
  }

  const intervalId = setInterval(increment, 1_000);

  cleanup(() => clearInterval(intervalId));

  const ref = (element: HTMLElement) => {
    element.addEventListener('click', increment);
    cleanup(() => element.removeEventListener('click', increment));
  };

  return () =>
    h(
      'div',
      h('button', { ref }, 'increment'),
      ' ',
      h('span', { style: 'background-color: salmon' }, 'value: ', () =>
        num().toString(),
      ),
    );
}

render(() => Counter(), document.getElementById('app')!);
