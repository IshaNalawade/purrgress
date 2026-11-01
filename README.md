# Purrgress, gym but cuter

A mobile first gym tracker built for one hand and a phone. No build step,
no account, no server. Your data lives in your phone browser.

## What it does

- A weekly plan with three sessions: Legs, Arms and Back, Full Body.
- One tap workout logging with big steppers for weight and reps.
- Smart weight suggestions. Finish all your sets at target reps and the
  app nudges the weight up next time. Struggle and it holds steady.
- A rest timer between sets and a session timer for the whole workout.
- Body weight tracking with a simple trend view.
- History of every session, including duration and total volume.
- An irregular friendly week view. Miss a day and the plan just moves on,
  no streak shaming.

## Your setup, preloaded

Leg press 40 lbs seat 9, leg extension 30 lbs seat 8 outer circle 1,
leg curl 20 lbs inner circle 1, dumbbells 10 lbs in each hand,
lat pulldown and seated row 25 to 40 lbs. Cool down on the Precor
stretching machine after leg day.

## Use it on your phone

Option 1, GitHub Pages: push this repo to GitHub, turn on Pages for the
main branch, open the Pages link on your iPhone, then Share, Add to Home
Screen. It opens like an app.

Option 2, local: open `index.html` in any browser. Everything works
except the Home Screen install polish.

## Tech

Vanilla HTML, CSS, and JavaScript. State is stored in `localStorage`
under the key `purrgress-v1`, so there is nothing to install and
nothing to sync. Edit `PLAN` in `app.js` to change sessions, exercises,
or starting weights.

## Ideas for later

- Editable plan days and custom exercises.
- Charts for body weight and top lifts.
- Export history as CSV.
- A cat that levels up as you train. Obviously.
