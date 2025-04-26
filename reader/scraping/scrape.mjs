import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

const ids = [
    {
        "title": "Magic Marker 1: Meet the Characters",
        "fc_id": "C0000752"
    },
    {
        "title": "Magic Marker 2: Maxie and Taco",
        "fc_id": "C0000758"
    },
    {
        "title": "Magic Marker 3: New Friends",
        "fc_id": "C0000762"
    },
    {
        "title": "Magic Marker 4: What Is This?",
        "fc_id": "C0000767"
    },
    {
        "title": "Magic Marker 5: Who Is That?",
        "fc_id": "C0000771"
    },
    {
        "title": "Magic Marker 6: I Like Fish",
        "fc_id": "C0000775"
    },
    {
        "title": "Magic Marker 7: Let's Play Soccer!",
        "fc_id": "C0000779"
    },
    {
        "title": "Magic Marker 8: Where Is Maxie?",
        "fc_id": "C0000783"
    },
    {
        "title": "Magic Marker 9: Can You Fly?",
        "fc_id": "C0000787"
    },
    {
        "title": "Magic Marker 10: My Favorite Color Is Blue",
        "fc_id": "C0000791"
    },
    {
        "title": "Magic Marker 11: Watch This",
        "fc_id": "C0000797"
    },
    {
        "title": "Magic Marker 12: I Want to Go Home",
        "fc_id": "C0000799"
    },
    {
        "title": "Magic Marker 13: I'm Sorry",
        "fc_id": "C0000803"
    },
    {
        "title": "Magic Marker 14: Is It a Magic Marker?",
        "fc_id": "C0000807"
    },
    {
        "title": "Magic Marker 15: I'm an Artist!",
        "fc_id": "C0000810"
    },
    {
        "title": "Magic Marker 16: I Can Skateboard",
        "fc_id": "C0000815"
    },
    {
        "title": "Magic Marker 17: She Is Tall and Old",
        "fc_id": "C0000819"
    },
    {
        "title": "Magic Marker 18: How Many Pets?",
        "fc_id": "C0000823"
    },
    {
        "title": "Magic Marker 19: Where's the Doll?",
        "fc_id": "C0000825"
    },
    {
        "title": "Magic Marker 20: What Are These?",
        "fc_id": "C0000829"
    },
    {
        "title": "Magic Marker 21: What Do You Have?",
        "fc_id": "C0000834"
    },
    {
        "title": "Magic Marker 22: What Time Is It?",
        "fc_id": "C0000842"
    },
    {
        "title": "Magic Marker 23: We're Having a Party",
        "fc_id": "C0000844"
    },
    {
        "title": "Magic Marker 24: Party Time",
        "fc_id": "C0000847"
    },
    {
        "title": "Magic Marker 25: Juice or Soda?",
        "fc_id": "C0000852"
    },
    {
        "title": "Magic Marker 26: This Is Mine",
        "fc_id": "C0000856"
    },
    {
        "title": "Magic Marker 27: Who's She?",
        "fc_id": "C0000863"
    },
    {
        "title": "Magic Marker 28: What Day Is It Today?",
        "fc_id": "C0000868"
    },
    {
        "title": "Magic Marker 29: What Do You Do on Tuesdays?",
        "fc_id": "C0000873"
    },
    {
        "title": "Magic Marker 30: Do You Have a Jacket?",
        "fc_id": "C0000878"
    },
    {
        "title": "Magic Marker 31: Does She Have Any Popcorn?",
        "fc_id": "C0000885"
    },
    {
        "title": "Magic Marker 32: It Has Eight Long Legs",
        "fc_id": "C0000891"
    },
    {
        "title": "Magic Marker 33: Get Up, Taco!",
        "fc_id": "C0000895"
    },
    {
        "title": "Magic Marker 34: Where Are You From?",
        "fc_id": "C0000898"
    },
    {
        "title": "Magic Marker 35: Sue Is in the Bedroom",
        "fc_id": "C0000902"
    },
    {
        "title": "Magic Marker 36: There Are Two Lamps in the Living Room",
        "fc_id": "C0000907"
    },
    {
        "title": "Magic Marker 37: Grandmother Goes Home!",
        "fc_id": "C0000915"
    },
    {
        "title": "Magic Marker 38: Whose Book Is This?",
        "fc_id": "C0000920"
    },
    {
        "title": "Magic Marker 39: What's Your Favorite Subject?",
        "fc_id": "C0000930"
    },
    {
        "title": "Magic Marker 40: Where Is the School?",
        "fc_id": "C0000937"
    },
    {
        "title": "Magic Marker 41: In the News",
        "fc_id": "C0000941"
    },
    {
        "title": "Magic Marker 42: I Sometimes Go Swimming",
        "fc_id": "C0000945"
    },
    {
        "title": "Magic Marker 43: When Do You Eat Lunch?",
        "fc_id": "C0000949"
    },
    {
        "title": "Magic Marker 44: I'm Taking a Bus",
        "fc_id": "C0000953"
    },
    {
        "title": "Magic Marker 45: Where Were You Yesterday?",
        "fc_id": "C0000958"
    },
    {
        "title": "Magic Marker 46: What Did You Do Yesterday?",
        "fc_id": "C0000963"
    },
    {
        "title": "Magic Marker 47: We Ate Noodles",
        "fc_id": "C0000967"
    },
    {
        "title": "Magic Marker 48: There Is No Magic Marker",
        "fc_id": "C0000975"
    },
    {
        "title": "Magic Marker 49: The New Neighbor",
        "fc_id": "C0000994"
    },
    {
        "title": "Magic Marker 50: We Need the Magic Marker Again",
        "fc_id": "C0000999"
    },
    {
        "title": "Magic Marker 51: Follow That Truck!",
        "fc_id": "C0001003"
    },
    {
        "title": "Magic Marker 52: That tickles a lot!",
        "fc_id": "C0001008"
    },
    {
        "title": "Magic Marker 53: At the Airport",
        "fc_id": "C0001015"
    },
    {
        "title": "Magic Marker 54: Welcome to China",
        "fc_id": "C0001018"
    },
    {
        "title": "Magic Marker 55: Arriving in China",
        "fc_id": "C0001023"
    },
    {
        "title": "Magic Marker 56: Making New Friends",
        "fc_id": "C0001028"
    },
    {
        "title": "Magic Marker 57: The Great Wall of China",
        "fc_id": "C0001032"
    },
    {
        "title": "Magic Marker 58: The Dragon Dance",
        "fc_id": "C0001038"
    },
    {
        "title": "Magic Marker 59: Say Good-bye",
        "fc_id": "C0001049"
    },
    {
        "title": "Magic Marker 60: Sneaking Aboard",
        "fc_id": "C0001057"
    },
    {
        "title": "Magic Marker 61: Underwater Adventures",
        "fc_id": "C0001062"
    },
    {
        "title": "Magic Marker 62: The Storm",
        "fc_id": "C0001070"
    },
    {
        "title": "Magic Marker 63: Lulu the Panda Bear",
        "fc_id": "C0001081"
    },
    {
        "title": "Magic Marker 64: See Land!",
        "fc_id": "C0001098"
    },
    {
        "title": "Magic Marker 65: Where Are We?",
        "fc_id": "C0001103"
    },
    {
        "title": "Magic Marker 66: Fancy Meeting You Here",
        "fc_id": "C0001110"
    },
    {
        "title": "Magic Marker 67: Going by Train",
        "fc_id": "C0001116"
    },
    {
        "title": "Magic Marker 68: The Guest",
        "fc_id": "C0001120"
    },
    {
        "title": "Magic Marker 69: Meeting at the Train Station",
        "fc_id": "C0001130"
    },
    {
        "title": "Magic Marker 70: Where Should We Go?",
        "fc_id": "C0001134"
    },
    {
        "title": "Magic Marker 71: Under the Tree",
        "fc_id": "C0001140"
    },
    {
        "title": "Magic Marker 72: The Truth About the Magic Marker",
        "fc_id": "C0001148"
    },
    {
        "title": "Magic Marker 73: Home Sweet Home",
        "fc_id": "C0001159"
    }
];

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
            headers: {
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
                "cookie": "cxu=1; sv_login=on; cxs=COu5%2BK9IuUcyX7%2BegK4OrR8W3VHbhD3QBQ27QEtEsOeVIU6ZAYuFPmwdQUGNnFFYhzP1rfHHgah3fijkTqdLIoNkaST6E%2BT1lxQKBeue4S7UoerxxsynoM18rEyNRoIq; cx4=zE8xWLc641nszb2D9P3JwRc0RNpAPND3i6FJP083XYNPMLBnDj8SoDxY0bM0Vxw%2BGgWAB%2Fu8TKC8kqjwNAgW5w%3D%3D; cx1=dxIwt6%2Fc213VWzjd7FnyutwpNAaU1wst1r2FyYZZhpHWBcp7DxusPdHlkosfCtLMPCGWI7lYHwcYKybuRexDjg%3D%3D; cx5=UA; cx6=WOHOabdsCbjc1eYhJx6VHADkCGw30ZoYF3Brke9Gc9bAGAYEd3xr2D44%2FoiqV956EPSCidWAg3SF9z6554VTLg%3D%3D; cx0=QuikQXCmWFB0igJE6Co47pTSlh4MJaTcAUZxzQ0a7JiyVEIdDkTgFoDn%2B8uZH38wvitxrgSo7YHOrNDbgzVaew%3D%3D; cx2=htbKmPvHL4iMRUW579vntCjfObRyU9Egw0yRMuF2PZuorrEFE94CutsQJHcfPCufmy78vtIlyu1ok%2BiMZz0TuA%3D%3D; cx7=89fbP%2FmNeUeXU%2Bh4fA0oc894ykBKV0wHDg5F9up0KyQuIA%2B4dg0znfJrGVHIJn9cdDuffNOQL9rpvjR5KYW3WA%3D%3D; cx8=3JfujowznfGEgqPzUR0HsBiLoVn3rr44FJyFzSuxA%2FknQph596loGIztBut%2FURz2hYT3Y20SCl8Ny%2Bc4JKUWLg%3D%3D; logged=EUSeWFN5hWvFH7AisOgLcBWElxJXVE%2FVhYDK6yVLi1%2BI4tOTWuWVBmqOC6U%2BJZwKQvc%2F5UCMoceNVysnG7Xqaw%3D%3D; trophy_cnt_U202404240545526102=EN1Tl5sAV%2BvSCjMaTgCnqRBXl01LSjKZj75xA%2F586%2F%2FvDRE4B4zqwSUQk7lcEwzqwMePwvZDrMNPZgq%2BY3T%2Bug%3D%3D; ci_session=e2ef3e6bcbc7caa42f994d16be79d71a40bb0faa",
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
