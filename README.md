# Djinni Candidates Scraper

> ⚡️ Tired of manually copying candidate information from Djinni? Spending hours clicking through pages and copying data into spreadsheets? Our scraper automates the entire process, extracting all candidate details in seconds and delivering them in a ready-to-use CSV format.

A browser-based scraper for extracting candidate information from Djinni (a job platform). This script runs directly in the browser and allows you to collect candidate data from multiple pages.

## Features

- Extracts detailed candidate information including:
  - Position
  - Salary
  - Location (Country and City)
  - Experience
  - English Level
  - Description
  - Skills
  - Profile URL
  - Views
  - Timestamp
- Automatically handles pagination
- Stores data in browser's localStorage
- Exports collected data to CSV format
- Automatically downloads the CSV file

## How to Use

1. Install the Tampermonkey browser extension:
   - [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
   - [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
   - [Safari Extension](https://apps.apple.com/app/tampermonkey/id1482490089)

2. Install the script:
   - Go to [Candidates Scraper Gist](https://gist.github.com/INVISIBLE5130/e7943a8295d6ad7074c65d8a399b6538)
   - Click the "Raw" button to view the raw script
   - Copy the entire script content
   - Open Tampermonkey and click "Create a new script"
   - Paste the copied content into the editor
   - Save the script (Ctrl+S or Cmd+S)

3. Navigate to the Djinni candidates page
4. The script will automatically run and:
   - Start scraping the current page
   - Navigate through all available pages
   - Collect candidate information
   - Generate and download a CSV file with all the data

## Output Format

The script generates a CSV file with the following columns:
- Position
- Salary
- Country
- City
- Experience
- English Level
- Description
- Skills
- Profile URL
- Views
- Timestamp

## Notes

- The script includes a delay between page navigations to ensure proper loading
- Data is temporarily stored in localStorage during the scraping process
- The CSV file is automatically downloaded when the scraping is complete
- The script handles various edge cases in the data extraction process 