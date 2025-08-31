# Fitness App Backend Using Nodejs Express MongoDB and Cloudinary

## TechUsed

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

## Main APi

http://localhost:5000/api

## All Routes

# adminRoutes (/)

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

# staffRoutes (/staff)

- /staff (get)
- /:id (get)
- /create (post)
- /login (post)
- /:id (put)
- /:id (delete)

# memberRoutes (/member)

- /members (get)
- /:id (get)
- /create (post)
- /login (post)
- /:id (put)
- /:id (delete)

# appointmentRoutes (/appointment)

- / (get)
- /create (post)
- /:id (put)
- /:id (delete)
- /myAppointment (get)
- /cancel/:id (patch)
- /confirm/:id (patch)

# leadRoutes (/lead)

- / (get)
- /myLeads (get)
- /:id (get)
- /create (post)
- /:id (put)
- /:id (delete)

# relationRoutes (/relation)

- / (get)
- /myRelations (get)
- /create (post)
- /:id (delete)

# bookRoutes (/book)

- / (get)
- /myBookTrials (get)
- /create (post)
- /:id (put)
- /:id (delete)

# studioRoutes (/studio)

- /:id (put)

# taskRoutes (/task)

- / (get)
- /myTask (get)
- /create (post)
- /:id (delete)

# serviceRoutes (/service)

- / (get)
- /myServices (get)
- /:id (get)
- /create (post)
- /:id (delete)

# productRoutes (/product)

- / (get)
- /myProducts (get)
- /:id (get)
- /create (post)
- /:id (delete)

# contractRoutes (/contract)

- /create (post)
- /download/:id (get)
- /:id (get)

# chatRoutes (/chat)

- / (get)
- /accessChat (post)
- /group (post)
- /rename (put)
- /add (put)
- /remove (put)

# messageRoutes (/message)

- /:id (get)
- /send (post)

# blockRoutes (/block)

- / (get)
- /create (post)
- /:id (delete)




<!-- for cloudinary open cloudinary go to setting then security and enable pdf/zip file delivery then your pdf file work properly  -->