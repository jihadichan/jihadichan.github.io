
Copy transcript:

```
function copyToClipboard(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    console.log("Text copied to clipboard!");
}

// Function to remove all style attributes and apply custom styles
function processStyles(element) {
    // Remove existing style attributes
    if (element.hasAttribute("style")) {
        element.removeAttribute("style");
    }
    
    // Apply display:none to elements with class 't1' or 't2'
    if (element.classList.contains('t1') || element.classList.contains('t2')) {
        element.setAttribute("style", "display:none");
    }
    
    // Process all child elements recursively
    Array.from(element.children).forEach(child => processStyles(child));
}

// Function to scrape the content of <div class="desc">, process styles, and copy outerHTML
function scrapeAndCopy() {
    const descDiv = document.querySelector("div.desc");
    if (descDiv) {
        // Process styles in the <div class="desc"> and its children
        processStyles(descDiv);

        // Copy the outerHTML to the clipboard
        const content = descDiv.outerHTML;
        copyToClipboard(content);
    } else {
        console.log("No <div class='desc'> element found on this page.");
    }
}

// Execute the scraping, style processing, and copying
scrapeAndCopy();
```
