class HtmlElementCreator {
    createButton(className, innerText, onclickString = '') {
        const button = document.createElement("button");
        button.className = className;
        button.innerText = innerText;
        if(onclickString) {
            button.setAttribute("onclick", onclickString);
        }
        return button;
    }

    createDiv(className, innerText = '') {
        const div = document.createElement("div");
        div.className = className;
        div.innerText = innerText;
        return div;
    }

    createTextAreaWithLabel(labelmessage, id, disabled, rows) {
        const details = document.createElement("details");

        const summary = document.createElement("summary");
        summary.innerText = labelmessage;
        details.appendChild(summary);

        const textarea = document.createElement("textarea");
        textarea.id = id;
        textarea.setAttribute("rows", rows);
        textarea.disabled = disabled;
        details.appendChild(textarea);

        return details;
    }
}
