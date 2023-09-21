class SavedOutputs extends EventTarget {
    constructor() {
        super();
        this.outputs = new Map();
    }

    save(name, content) {
        const event = new CustomEvent("change", { detail: { name, content } });
        this.outputs.set(name, content);
        this.dispatchEvent(event);
    }

    get (name) {
        return this.outputs.get(name);
    }
}

savedOutputs = new SavedOutputs();