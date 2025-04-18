document.querySelectorAll('.t0').forEach(mandarinDiv => {
    mandarinDiv.addEventListener('click', function() {
        // Find the parent element
        const parentDiv = this.parentElement;

        // Find the pinyin (t1) and english (t2) elements within this parent
        const pinyinDiv = parentDiv.querySelector('.t1');
        const englishDiv = parentDiv.querySelector('.t2');

        // Check current visibility status
        const isHidden = getComputedStyle(pinyinDiv).display === 'none';

        // Toggle visibility of the pinyin and english elements
        if (pinyinDiv) {
            pinyinDiv.style.display = isHidden ? 'block' : 'none';
        }

        if (englishDiv) {
            englishDiv.style.display = isHidden ? 'block' : 'none';
        }
    });
});


document.addEventListener('DOMContentLoaded', function() {
    const t0Divs = document.querySelectorAll('.t0');
    console.log('t0Divs:', t0Divs);
    t0Divs.forEach(div => {
        const sentences = div.textContent.trim().split('\n');
        div.innerHTML = ''; // Clear the original content

        sentences.forEach(sentence => {
            const sentenceDiv = document.createElement('div');
            sentenceDiv.className = 'sentence-container';

            const playButton = document.createElement('button');
            playButton.textContent = '▷️';
            playButton.className = 'play-button';
            playButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent the click event from bubbling up
                playSentence(sentence.trim());
            });

            const sentenceSpan = document.createElement('span');
            sentenceSpan.textContent = sentence.trim();

            sentenceDiv.appendChild(playButton);
            sentenceDiv.appendChild(sentenceSpan);
            div.appendChild(sentenceDiv);
        });
    });
});

async function playSentence(sentence) {
    try {
        const apiUrl = `https://ssk8s.de/get?word=${encodeURIComponent(sentence)}`;
        const response = await fetch(apiUrl, {
            method: 'GET',
            mode: 'no-cors',
            cache: 'no-cache',
            credentials: 'omit',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36'
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer'
        });

        // Note: With 'no-cors' mode, we can't access the response content
        // So we'll assume the request was successful and construct the audio URL
        const audioUrl = `https://ssk8s.de/mp3/${getCurrentDate()}/${encodeURIComponent(sentence)}.mp3`;
        const audio = new Audio(audioUrl);
        audio.playbackRate = 0.8;
        audio.play();
    } catch (error) {
        console.error('Error fetching or playing audio:', error);
    }
}

function getCurrentDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}


function addCounterToDescDivs() {
    // Select all <div> elements with the class 'desc'
    const descDivs = document.querySelectorAll('.desc');

    // Iterate over each <div> and add a counter as the first child
    descDivs.forEach((div, index) => {
        // Create a new <div> element to hold the counter
        const counterDiv = document.createElement('div');
        counterDiv.className = 'counter';
        counterDiv.textContent = index + 1; // Set the counter text

        // Insert the counter as the first child of the current <div>
        div.prepend(counterDiv);
    });
}

// Function to copy text to clipboard
function copyToClipboard(text) {
    const tempTextarea = document.createElement("textarea");
    tempTextarea.style.position = "absolute";
    tempTextarea.style.left = "-9999px";
    tempTextarea.value = text;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    document.execCommand("copy");
    document.body.removeChild(tempTextarea);
}



// Function to normalize whitespace in text
function normalizeTextFromHTML(html) {
    console.log('html:', html);
    return html
        .replace(/<br\s*\/?>/gi, '\n') // Replace <br> tags with newlines
        .replace(/<\/div>/gi, '\n') // Replace <div> tags with newlines
        .replace(/\u00A0/g, ' ')       // Replace non-breaking spaces with regular spaces
        .replace(/[“”▷️]/g, '')        // Remove specific unwanted special characters
        .replace(/<\/?[^>]+>/g, '')    // Remove any remaining HTML tags
        .replace(/&nbsp;/g, ' ')      // Remove HTML spaces
        .trim();                       // Trim leading and trailing whitespace
}



// Add a copy button to each `desc` element
function addCopyButtonToDescElements() {
    document.querySelectorAll(".desc").forEach(descElement => {
        // Create the copy button
        const button = document.createElement("button");
        button.classList.add("copy-btn");
        button.textContent = "Copy";

        button.addEventListener("click", () => {
            let allText = '';

            // Collect and process all .t0 divs inside the current desc element
            descElement.querySelectorAll(".t0").forEach(t0Element => {
                let htmlContent = t0Element.innerHTML; // Get HTML content of .t0
                let normalizedText = normalizeTextFromHTML(htmlContent); // Normalize it
                allText += normalizedText + '\n\n'; // Add a newline after each div
            });

            // Copy the collected and processed text to clipboard
            copyToClipboard(allText.trim());
        });

        // Prepend the button to the `desc` element
        descElement.insertBefore(button, descElement.firstChild);
    });
}

// Call the function to add counters to all .desc divs
addCounterToDescDivs();
addCopyButtonToDescElements()
