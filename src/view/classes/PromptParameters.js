class PromptParameters {
    constructor(fileList, inputs) {
        this.fileList = fileList;
        this.inputs = inputs;
    }

    async parsePrompt(prompt) {
        prompt = prompt.replaceAll("{ USER_CHANGE_REQUEST }", document.getElementById("user-change-request").value || "Empty change request");
        prompt = prompt.replaceAll("{ PROJECT_DESCRIPTION }", document.getElementById("project-description").value || "No project description");
        prompt = prompt.replaceAll("{ GIT_DIFF }", await window.gitCommands.gitDiff(localStorage.getItem("folder")));

        
        if (this.fileList) {
            prompt = prompt.replaceAll("{ SELECTED_FILES }", this.fileContentMapToText(this.fileList.fileContentMap) || "No files selected");
        }

        if (this.inputs) {
            for (var key in this.inputs) {
                prompt = prompt.replaceAll("{ " + key + " }", this.inputs[key]);
            }
        }

        return prompt;
    }

    fileContentMapToText(fileContentMap) {
        let files = [];

        fileContentMap.forEach((value, key, map) => {
            var file = key.path + "\n";
            file += FILE_DELIMETER + "\n";
            file += value + "\n";
            file += FILE_DELIMETER;
            files.push(file);
        });

        return files.join("\n\n") || "No files selected.";
    }
}
