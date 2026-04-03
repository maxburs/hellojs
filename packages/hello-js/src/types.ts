import type { Signal } from "./signal";
import type { HJElementNode, HJNode } from "./template";

export type Dispose = () => void;

export type HJNodeSignal = Signal<HJElementNode>;

export type Component = () => () => HJNode;
