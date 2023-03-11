const express = require('express');
const morgan = require('morgan');
const { body, validationResult } = require('express-validator');
const session = require('express-session');
const store = require('connect-loki');
const flash = require('express-flash');

const app = express();
const LokiStore = store(session);

const contactData = [
  {
    firstName: "Mike",
    lastName: "Jones",
    phoneNumber: "281-330-8004",
  },
  {
    firstName: "Jenny",
    lastName: "Keys",
    phoneNumber: "768-867-5309",
  },
  {
    firstName: "Max",
    lastName: "Entiger",
    phoneNumber: "214-748-3647",
  },
  {
    firstName: "Alicia",
    lastName: "Keys",
    phoneNumber: "515-489-4608",
  },
];

const sortContacts = contactsArr => {
  return contactsArr.slice().sort((contactA, contactB) => {
    if (contactA.lastName < contactB.lastName) {
      return -1;
    } else if (contactA.lastName > contactB.lastName) {
      return 1;
    } else if (contactA.firstName < contactB.firstName) {
      return -1;
    } else if (contactA.firstName > contactB.firstName) {
      return 1;
    } else {
      return 0;
    }
  });
};

const validateName = (field, whichName) => {
  return body(field)
    .trim()
    .isLength({ min: 1, max: 25 })
    .withMessage(`${whichName} name must be between 1 and 25 characters.`)
    .bail()
    .isAlpha()
    .withMessage(`${whichName} name must be only alphabetical characters.`);
};

const clone = object => {
  return JSON.parse(JSON.stringify(object));
};

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('common'));
app.use(session({
  cookie: {
    httpOnly: true,
    maxAge: 31 * 24 * 60 * 60 * 1000,
    path: '/',
    secure: false,
  },
  name: 'contacts-manager-session-id',
  resave: false,
  saveUninitialized: true,
  secret: 'not-very-secure',
  store: new LokiStore({}),
}));

app.use((req, res, next) => {
  if (!('contactData' in req.session)) {
    req.session.contactData = clone(contactData);
  }

  next();
});

app.use(flash());
app.use((req, res, next) => {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

app.get('/', (req, res) => {
  res.redirect('/contacts');
});

app.get('/contacts', (req, res) => {
  res.render("contacts", {
    contacts: sortContacts(req.session.contactData),
  });
});

app.get('/contacts/new', (req, res) => {
  res.render('new-contact');
});

app.post('/contacts/new',
  [
    validateName('firstName', 'First'),
    validateName('lastName', 'Last'),
    body('phoneNumber')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Phone number is required.')
      .bail()
      .matches(/^\d{3}-\d{3}-\d{4}$/)
      .withMessage('Phone number must be in US number format ###-###-####')
  ],
  (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach(error => req.flash('error', error.msg));
      res.render('new-contact', {
        flash: req.flash(),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
      });
    } else {
      next();
    }
  },
  (req, res) => {
    req.session.contactData.push({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
    });
    req.flash('success', 'New contact added to list!');
    res.redirect('/contacts');
  },
);

app.use((err, req, res, _next) => {
  res.status(404);
  console.log(err.message);
});

app.listen(3000, 'localhost', () => {
  console.log('listening on port number 3000');
});