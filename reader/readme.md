{:toc}



# Scraper



## Copy IDs

Run in console, on every page.

```javascript
// Get all elements with the class "item"
const items = document.querySelectorAll('.item');

// Initialize an array to store the extracted objects
const results = [];

// Iterate over each item
items.forEach(item => {
    // Extract text from `.story_title_en`
    const titleEn = item.querySelector('.story_title_en')?.innerText.trim();

    // Extract the `fc_id` attribute value from `.org`
    const fcId = item.querySelector('.org')?.getAttribute('fc_id');

    // Push the result into the results array
    if (titleEn && fcId) {
        results.push({ title: titleEn, fc_id: fcId });
    }
});

// Convert the results to JSON
const jsonOutput = JSON.stringify(results, null, 2);

// Create a temporary textarea element
const textarea = document.createElement('textarea');
textarea.value = jsonOutput;
document.body.appendChild(textarea);

// Programmatically select the textarea content
textarea.select();
textarea.setSelectionRange(0, 99999); // For mobile compatibility

// Copy the selected content to the clipboard
document.execCommand('copy');

// Remove the textarea element
document.body.removeChild(textarea);

// Notify the user via the console
console.log('Copied to clipboard:', jsonOutput);
console.log(results);
```

Result needs to look like this:

```json
[
  {
    "title": "Magic Marker 1: Meet the Characters",
    "fc_id": "C0000752"
  },
  {
    "title": "Magic Marker 2: Maxie and Taco",
    "fc_id": "C0000758"
  },
// ...
```



## Run the scraper

- After getting the IDs, you also need a valid cookie when logged in. 
- In Dev Tools, copy the fetch request (for Node.js) for getting the translations.
- Put the IDs and the `headers` from the request into `scrape.mjs`
- Run the script via `node scrape.mjs`





# Old copy transcript

```javascript
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
