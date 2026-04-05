import type { Dispose, HJNode } from './types';
import { cleanup, createEffect, createRoot } from './signal';

function createNodeElement(node: Exclude<HJNode, Function>): Node {
  if (!node) {
    return new Comment();
  }

  if (typeof node === 'string') {
    return document.createTextNode(node);
  }

  const element = document.createElement(node.tagName);

  const { ref, ...attributes } = node.properties;
  Object.assign(element, attributes);
  for (const child of node.children) {
    _render(child, element);
  }
  ref?.(element as any);
  return element;
}

function _render(node: HJNode, target: HTMLElement) {
  let htmlNode: undefined | Node;
  if (typeof node === 'function') {
    createEffect(() => {
      const prev = htmlNode;
      htmlNode = createNodeElement(node());
      if (prev) {
        target.replaceChild(htmlNode, prev);
      } else {
        target.appendChild(htmlNode);
      }
    });
  } else {
    htmlNode = createNodeElement(node);
    target.appendChild(htmlNode);
  }
  cleanup(() => target.removeChild(htmlNode!));
}

export function render(
  node: HJNode | (() => HJNode),
  target: HTMLElement,
  options?: { signal?: AbortSignal },
): Dispose {
  return createRoot(
    () => _render(typeof node === 'function' ? node() : node, target),
    options,
  );
}
