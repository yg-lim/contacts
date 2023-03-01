const express = require('express');
const morgan = require('morgan');
const app = express();

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

const isAlphabetical = text => /^[a-z]+$/i.test(text);

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
  (req, res, next) => {
    res.locals.errorMessages = [];
    next();
  },
  (req, res, next) => {
    res.locals.firstName = req.body.firstName.trim();
    res.locals.lastName = req.body.lastName.trim();
    res.locals.phoneNumber = req.body.phoneNumber.trim();

    next();
  },
  (req, res, next) => {
    let firstName = res.locals.firstName;
    if (firstName.length === 0) {
      res.locals.errorMessages.push("First name is required.");
    } else if (firstName.length > 25) {
      res.locals.errorMessages.push("First name maximum length is 25 characters.");
    } else if (!isAlphabetical(firstName)) {
      res.locals.errorMessages.push("First name must only contain alphabetical characters.");
    }

    next();
  },
  (req, res, next) => {
    let lastName = res.locals.lastName;
    if (lastName.length === 0) {
      res.locals.errorMessages.push("Last name is required.");
    } else if (lastName.length > 25) {
      res.locals.errorMessages.push("Last name maximum length is 25 characters.");
    } else if (!isAlphabetical(lastName)) {
      res.locals.errorMessages.push("Last name must only contain alphabetical characters");
    }

    next();
  },
  (req, res, next) => {
    let indexOfMatchingContact = contactData.findIndex(contact => {
      return `${contact.firstName} ${contact.lastName}`.toLowerCase() ===
        `${res.locals.firstName} ${res.locals.lastName}`.toLowerCase();
    });
    if (indexOfMatchingContact !== -1) {
      res.locals.errorMessages.push("Contact already exists in database. First and last name must be unique.");
    }

    next();
  },
  (req, res, next) => {
    let phoneNumber = res.locals.phoneNumber;
    if (phoneNumber.length === 0) {
      res.locals.errorMessages.push("Phone number is required.");
    } else if (!/^\d{3}-\d{3}-\d{4}$/.test(phoneNumber)) {
      res.locals.errorMessages.push("Invalid phone number. Must be valid US style phone number in format of ###-###-####.")
    }

    next();
  },
  (req, res, next) => {
    if (res.locals.errorMessages.length > 0) {
      res.render('new-contact', {
        errorMessages: res.locals.errorMessages,
        firstName: res.locals.firstName,
        lastName: res.locals.lastName,
        phoneNumber: res.locals.phoneNumber,
      });
    } else {
      next();
    }
  },
  (req, res) => {
    contactData.push({
      firstName: res.locals.firstName,
      lastName: res.locals.lastName,
      phoneNumber: res.locals.phoneNumber,
    });
    res.redirect('/contacts');
  }
);

app.use((err, req, res, _next) => {
  res.status(404);
  console.log(err.message);
});

app.listen(3000, 'localhost', () => {
  console.log('listening on port number 3000');
});