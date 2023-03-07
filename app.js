const express = require('express');
const morgan = require('morgan');
const app = express();
const { body, validationResult } = require('express-validator');

let contactData = [
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

let validateName = (field, whichName) => {
  return body(field)
    .trim()
    .isLength({ min: 1, max: 25 })
    .withMessage(`${whichName} name must be between 1 and 25 characters.`)
    .bail()
    .isAlpha()
    .withMessage(`${whichName} name must be only alphabetical characters.`);
};

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('common'));

app.get('/', (req, res) => {
  res.redirect('/contacts');
});

app.get('/contacts', (req, res) => {
  res.render("contacts", {
    contacts: sortContacts(contactData),
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
      res.render('new-contact', {
        errorMessages: errors.array().map(err => err.msg),
        ...req.body,
      });
    } else {
      next();
    }
  },
  (req, res) => {
    contactData.push({ ...req.body });
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