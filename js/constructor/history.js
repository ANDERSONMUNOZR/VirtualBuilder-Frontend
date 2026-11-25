// Deshacer / rehacer.
// Escucha los cambios del mundo y guarda cada diff. Deshacer = aplicar el diff al revés.

export class History extends EventTarget {
  constructor(world, limit = 200) {
    super();
    this.world = world;
    this.limit = limit;
    this.undoStack = [];
    this.redoStack = [];

    world.addEventListener('change', (event) => {
      const { diff, recordable } = event.detail;
      if (!recordable) return;
      this.undoStack.push(diff);
      if (this.undoStack.length > this.limit) this.undoStack.shift();
      this.redoStack.length = 0; // una acción nueva invalida lo que se podía rehacer
      this.notify();
    });
  }

  get canUndo() {
    return this.undoStack.length > 0;
  }

  get canRedo() {
    return this.redoStack.length > 0;
  }

  undo() {
    const diff = this.undoStack.pop();
    if (!diff) return false;
    const changes = [...diff].reverse().map(({ x, y, z, before }) => ({ x, y, z, block: before }));
    this.world.apply(changes, { source: 'undo', recordable: false });
    this.redoStack.push(diff);
    this.notify();
    return true;
  }

  redo() {
    const diff = this.redoStack.pop();
    if (!diff) return false;
    const changes = diff.map(({ x, y, z, after }) => ({ x, y, z, block: after }));
    this.world.apply(changes, { source: 'redo', recordable: false });
    this.undoStack.push(diff);
    this.notify();
    return true;
  }

  reset() {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.notify();
  }

  notify() {
    this.dispatchEvent(new Event('change'));
  }
}
