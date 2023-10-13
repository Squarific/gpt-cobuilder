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
        return this.outputs.get(name) || name;
    }
}

savedOutputs = new SavedOutputs();

// Adding event listener for output saves.
savedOutputs.addEventListener("change", ({ detail }) => {
    // get the container for the saved outputs
    const savedOutputsContainer = document.getElementById('saved-outputs-container');

    // create a new textarea and set the content to the saved output
    const newOutputArea = document.createElement('textarea');
    newOutputArea.value = detail.content;

    // prevent text from being edited 
    newOutputArea.disabled = true;

    // add the new output area to the saved outputs container.
    savedOutputsContainer.appendChild(newOutputArea);
});
