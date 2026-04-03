import type { Dispose } from './types';
import type { HJNode } from './template';

export function render(
  node: HJNode,
  target: HTMLElement,
  options?: { signal?: AbortSignal },
): Dispose {
  let element: Node;

  if (node.tagName === 'text') {
    element = document.createTextNode(node.text);
  } else {
    const htmlElement = document.createElement(node.tagName);
    element = htmlElement;
    Object.assign(htmlElement, node.properties);
    for (const child of node.children) {
      render(child, htmlElement);
    }
  }

  target.appendChild(element);

  function dispose() {
    options?.signal?.removeEventListener('abort', dispose);
    target.removeChild(element);
  }

  options?.signal?.addEventListener('abort', dispose);

  return dispose;
}
