class HtmlElementCreator {
    constructor(){}

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
        var div = document.createElement("div");

        const label = document.createElement("label");
        label.innerText = labelmessage;
        label.for = id;
        div.appendChild(label);

        const textarea = document.createElement("textarea");
        textarea.id = id;
        textarea.setAttribute("rows", rows);
        textarea.disabled = disabled;
        div.appendChild(textarea);

        return div;
    }
}
