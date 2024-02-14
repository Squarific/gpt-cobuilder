class PromptParameters {
    constructor(fileList, inputs) {
        this.fileList = fileList;
        this.inputs = inputs;
    }

    async parsePrompt(prompt) {
        prompt = prompt.replaceAll("{ PROJECT_DESCRIPTION }", document.getElementById("project-description").value || "No project description");
        
        if (this.fileList) {
            prompt = prompt.replaceAll("{ SELECTED_FILES }", this.fileContentMapToText(this.fileList.fileContentMap) || "No files selected");
        }

        if (this.inputs) {
            for (let key in this.inputs) {
                prompt = prompt.replaceAll(`{ ${key} }`, this.inputs[key]);
            }
        }

        return prompt;
    }

    fileContentMapToText(fileContentMap) {
        let files = [];

        fileContentMap.forEach((value, key, map) => {
            let file = key.path + "\n";
            file += FILE_DELIMETER + "\n";
            file += value + "\n";
            file += FILE_DELIMETER;
            files.push(file);
        });

        return files.join("\n\n") || "No files selected.";
    }
}
