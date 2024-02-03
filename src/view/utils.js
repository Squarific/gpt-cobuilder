function elementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

function rowElementFromHTML(htmlString) {
    var table = document.createElement('table');
    table.innerHTML = htmlString.trim();
    return table.firstChild.firstChild;
}