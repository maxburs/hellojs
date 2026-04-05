# Hello js

## TODO
- [x] Refs
- [ ] Transactions
- [x] Reactive templates
- [ ] Memo signals
- [ ] Signal children should be invalidated in reverse order
- [ ] Fragments
- [ ] Property signals
- [x] Preserve child order when re-rendering
- [ ] Control flow components (if, for, switch)

## Spec

- Parent: Owns the entity. When the parent is destroyed, child entities should be destroyed as well.
- Child: An entity that is owned by a parent. Children can invalidate parents.

### Signal:
- Parent: false
- Children: true

### Computed
- Parent: Entity that creates the computed signal
- Children: Entities created curring callback

- Callback: Children + invalidator
- Caller: Invalidates

Invalidated by callback, invalidates callers

### Effect
- Parent: Entity that creates the effect
- Children: Entities created during callback

### Cleanup
- Parent: Entity that creates the cleanup
- Children: No children
