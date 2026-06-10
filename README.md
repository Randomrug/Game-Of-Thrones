# 🏰 Game of Thrones Character Ranker

A slightly obsessive attempt to answer a question that has divided the realm for years:

**Who is actually the best Game of Thrones character?**

Not the strongest.

Not the smartest.

Not the one with the biggest dragon.

Just... the best.

Instead of assigning arbitrary scores, this project lets visitors decide through direct character matchups. Every battle influences a dynamic ranking system, allowing the leaderboard to evolve based on community choices.

---

# ⚔️ How It Works

Visitors are shown two characters from the Game of Thrones universe.

For every matchup, a choice must be made.

```text
Jon Snow  vs  Tyrion Lannister
```

Pick a winner.

The system records the result and updates character ratings accordingly.

Over time, characters rise and fall based on community decisions rather than fixed rankings.

---

# 👑 Ranking System

The ranking system is inspired by the Elo rating model used in competitive games and chess.

Every character begins on equal footing.

Winning against highly ranked characters provides larger rating gains, while losing to lower-ranked characters results in larger penalties.

This allows the rankings to naturally evolve rather than relying on predetermined values.

The system also tracks:

* Wins
* Losses
* Win Percentage
* Character Rating
* Ranking Position

---

# 📜 Features

### Character Battles

Head-to-head character comparisons.

Every decision contributes to the overall rankings.

---

### Dynamic Leaderboard

The leaderboard updates based on battle outcomes.

Characters move up and down depending on performance.

---

### Tier Rankings

Characters are automatically organized based on accumulated performance.

This provides a clearer view of which characters consistently perform well across the community.

---

### Complete Lineage Tracking

The project includes lineage information for major houses and families.

Visitors can explore relationships between characters and their family connections.

---

### Community Ravens

Visitors can leave anonymous comments through the Raven Board.

Features include:

* Anonymous posting
* Comment timestamps
* Sorting by newest
* Sorting by oldest
* Sorting by popularity
* Date-based filtering

Comments are stored using Supabase and are shared across all visitors.

---

### Statistics Dashboard

Each character profile contains performance metrics such as:

* Battles fought
* Wins
* Losses
* Win rate
* Current rating

These statistics help explain why characters occupy their positions on the leaderboard.

---

### Immersive Theme

The website includes:

* Game of Thrones inspired styling
* Custom visual effects
* Character artwork
* Theme music
* Westeros-inspired interface elements

---

# 🛠️ Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript

### Database

* Supabase

Used for:

* Community comments
* Timestamps
* Shared visitor interactions

### Deployment

* Netlify

Used to host and deploy the website.

---

# 📂 Project Structure

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
│   └── character assets

├── creatures/
│   └── creature assets

├── music/
│   └── Game_of_Thrones_Theme_Song.mp3
```

---

# 📁 File Responsibilities

### index.html

Main application interface.

Contains character battles, rankings, leaderboards, and navigation.

---

### about.html

About page and community interaction hub.

Contains the Raven Board where visitors can leave comments.

---

### script.js

Core application logic.

Handles:

* Matchups
* Ranking calculations
* Statistics updates
* Character progression

---

### tier.js

Responsible for tier calculations and leaderboard presentation.

---

### roastme.js

Handles community reviews and comments.

Includes:

* Comment submission
* Sorting
* Filtering
* Timestamp handling
* Supabase integration

---

### music.js

Controls theme music playback and audio preferences.

---

### style.css

Contains all visual styling, layouts, animations, and responsive design rules.

---

### supabase.js

Initializes and manages communication with Supabase.

---

### characters.json

Stores character data and metadata.

---

### creatures.json

Stores creature-related information used throughout the project.

---

# ⚠️ Known Issues

The Like Button is currently engaged in a political dispute with the Small Council.

The maesters are investigating.

---

# Why This Project Exists

Mostly because ranking Game of Thrones characters is strangely addictive.

And because there are very few things more dangerous than giving fans a leaderboard and asking them to disagree with each other.

---

With Love,

**RandomRug**

📧 Ping me: **[rithikaarulmozhi21@gmail.com](mailto:rithikaarulmozhi21@gmail.com)**
