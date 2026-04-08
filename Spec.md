Got it — you want **one file** you can hand directly to GitHub Copilot so it understands the architecture, data model, and API structure we’ve designed.  

Below is a **single, self‑contained specification file** that describes:

- Your authentication model (Google + custom login)  
- Your Google Sheets schema  
- Your Apps Script API endpoints  
- Your Vue frontend responsibilities  
- Your permission rules  
- Your data flow  

This is written in a way that GitHub Copilot will immediately use as context to generate consistent code across your project.

---

# 📄 `PROJECT_SPEC.md`

```markdown
# D&D Character Tracker — Project Specification

This project is a serverless D&D character and player tracker using:
- Vue frontend
- Google Apps Script backend (serverless)
- Google Sheets as the database
- Dual authentication (Google login OR custom username/password)

The goal is:
- Players authenticate
- Players can only modify their own characters
- Random users cannot modify anything
- The Google Sheet remains private
- No hosting or backend server required

---

## 1. Google Sheets Structure

### Sheet: `Users`
Tracks players and login identity.

Columns:
- `userId` (string, unique)
- `firstName`
- `lastName`
- `email` (for Google login users)
- `username` (for custom login users)
- `passwordHash` (bcrypt or SHA256 hash)
- `role` ("player" or "DM")

Example:
| userId | firstName | lastName | email           | username | passwordHash | role   |
|--------|-----------|----------|-----------------|----------|--------------|--------|
| u001   | Alice     | Stone    | alice@gmail.com |          |              | player |
| u002   | Bob       | Carter   |                 | bob      | <hash>       | player |
| u999   | DM        | Master   | dm@gmail.com    |          |              | DM     |

---


### Sheet: `Characters`
Tracks character data.

Columns:
- `characterId` (string, unique)
- `userId` (owner, foreign key to Users.userId)
- `name`
- `class`
- `race`
- `sessions` (integer)
- `level` (integer, equal to sessions)
- `description`

Example:
| characterId | userId | name   | class | race | sessions | level | description        |
|-------------|--------|--------|-------|------|----------|-------|--------------------|
| c001        | u001   | Thorne | Rogue | Elf  | 5        | 5     | A quiet wanderer   |
| c002        | u002   | Mira   | Cleric| Human| 3        | 3     | Devout healer      |

**Note:** There is no player or character deletion. Once created, users and characters cannot be deleted from the system.

---

## 2. Authentication Model

### A. Google Login
- Vue uses Google Identity Services to obtain an ID token (JWT).
- Vue sends the token to Apps Script.
- Apps Script verifies the token using Google’s public keys.
- Apps Script extracts the user’s email.
- Apps Script looks up the user in the `Users` sheet by email.
- Apps Script returns a session object containing:
  - `userId`
  - `role`
  - `firstName`
  - `lastName`

### B. Custom Login
- Vue sends username + password to Apps Script.
- Apps Script:
  - Looks up the user by username
  - Verifies password hash
  - Generates a random session token
- Vue stores the token in localStorage.
- All API calls include the token.
- Apps Script validates the token and resolves the user.

---

## 3. Permission Rules


### Players:
- Can view only their own characters (unless you choose otherwise)
- Can modify their own characters (where `Characters.userId === currentUser.userId`), including updating their own session count (and thus level)


### DM:
- Can view and modify all characters
- Can add sessions
- Can edit session counts (thus levels)

### Anonymous users:
- Cannot read or write anything

---

## 4. Apps Script API Endpoints

All endpoints return JSON.

### `POST /login/google`
Input:
- `idToken` (Google JWT)

Output:
- `userId`
- `role`
- `firstName`
- `lastName`

### `POST /login/custom`
Input:
- `username`
- `password`

Output:
- `token`
- `userId`
- `role`
- `firstName`
- `lastName`

### `GET /characters`
Auth:
- Google token OR custom token

Returns:
- If player: only their characters
- If DM: all characters

### `POST /characters/update`
Auth:
- Google token OR custom token

Input:
- `characterId`
- Updated fields

Rules:
- Player can only update their own character
- DM can update any character


### `POST /characters/create`
Auth:
- Player or DM

Input:
- Character fields

Rules:
- New character is assigned to the current user unless DM specifies otherwise

**Note:** There is no endpoint for deleting players or characters. Deletion is not permitted.

---

## 5. Vue Frontend Responsibilities

### Login Page
- Buttons:
  - “Login with Google”
  - “Login with Username/Password”
- Store session token or Google ID token in localStorage

### Character Dashboard
- Fetch characters via `/characters`
- Display:
  - name
  - class
  - race
  - sessions
  - level
  - description
- Allow editing only if:
  - `character.userId === currentUser.userId` OR `currentUser.role === "DM"`

### Character Editor
- Form for editing character fields
- Save via `/characters/update`

---

## 6. Data Flow Summary

### Google Login Flow
```
Vue → Google OAuth → Vue receives ID token
Vue → /login/google → Apps Script verifies → returns user info
Vue stores user info → calls /characters → displays data
```

### Custom Login Flow
```
Vue → /login/custom → Apps Script verifies → returns session token
Vue stores token → calls /characters → displays data
```

### Character Update Flow
```
Vue → /characters/update (with token)
Apps Script:
  - validates token
  - checks ownership
  - returns success
```

---


---

## 7. Rate Limiting

To prevent abuse, all API endpoints should implement basic rate limiting:
- Limit each user (by userId or token) to 30 requests per minute per endpoint.
- If the limit is exceeded, return an error response with a clear message (e.g., "Rate limit exceeded. Please wait and try again.").
- Anonymous users (if any endpoints are ever exposed) should be limited to 5 requests per minute.

---

## 8. Implementation Notes for Copilot

- Use fetch() for all API calls.
- Use localStorage for session tokens.
- Use a composable or store (Pinia) for user state.
- Apps Script should be written in ES5 syntax.
- Use UUIDs for `userId` and `characterId`.
- Hash passwords using SHA256 or bcrypt (client-side or script-side).
- Level always equals sessions.

```

---