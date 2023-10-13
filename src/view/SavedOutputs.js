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

    // Check if textarea already exists for the given output name
    let outputArea = document.getElementById('output-' + detail.name);

    // If textarea doesn't exist, create new textarea and associated label
    if (!outputArea) {
        // create a new label and set the content to the output name
        let outputLabel = document.createElement('div');
        outputLabel.innerHTML = detail.name;

        // create a new textarea 
        outputArea = document.createElement('textarea');

        // Assign unique id to the textarea using output name
        outputArea.id = 'output-' + detail.name;

        // prevent text from being edited 
        outputArea.disabled = true;

        // add the new label and textarea to the saved outputs container.
        savedOutputsContainer.appendChild(outputLabel);
        savedOutputsContainer.appendChild(outputArea);
    }

    // Whether textarea was existent or newly created, set/update its value
 outputArea.value = detail.content;
});
