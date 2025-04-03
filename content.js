chrome.runtime.onMessage.addListener((message, sender, sendResponse) => { 
    if (message.type === "showPopup") {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        fetch(chrome.runtime.getURL('popup.html'))
        .then(response => response.text())
        .then(html => {
            const div = document.createElement('div');
            div.innerHTML = html;
            const popup = div.querySelector('#popup');
            const rect = selection.getRangeAt(0).getBoundingClientRect();
            popup.style.top = `${rect.top + window.scrollY}px`;
            popup.style.left = `${rect.right + window.scrollX + 10}px`;
            popup.querySelector('#closePopup').onclick = () => {
                closePopup(popup)
            };

            popup.querySelector('#addToAnki').onclick = () => { 
                addToAnki(message.originalText, message.translatedText)
            };
            const originalText = popup.querySelector('#originalText');
            originalText.textContent = message.originalText;
            const translatedText = popup.querySelector('#translatedText');
            translatedText.textContent = message.translatedText;
            document.body.appendChild(popup);
        });
    sendResponse({farewell: "popup added"});
    }
});

function closePopup(popup) {
    document.body.removeChild(popup);
}

function addToAnki(originalText, translatedText) {
        chrome.runtime.sendMessage({    
        type: "addToAnki",
        originalText: originalText, translatedText: translatedText
    }, response => {
        console.log("Ответ от Anki:", response);
    });
}

