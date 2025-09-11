# Fitness App Backend Using Nodejs Express MongoDB and Cloudinary

## TechUsed

```pgsql
- Nodejs(for Backend)
- ExpressJs( nodejs framework)
- MongoDB (Database)
- Cloudinary. (to store images and Documents)
- bcrypt (for HashedPassword)
- pdfKit( to convert form data into a pdf document)
- socket.io (for communication)
- cors (for connect with frontend)
- cookieParser ( to store cookie)
- jsonwebtoken (to store data in cookie format)
- multer (to store img in database and upload on cloudinary)
- nodemailer (to reset password )
```

## Main APi

```bash
http://localhost:5000/api
```

## All Routes

# adminRoutes (/)

```markdown
- /create (post)
- /:id (put)
- /login (post)
- /logout (post)
- /forget-password (post)
- /reset-password/:token (post)
- /reset-email (post)
- /changePassword (post)
- /users (get)
- /:id (delete)
```

# staffRoutes (/staff)

```markdown
- /staff (get)
- /:id (get)
- /create (post)
- /login (post)
- /:id (put)
- /:id (delete)
```

# memberRoutes (/member)

```markdown
- /members (get)
- /:id (get)
- /create (post)
- /login (post)
- /:id (put)
- /:id (delete)
```

# appointmentRoutes (/appointment)

```markdown
- / (get)
- /create (post)
- /:id (put)
- /:id (delete)
- /myAppointment (get)
- /cancel/:id (patch)
- /confirm/:id (patch)
```

# leadRoutes (/lead)

```markdown
- / (get)
- /myLeads (get)
- /:id (get)
- /create (post)
- /:id (put)
- /:id (delete)
```

# relationRoutes (/relation)

```markdown
- / (get)
- /myRelations (get)
- /create (post)
- /:id (delete)
```

# bookRoutes (/book)

```markdown
- / (get)
- /myBookTrials (get)
- /create (post)
- /:id (put)
- /:id (delete)
```

# studioRoutes (/studio)

```markdown
- /:id (put)
- /studios (get)
```

# taskRoutes (/task)

```markdown
- / (get)
- /myTask (get)
- /create (post)
- /:id (delete)
```

# serviceRoutes (/service)

```markdown
- / (get)
- /myServices (get)
- /:id (get)
- /create (post)
- /:id (delete)
```

# productRoutes (/product)

```markdown
- / (get)
- /myProducts (get)
- /:id (get)
- /create (post)
- /:id (delete)
```

# contractRoutes (/contract)

```markdown
- /contract
- /create (post)
- /download/:id (get)
- /:id (get)
- /keep/:id (to continue Contract)
- /cancel/:id (to cancel Contract)
- /myContract (only login member can see his contract)
```

# chatRoutes (/chat)

```markdown
- / (get)
- /accessChat (post)
- /group (post)
- /rename (put)
- /add (put)
- /remove (put)
```

# messageRoutes (/message)

```markdown
- /:id (get)
- /send (post)
```

# blockRoutes (/block)

```markdown
- / (get)
- /create (post)
- /:id (delete)
```

# metaAds Routes (/metaads)

```markdown
- /auth-url (get)
- /callback (get)
- /connection (get)
- /sync (post to sync ads account)
- /revoke (post to remove connection)
```

# payment Routes (/payment)

```markdown
- /create-payment (post)
- /webhook (post)
```

# IdlePeriod (/vacation)

```markdown
- /apply (post)
- /my (get)
- /all (get)
- /status/:id (put only staff can accept and reject it)
```

# Notification (/notification)

```markdown
- / (get) only logged user can see his notification
- /:id/read (put) (read only single notification)
- /:id/read-all (put) (read all notification at once)
```

# email Route (/email)

```markdown
- / (get) only logged user can see his email which staff send
```

## .env these value needs

```env
# Database Url from MongoDB Altas

MONGO_URI=

# admin AUTHCode (to create admin)

- AUTH_CODE=

# jwt secret keys and expiry

- JWT_REFRESH_EXPIRY=7d
- JWT_ACCESS_EXPIRY=30m
- JWT_REFRESH_TOKEN=node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
- JWT_ACCESS_TOKEN=node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Cloudinary Keys

- CLOUDINARY_CLOUD_NAME=
- CLOUDINARY_API_KEY=
- CLOUDINARY_API_SECRET=

# Backend Port and Node mode

- PORT=5000
- NODE_ENV=development

# Nodemailer Email and host

- EMAIL_HOST=stmp.gmail.com
- EMAIL_PORT=587
- EMAIL_USER=<your-email>@gmail.com
- EMAIL_PASS= <your email secret pass like(wweuwoieuwoe)

# metaAds (token-key=32bits && token iv=16bytes)

- META_APP_ID=
- META_APP_SECRET=
- META_REDIRECT_URI=
- FRONTEND_URL=
- TOKEN_ENCRYPT_KEY=
- TOKEN_ENCRYPT_IV=
- GRAPH_BASE=https://graph.facebook.com

# For Stripe Payment

STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

✅ Tip: For Cloudinary, enable PDF/ZIP file delivery in the security settings to serve PDFs correctly.

# npm install

```
npm i
```

# for github Clone

```bash
https://github.com/SyedTalha71x/timathy1/tree/master/server
```
