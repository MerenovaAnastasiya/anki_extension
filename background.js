chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "translate",
        title: "Перевести",
        contexts: ["selection"]
    });
});


chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "translate") {
        const text = info.selectionText;
        if (!text) return;    
        const translatedText = await translateText(text);
        console.info("Переведенный текст: ", translatedText)

        if (translatedText) {
            chrome.tabs.sendMessage(tab.id, { type: "showPopup", originalText: text, translatedText: translatedText}, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Message failed: ", chrome.runtime.lastError);
        } else {
            console.log("Message sent successfully");
        }
    });
        }
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "addToAnki") {
        addToAnki(message.originalText, message.translatedText)
    }
    sendResponse({farewell: "Car was added to anki"});
});


async function translateText(text) {
    const API_URL = "http://localhost:5000/translate";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                q: text,
                source: "en",
                target: "ru",
                format: "text"
            })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.translatedText;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}




async function addToAnki(original, translated) {
    const payload = {
        action: "addNote",
        version: 6,
        params: {
            note: {
                deckName: "Main",
                modelName: "Basic",
                fields: {
                    Front: original,
                    Back: translated
                },
                options: {
                    allowDuplicate: false
                }
            }
        }
    };

    try {
        const response = await fetch("http://127.0.0.1:8765", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.error) {
            console.error("Ошибка добавления в Anki:", result.error);
        } else {
            console.log("Карточка добавлена:", result);
        }
    } catch (error) {
        console.error("Ошибка запроса к AnkiConnect:", error);
    }
}
