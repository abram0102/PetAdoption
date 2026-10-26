# PetFinder

A full-stack pet adoption platform. Users can browse pets available for
adoption, filter by type, save favorites, leave inquiries on a listing, and
sign in with Google to list their own pet for adoption.

Live demo: https://petfinder-frontend-dot-pet-adoption-platform-493317.ue.r.appspot.com/

## Architecture

```
┌─────────────────────┐        ┌──────────────────────┐        ┌───────────┐
│   React SPA          │  REST  │   Express API         │        │  MongoDB   │
│  (react-router,       │ ─────► │  (api-gateway-style   │ ─────► │  3 collections:│
│   react-bootstrap)    │ ◄───── │   routes → controllers│ ◄───── │  pets /    │
│                       │  JSON  │   → DAOs)             │        │  comments /│
└─────────┬─────────────┘        └──────────────────────┘        │  favorites │
          │                                                       └───────────┘
          │ direct browser upload (bypasses the API entirely)
          ▼
┌─────────────────────┐
│     Cloudinary        │
│ (image hosting/CDN)   │
└─────────────────────┘

          │ client-side only, no server round-trip
          ▼
┌─────────────────────┐
│   Google OAuth         │
│ (Sign-In, decoded JWT) │
└─────────────────────┘
```

Both the frontend (`petfinder-frontend`) and backend are deployed as separate
Google App Engine services.

**A few deliberate design choices:**

- **Images never touch the Node backend.** `UploadPet` uploads the file
  straight from the browser to Cloudinary's unsigned upload endpoint and only
  sends the resulting HTTPS URL to the API. This keeps the backend stateless
  with respect to file storage and avoids having to run an image-processing
  pipeline or manage a storage bucket ourselves.
- **Three narrow MongoDB collections instead of one.** `pets`, `comments`,
  and `favorites` are modeled as separate collections rather than embedding
  comments/favorites inside a pet document. Favorites are keyed by user ID
  (one document per user holding an array of pet IDs), which makes "is this
  pet in my favorites" and "add/remove a favorite" both single-document
  upserts instead of array surgery across many pet documents.
- **A DAO layer sits between the Express controllers and the MongoDB
  driver** (`petsDAO` / `commentsDAO` / `favoritesDAO`), each responsible for
  one collection. Controllers stay thin (parse request → call DAO → shape
  response) and the data-access logic — query shape, `ObjectId` conversion,
  partial updates — lives in one place per collection.
- **Auth is deliberately minimal for a personal project.** Google Sign-In
  runs entirely client-side: the frontend decodes the Google ID token with
  `jwt-decode` and treats the embedded Google ID as the user's identity, which
  it then sends to the API on write requests (add pet, add comment, toggle
  favorite). The backend trusts that value rather than re-verifying the token
  itself — a deliberate simplification documented below rather than an
  oversight.

## Project layout

```
backend/
  server.js              Express app setup (middleware, route mounting)
  index.js               Mongo connection + DAO injection + server start
  api/
    pet.route.js          All /api/pet routes
    pet.controller.js      Pet CRUD + "my uploads" lookup
    comments.controller.js Comment CRUD
    favorites.controller.js Favorite get/update
  dao/
    petsDAO.js, commentsDAO.js, favoritesDAO.js

frontend/
  src/App.js              Routes, nav bar, Google OAuth provider, session restore
  src/components/
    PetList.js             Browse + filter by type, favorite toggle
    Pet.js                 Pet detail + inquiries (comments) thread
    Favorite.js            Saved pets
    UploadPet.js / EditPet.js  Add/edit a listing (incl. Cloudinary upload)
    MyUploads.js           A user's own listings, with edit/delete
    AddComment.js          Post/edit an inquiry
    Login.js / Logout.js   Google Sign-In
  src/services/pets.js     Thin axios wrapper around the REST API
```

## Running locally

**Backend**

```bash
cd backend
npm install
cp app.example.yaml .env   # then fill in PET_DB_URL and PET_COLLECTION as env vars
node index.js
```

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env       # fill in REACT_APP_API_BASE_URL, REACT_APP_BASE_URL, REACT_APP_GOOGLE_CLIENT_ID
npm start
```

> **Setup note:** `package.json` isn't currently committed for either app
> (only `backend/package-lock.json` is) — `npm install` needs it restored
> first. Backend runtime dependencies, from the lockfile: `express`, `cors`,
> `dotenv`, `mongodb`. Frontend dependencies, from the source imports: `react`,
> `react-dom`, `react-router-dom`, `react-bootstrap` + `bootstrap`,
> `@react-oauth/google`, `jwt-decode`, `axios`, `moment`.

You'll also need:

- A MongoDB connection string with a database containing `pets`, `comments`,
  and `favorites` collections (they're created on first write).
- A Google OAuth client ID (for `@react-oauth/google`).
- A Cloudinary unsigned upload preset — `UploadPet.js` currently has the
  cloud name and preset hardcoded as placeholders and needs them swapped for
  real values.
