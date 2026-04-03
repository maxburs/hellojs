import type { Dispose, HJNode } from './types';
import { cleanup, createEffect, createRoot } from './signal';

function applyResolvedNode(
  node: Exclude<HJNode, Function>,
  target: HTMLElement,
) {
  if (!node) {
    return;
  }

  let element: Node;

  if (typeof node === 'string') {
    element = document.createTextNode(node);
  } else {
    const htmlElement = document.createElement(node.tagName);
    element = htmlElement;
    Object.assign(htmlElement, node.properties);
    for (const child of node.children) {
      _render(child, htmlElement);
    }
  }

  target.appendChild(element);
  cleanup(() => target.removeChild(element));
}

function _render(node: HJNode, target: HTMLElement) {
  if (typeof node === 'function') {
    createEffect(() => applyResolvedNode(node(), target));
  } else {
    applyResolvedNode(node, target);
  }
}

export function render(
  node: HJNode,
  target: HTMLElement,
  options?: { signal?: AbortSignal },
): Dispose {
  return createRoot(() => _render(node, target), options);
}
