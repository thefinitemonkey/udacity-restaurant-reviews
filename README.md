# Stage Two of Restaurant Reviews (Doug Brown)
---
## Overview

This code covers Stage 2 of the Restaurant Reviews web application for the Mobile Web Specialist course from Udacity. It has the following features:

* A fully responsive layout
* Responsive images, both for sizing and art direction
* A restaurant listings page
* A restaurant info page
* Accessibility updates
* Service worker implementation to allow for viewing previously browsed pages while offline
* Offline application capabilities utilizing both the caches and IndexedDB
* Gulp build based on Yeoman scaffold
* Utilizes IDB for the IndexedDB
* All other rubric requirements

Icons credit to Flaticons

## How to view

This code is scaffolded with Yeoman and requires that [node.js ](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/get-npm) be installed. Please install these first. Additionally, this project depends on a separate project provided by Udacity to create an API end-point. This project is available on [git ](https://github.com/udacity/mws-restaurant-stage-2). Please follow the instructions there.

Once you have these dependencies installed and the API server is started, do the following:

1. In the terminal, navigate to this project folder.

2. run "npm install" (without the quotes) to install project dependencies.

3. run "gulp serve" (without the quotes).

4. With your server running, visit the site: `http://localhost:8000` and explore some restaurants.

5. In Chrome you can open the Console, go to Application / Service Workers, and then check the Offline option to see offline behavior.
