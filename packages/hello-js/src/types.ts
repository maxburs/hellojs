import type { Signal } from "./signal";
import type { HJNode } from "./template";

export type Dispose = () => void;

export type HJNodeSignal = Signal<HJNode>;

export type Component = () => () => HJNode;
