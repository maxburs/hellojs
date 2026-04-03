import type { Dispose } from '.';

let reader: undefined | Invalidate;
let parent: undefined | Invalidate[];

export type Invalidate = () => void;

export interface Signal<T = unknown> {
  (): T;
}

export interface MutableSignal<T> extends Signal<T> {
  set(value: T): void;
}

export function createSignal<T>(value: T): MutableSignal<T> {
  function signal() {
    if (reader) {
      _dependents.push(reader);
    }
    return value;
  }

  let _dependents: Invalidate[] = [];

  signal.set = function set(_value: T) {
    const deps = _dependents;
  
    // Update state before invalidating deps
    _dependents = [];
    value = _value;
  
    for (const d of deps) {
      d();
    }
  };

  signal._dependents = _dependents;

  return signal as MutableSignal<T>;
}

export function createComputed<T>(cb: () => T): () => T {
  let value: undefined | { dependentOn: Signal[]; value: T };
  const _dependents: Invalidate[] = [];

  function invalidate() {
    value = undefined;
    const deps = _dependents;
    _dependents.length = 0;
    for (const d of deps) {
      d();
    }
  }

  function computed(): T {
    if (!value) {
      const dependentOn: Signal[] = [];

      const _reader = reader;
      const _parent = parent;
      reader = invalidate;
      parent = _dependents;

      const _value = cb();

      reader = _reader;
      parent = _parent;

      value = { dependentOn, value: _value };
    }

    return value.value;
  }

  return computed;
}

export function effect(cb: () => void) {
  if (!parent) {
    throw new Error(`effect must be called in a reactive context`);
  }

  parent.push(clear);

  const _dependents: Invalidate[] = [];

  function clear() {
    const deps = _dependents;
    _dependents.length = 0;
    for (const d of deps) {
      d();
    }
  }

  function invalidate() {
    clear();
    evaluate();
  }

  function evaluate() {
    const _reader = reader;
    const _parent = parent;
    reader = invalidate;
    parent = _dependents;

    cb();

    reader = _reader;
    parent = _parent;
  }

  evaluate();
}

export function cleanup(cb: () => void) {
  if (!parent) {
    throw new Error(`cleanup must be called in a reactive context`);
  }
  parent.push(cb);
}

export function createRoot(
  cb: () => void,
  options?: { signal?: AbortSignal },
): Dispose {
  const _dependents: Invalidate[] = [];

  function dispose() {
    for (const d of _dependents) {
      d();
    }
  }

  if (options?.signal?.aborted) {
    return dispose;
  }

  options?.signal?.addEventListener('abort', dispose);

  const _reader = reader;
  const _parent = parent;
  reader = undefined
  parent = _dependents;

  cb();

  reader = _reader;
  parent = _parent;

  return dispose;
}
