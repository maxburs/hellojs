import type { Dispose } from './types';
import type { HJNode } from './template';
import { cleanup, createEffect, createRoot } from './signal';

function _render(node: () => null | HJNode, target: HTMLElement) {
  createEffect(() => {
    const n = node();

    if (!n) {
      return;
    }

    let element: Node;

    if (n.tagName === 'text') {
      element = document.createTextNode(n.text);
    } else {
      const htmlElement = document.createElement(n.tagName);
      element = htmlElement;
      Object.assign(htmlElement, n.properties);
      for (const child of n.children) {
        _render(child, htmlElement);
      }
    }

    target.appendChild(element);
    cleanup(() => target.removeChild(element));
  });
}

export function render(
  node: () => HJNode,
  target: HTMLElement,
  options?: { signal?: AbortSignal },
): Dispose {
  return createRoot(() => _render(node, target), options);
}
