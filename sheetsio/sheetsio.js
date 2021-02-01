/** Setup Google Sheet preview window. */
let sheetUrlButton = document.getElementById("sheetUrlButton");
let sheetUrlInput = document.getElementById("sheetUrlInput");
let gSheetPreviewFrame = document.getElementById("gsheet");
sheetUrlButton.onclick = function sheetUrlClick() {
    let givenUrlVal = sheetUrlInput.value;
    if (isGSheetUrl(givenUrlVal)) {
        gSheetPreviewFrame.src = givenUrlVal;
    } else {
        alert("Please give a valid google sheet URL");
        sheetUrlInput.value = "";
    }
}

/** Very simple, very dumb checking as it doesn't really matter anyway. */
function isGSheetUrl(url) {
    return url ? url.startsWith("https://docs.google.com/spreadsheets/d/") : false;
}
