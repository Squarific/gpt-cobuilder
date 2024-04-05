export function elementFromHTML(htmlString) {
    let div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

export function rowElementFromHTML(htmlString) {
    let table = document.createElement('table');
    table.innerHTML = htmlString.trim();
    return table.firstChild.firstChild;
}