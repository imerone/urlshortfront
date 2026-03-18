# URL Shortener — Frontend

This is the frontend for my URL Shortener project.
Built with plain HTML, CSS and vanilla JavaScript — no frameworks.
The design is space themed with a Mercury planet and animated stars in the background.

## What it looks like

The main page has a big input field where you paste your long URL and press WARP.
It connects to the Go backend and returns a short link you can copy with one click.

![Home](https://github.com/user-attachments/assets/3205d724-62b2-40e8-906e-f3c1904e5b62)

You can also type your own custom slug instead of getting a random one.
For example type "mylink" and you get localhost:8080/mylink.

![Custom slug](https://github.com/user-attachments/assets/452a29ab-0cd4-4b0d-9e71-9811c3b9cf1c)

All your shortened links are listed below the form with the original URL,
short link, how many times it was clicked, and a delete button on the right.

![Links](https://github.com/user-attachments/assets/146e3884-02c1-4d55-81d5-37ff35300659)

When you click delete it shows a confirmation popup so you don't delete by accident.
You can either abort or confirm the deletion.

![Delete](https://github.com/user-attachments/assets/d0d15233-00ba-493c-81f5-e301ce52b080)

## How to run
Make sure the backend is running on http://localhost:8080 first,
then just open index.html in your browser.

## Backend
https://github.com/imerone/urlshortbackend
