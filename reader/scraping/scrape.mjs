import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

const ids = [
        {
            "title": "The Adventures of Pinocchio 1: Only a Piece of Wood",
            "fc_id": "C0000654"
        },
        {
            "title": "The Adventures of Pinocchio 2: A Big Name For a Small Boy",
            "fc_id": "C0000669"
        },
        {
            "title": "The Adventures of Pinocchio 3: Choices",
            "fc_id": "C0000689"
        },
        {
            "title": "The Adventures of Pinocchio 4: Good Manners",
            "fc_id": "C0000697"
        },
        {
            "title": "The Adventures of Pinocchio 5: Pinocchio Gets Schooled",
            "fc_id": "C0000718"
        },
        {
            "title": "The Adventures of Pinocchio 6: The Great Escape",
            "fc_id": "C0000732"
        },
        {
            "title": "The Adventures of Pinocchio 7: The Golden Lesson",
            "fc_id": "C0000746"
        },
        {
            "title": "The Adventures of Pinocchio 8: The Field of Follies",
            "fc_id": "C0000759"
        },
        {
            "title": "The Adventures of Pinocchio 9: Working Like a Dog",
            "fc_id": "C0000768"
        },
        {
            "title": "The Adventures of Pinocchio 10: Can You See the Sea?",
            "fc_id": "C0000776"
        },
        {
            "title": "The Adventures of Pinocchio 11: A Little Work Won't Hurt",
            "fc_id": "C0000784"
        },
        {
            "title": "The Adventures of Pinocchio 12: Escape to Paradisle",
            "fc_id": "C0000792"
        },
        {
            "title": "The Adventures of Pinocchio 13: A Real Donkey",
            "fc_id": "C0000800"
        },
        {
            "title": "The Adventures of Pinocchio 14: Circus Work",
            "fc_id": "C0000808"
        },
        {
            "title": "The Adventures of Pinocchio 15: Better to Give Than Receive",
            "fc_id": "C0000816"
        },
        {
            "title": "The Adventures of Pinocchio 16: The Belly of a Whale",
            "fc_id": "C0000826"
        }
    ]

;

// Function to recursively remove `style` attributes and apply custom styles
function processStyles(element) {
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

// Function to fetch and process a single fc_id
async function fetchAndProcess(fcId) {
    try {
        const response = await fetch(`https://chinese.littlefox.com/en/supplement/org/${fcId}`, {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "accept-language": "en-US,en;q=0.8",
                "sec-ch-ua": "\"Brave\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Linux\"",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-origin",
                "sec-fetch-user": "?1",
                "sec-gpc": "1",
                "upgrade-insecure-requests": "1",
                "cookie": "cxu=1; sv_login=on; cxs=kruLTTkwCwYxyME07lOMRu5NC%2FCsZcJ3m0VX6gOA4V7qQ7NQWGqFdhIDXSiRmrBlW0rJS8jiP7xeXvlsq9fLLpvJaBsm%2Ff4OQxWPNUbudtXA3yjQWqZ%2BSr6nd8HSXX8T; cx4=z%2F7lD5AwSKTp1GdnXfA%2FB68caIIQRnChY7xZhE1XLg7vw6gKOFrIH%2F%2FUNdGMkl%2Br2WRbULHll1aKZcarsKTG1A%3D%3D; cx1=gVjempQ8%2BQxUMxDrs2CmCRdUpofNGgmZgYaRSpuYmjHCnDMsH4F0ePauj1kaRa2TwAN%2BfjJp8gqVh9nitrdg6g%3D%3D; cx5=UA; cx6=2UuVtoiiylfFB%2FsqUpOOBJ6yIglpcXy3jAN855FzL8BtoAAYJm4bHogfT4vMnv6iVO%2FhBgF4o8ox467ZJex3IQ%3D%3D; cx0=kNikqzI06B0R8OUOI%2FlCMDZ5uZHmWjXUmRUWhFSZfTSFln8ygikugwRlOU%2FxeQr%2BeQvE3TNZYd%2Bliygqgdly6A%3D%3D; cx2=2H8qQ9VE%2F3qQDwn%2BioWTSFZryCbNaiJLOxzeyIw9joiUJPfTt97CWKDp3ihFcPKjosv%2FxAYKijxa4gbtcvntFA%3D%3D; cx7=aEDEyTmiPgMTBSbkaqfKg%2FTHLFUfrrDyifvP3lkN7zH0%2BafYTWCDOjab8uD8WZwMkhu%2FFUmD4w3sT4HJ0IOVXQ%3D%3D; cx8=c5%2BOAqGfUNPx83koKFC2moNPQiJlussjFxFnbmU8sCusjqFFLT%2Bgx1XTQGCppiTllLAD2Suoz%2Ba5bBF41FMrGg%3D%3D; logged=r5slOtIMZIT%2Fe721rPCkx%2FhE6BqhneC5%2B0CjotJ7XO4LUllNlpQTfIVtQ0qZj9p%2BC7JU4ipieUxzPf2In64y%2BQ%3D%3D; trophy_cnt_U202404240545526102=JF3enL1ur4wCRg4egxq5gDTT0QPxZvgZwUQxF72hnaR34ufPO4VyN06a7UOa9koGtaUCetqO9U4hsJ4m2XnTAQ%3D%3D; ci_session=64318d7c66b29344812a440bcdc2fee8e5644c3f",
                "Referer": "https://chinese.littlefox.com/en/story/contents_list/DP000750?&page=4",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            method: "GET"
        });

        const text = await response.text();

        // Parse the HTML response using JSDOM
        const dom = new JSDOM(text);
        const document = dom.window.document;

        // Select the <div class="desc"> element
        const descDiv = document.querySelector("div.desc");
        if (!descDiv) {
            console.error(`No <div class="desc"> found for fc_id: ${fcId}`);
            return;
        }

        // Recursively process the styles in the selected element
        processStyles(descDiv);

        // Get the final modified HTML
        const processedHtml = descDiv.outerHTML;

        // Print the processed HTML to the console
        console.log(processedHtml);

    } catch (error) {
        console.error(`Error fetching data for fc_id: ${fcId}`, error);
    }
}

// Function to process an array of fc_ids
async function processFcIds(items) {
    for (const item of items) {

        console.log(`<!-- ========================================================= -->`);
        console.log(`<!-- ${item.fc_id}: ${item.title} -->`);
        console.log(`<!-- ========================================================= -->`);
        await fetchAndProcess(item.fc_id);
    }
}

// Start processing
await processFcIds(ids);
