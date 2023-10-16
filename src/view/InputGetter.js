class InputGetter {
    constructor(agentData) {
        this.data = agentData;
    }

    getInput(input) {
        if (input == "USER_CHANGE_REQUEST") {
            return document.getElementById("user-change-request").value || "Empty change request";
        } else if (input == "PROJECT_DESCRIPTION") {
            return document.getElementById("project-description").value || "No project description";
        } else if (input == "FILE_LIST") {
            return this.fileContentMapToText(this.data.fileList.fileContentMap);
        } else if (input.startsWith("OUTPUT.")) {
            return savedOutputs.get(input);
        }

        console.error("Unknown input", input);
        return "Unknown input " + input;
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
