import type { Signal } from './signal';

export type Dispose = () => void;

export const NODE_IDENTIFIER: unique symbol = Symbol();

export interface HJElementNode<
  T extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
> {
  $$node: typeof NODE_IDENTIFIER;
  tagName: T;
  properties: Partial<HTMLElementTagNameMap[T]>;
  children: readonly HJNode[];
}

export type HJNode =
  | null
  | string
  | HJElementNode
  | (() => null | string | HJElementNode);

export type HJChild =
  | null
  | false
  | string
  | HJElementNode
  | (() => null | false | string | HJElementNode);

export type HJNodeSignal = Signal<HJNode>;

export type Component = () => () => HJNode;
