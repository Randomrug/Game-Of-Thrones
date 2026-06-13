# 🏰 Game of Thrones Character Ranker

## the app is live guysss.... https://game-of-thrones-ranker.netlify.app/ 

An interactive Game of Thrones ranking platform that uses community-driven voting and an Elo-inspired rating system to determine which characters truly deserve the Iron Throne.

Instead of relying on predefined tier lists or personal opinions, visitors participate in direct head-to-head matchups. Every vote contributes to a dynamic ranking system that continuously evolves based on collective decisions from the community.

---

## 👑 Overview

The objective of this project is simple:

**Determine the greatest Game of Thrones character through community-driven competition.**

Each character starts on equal footing.

Visitors are repeatedly presented with two characters and must select a winner.

The selected character gains rating points while the losing character loses rating points.

Over time, rankings naturally emerge based on performance, allowing the community to build a data-driven hierarchy of Westeros.

---

## ⚔️ Core Features

### Character Battles

Users participate in direct one-versus-one character comparisons.

```text
Jon Snow vs Tyrion Lannister
```

Every decision influences future rankings.

---

### Elo-Inspired Ranking System

The ranking engine is based on principles used in competitive gaming and chess.

Features:

* Dynamic rating updates
* Performance-based progression
* Win/loss tracking
* Rating adjustments based on opponent strength
* Self-correcting leaderboard behavior

This prevents rankings from being static and allows the system to adapt as more battles occur.

---

### Dynamic Leaderboard

The leaderboard automatically updates as battles are completed.

Tracked metrics include:

* Global Rank
* Character Rating
* Wins
* Losses
* Win Percentage
* Total Battles

---

### Tier Classification

Characters are grouped into performance tiers based on their ranking statistics.

This provides a quick overview of the strongest and weakest contenders across the realm.

---

### Character Lineage Explorer

The project contains lineage information for major Game of Thrones families and houses.

Users can explore:

* Family relationships
* Bloodlines
* House affiliations
* Character connections

---

### Community Raven Board

A Supabase-powered community feedback system allowing visitors to leave anonymous messages.

Features include:

* Anonymous posting
* Timestamp tracking
* Date filtering
* Sorting by newest
* Sorting by oldest
* Popularity-based sorting
* Shared comments across all visitors

---

### Statistics Dashboard

Each character accumulates detailed performance metrics throughout the ranking process.

Statistics include:

* Battles fought
* Wins
* Losses
* Win percentage
* Elo rating
* Current leaderboard position

---

### Themed User Experience

The application includes:

* Game of Thrones-inspired interface design
* Character artwork
* Themed navigation
* Background music
* Responsive layouts
* Interactive animations

---

## 🛠️ Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript (Vanilla)

### Backend Services

* Supabase

Used for:

* Community comments
* Timestamp storage
* Shared user interactions

### Hosting

* Netlify

Used for deployment and public hosting.

---

## 📂 Project Structure

```text
Game-Of-Thrones-Ranker/

├── index.html
├── about.html
├── style.css
├── script.js
├── tier.js
├── roastme.js
├── music.js
├── supabase.js
├── abt_me.png

├── Json/
│   ├── characters.json
│   └── creatures.json

├── images/
│   └── Character assets

├── creatures/
│   └── Creature assets

├── music/
│   └── Game_of_Thrones_Theme_Song.mp3
```

---

## 📁 Component Responsibilities

| File        | Responsibility                                            |
| ----------- | --------------------------------------------------------- |
| index.html  | Main application interface                                |
| about.html  | About page and community interaction hub                  |
| script.js   | Core ranking engine and battle logic                      |
| tier.js     | Tier calculations and leaderboard generation              |
| roastme.js  | Comment system, sorting, filtering, Supabase integration  |
| music.js    | Theme music management                                    |
| style.css   | Styling, animations, and responsive design                |
| supabase.js | Supabase client initialization and database communication |

---

## 🧠 Ranking Methodology

The ranking engine follows an Elo-inspired approach.

Each battle produces:

1. A winner
2. A loser
3. A rating update

Characters gain or lose points based on:

* Current rating
* Opponent rating
* Battle outcome

This creates a dynamic ecosystem where rankings are earned through consistent performance rather than fixed assignments.

---

## ⚠️ Known Issues

* The Like Button is currently under investigation by the Small Council.
* Additional optimization of ranking transparency is planned for future updates.

---

## 🚀 Future Improvements

* Enhanced ranking analytics
* Expanded lineage visualizations
* Additional filtering and search tools
* Improved mobile interactions
* Advanced community features

---

## 📜 Why This Project Exists

Because ranking Game of Thrones characters is strangely addictive.

Because every fan believes their favorite deserves the throne.

And because giving thousands of people a leaderboard and asking them to disagree with each other seemed like an excellent idea.

---

**The Realm Has Spoken.**

With Love,

**RandomRug**

🐺📜 Raven Mail: **[jaimefuckinglannister7@gmail.com](mailto:jaimefuckinglannister7@gmail.com)**
