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

export function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};