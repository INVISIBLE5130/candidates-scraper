// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      2025-04-05
// @description  try to take over the world!
// @author       You
// @match        https://djinni.co/developers/?title=JavaScript&exp_from=2&exp_to=3&english=intermediate&employment=remote&from_page=salaries&english_level=upper&region=UKR&location=vinnytsia
// @icon         https://www.google.com/s2/favicons?sz=64&domain=djinni.co
// @grant        none
// ==/UserScript==

// Function to extract candidate information from a single card
async function extractCandidateInfo(card) {
    const getText = (selector) => {
        if (selector === '.text-card') {
            const showMoreBtn = card.querySelector('.js-show-more-btn');
            if (showMoreBtn) {
                showMoreBtn.click();
            }
        }
        const element = card.querySelector(selector);
        return element ? element.textContent.trim() : '';
    };

    const getSkills = async () => {
        const skillElements = card.querySelectorAll('.badge.border');
        const skillElementsMoreButton = card.querySelector('.badge.border.js-analytics-event');
        if (skillElementsMoreButton) {
            await skillElementsMoreButton.click();
        }
        const skills = Array.from(skillElements).map(el => el.textContent.trim());
        console.log('Skills:', skills.join(', '));
        return skills.join(', ');
    };

    // Helper function to clean up description text
    const cleanDescription = (text) => {
        return text
            .replace(/\n/g, ' ') // Replace newlines with spaces
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .trim();
    };

    // Get all spans in the location/experience section
    const infoSpans = Array.from(card.querySelectorAll('p.text-secondary span'))
        .filter(span => {
            const text = span.textContent.trim();
            return !text.includes('Опубліковано') &&
                   !text.includes('У пасивному пошуку') &&
                   !span.classList.contains('mx-1');
        });

    // Find city and experience by their content patterns
    let city = '';
    let experience = '';
    let englishLevel = '';

    for (let i = 0; i < infoSpans.length; i++) {
        const text = infoSpans[i].textContent.trim();

        // Check for city (it should be after a dot separator and not match any other patterns)
        if (
            i === 2 &&
            !text.match(/^(\d+|\d+\.\d+)\s+(рік|роки|років)\s+досвіду$/i) &&
            !text.match(/^(Advanced\/Fluent|Upper-Intermediate|Intermediate|Pre-Intermediate|Beginner)$/i) &&
            !text.match(/^(Опубліковано|У пасивному пошуку)$/i) &&
            !text.match(/\d/)
        ) {
            city = text;
        }

        // Check for experience pattern
        // Match text that contains a number (including decimals) followed by Ukrainian words for "year(s) of experience"
        // рік = year (singular)
        // роки = years (2-4 years)
        // років = years (5+ years or decimal numbers)
        if (text.match(/^(\d+|\d+\.\d+)\s+(рік|роки|років)\s+досвіду$/i)) {
            experience = text;
        }
        // Check for English level
        else if (text.match(/^(Advanced\/Fluent|Upper-Intermediate|Intermediate|Pre-Intermediate|Beginner)$/i)) {
            englishLevel = text;
        }
    }

    // Get skills
    const skills = await getSkills();

    return {
        position: getText('h2 a.profile'),
        salary: getText('.text-success'),
        country: getText('p.text-secondary span:first-child'),
        city: city,
        experience: experience,
        englishLevel: englishLevel,
        description: cleanDescription(getText('.text-card')),
        skills: skills,
        profileUrl: card.querySelector('h2 a.profile')?.href || '',
        views: getText('.bi-eye + span'),
        timestamp: new Date().toISOString()
    };
}

// Function to scrape all candidates on the current page
async function scrapeCurrentPage() {
    const cards = document.querySelectorAll('.card.mb-4');
    const candidates = [];

    for (const card of cards) {
        const candidate = await extractCandidateInfo(card);
        candidates.push(candidate);
    }

    return candidates;
}

// Function to create and download CSV
function downloadCSV(candidates) {
    // Escape CSV values
    const escapeCSV = (value) => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        // If the value contains commas, newlines, or quotes, wrap it in quotes and escape existing quotes
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    const headers = [
        'Position', 'Salary', 'Country', 'City', 'Experience',
        'English Level', 'Description', 'Skills', 'Profile URL',
        'Views', 'Timestamp'
    ];

    // Create header row
    const headerRow = headers.map(escapeCSV).join(',');

    console.log(candidates);


    // Create data rows
    const dataRows = candidates.map(candidate => [
        candidate.position,
        candidate.salary,
        candidate.country,
        candidate.city,
        candidate.experience,
        candidate.englishLevel,
        candidate.description,
        candidate.skills,
        candidate.profileUrl,
        candidate.views,
        candidate.timestamp
    ].map(escapeCSV).join(','));

    // Combine header and data rows
    const csvContent = [headerRow, ...dataRows].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `candidates_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Main function to scrape all pages
async function scrapeAllPages() {
    let currentPage = 1;
    const storageKey = 'djinni_candidates';

    console.log('Starting to scrape candidates...');

    while (true) {
        console.log(`Scraping page ${currentPage}...`);

        // Scrape current page
        const pageCandidates = await scrapeCurrentPage();

        // Get existing candidates from localStorage
        const existingCandidates = JSON.parse(localStorage.getItem(storageKey) || '[]');

        // Add new candidates and save back to localStorage
        const updatedCandidates = [...existingCandidates, ...pageCandidates];
        localStorage.setItem(storageKey, JSON.stringify(updatedCandidates));

        console.log(`Found ${pageCandidates.length} candidates on page ${currentPage}`);
        console.log(`Total candidates so far: ${updatedCandidates.length}`);

        // Try to go to next page
        const hasNextPage = await goToNextPage();
        if (!hasNextPage) {
            console.log('No more pages to scrape');
            break;
        }
        currentPage++;
    }

    // Get all candidates from localStorage and download CSV
    const allCandidates = JSON.parse(localStorage.getItem(storageKey) || '[]');
    console.log('Scraping completed!');
    console.log(`Total candidates found: ${allCandidates.length}`);

    // Create and download CSV
    downloadCSV(allCandidates);
    console.log('CSV file has been downloaded!');

    // Clear localStorage after downloading
    localStorage.removeItem(storageKey);

    return allCandidates;
}

// Function to navigate to the next page
async function goToNextPage() {
    // Look for the next page link with the chevron-right icon
    const nextButton = document.querySelector('a.page-link:has(.bi-chevron-right)');
    if (nextButton && nextButton.getAttribute('aria-disabled') !== 'True') {
        nextButton.click();
        // Wait for the page to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        return true;
    }
    return false;
}

// Run the scraper
scrapeAllPages().then(candidates => {
    console.log('Scraping process completed!');
}).catch(error => {
    console.error('Error during scraping:', error);
});