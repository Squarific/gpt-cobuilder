class SavedOutputs {
    constructor() {
        this.outputs = new Map();
    }

    save(name, content) {
        this.outputs[name] = content;
    }

    get (name) {
        return this.outputs[name];
    }
}

savedOutputs = new SavedOutputs();