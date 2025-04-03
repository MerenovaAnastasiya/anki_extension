function showPopup(originalText, translatedText) {
    const popup = document.getElementById("popup");
    document.getElementById("originalText").innerText = originalText;
    document.getElementById("translatedText").innerText = translatedText;
    popup.style.display = "block";
}

function closePopup() {
    const popup = document.getElementById("popup");
    popup.style.display = "none";
}