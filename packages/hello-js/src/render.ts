import type { Dispose } from '.';
import type { HJElementNode } from './template';

export function render(
  node: HJElementNode,
  target: HTMLElement,
  options?: { signal?: AbortSignal },
): Dispose {
  const element = document.createElement(node.tagName);
  Object.assign(element, node.properties);
  for (const child of node.children) {
    if (child.tagName === 'text') {
      element.appendChild(document.createTextNode(child.text));
    } else {
      render(child, element);
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
