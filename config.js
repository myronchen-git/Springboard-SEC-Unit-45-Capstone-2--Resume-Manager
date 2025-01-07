'use strict';

require('dotenv').config();

// ==================================================

const SECRET_KEY = process.env.SECRET_KEY || 'secret-dev';

const PORT = +process.env.PORT || 3001;

const databaseUriLocalDomain = 'postgresql://postgres@localhost';
const DATABASE_URI =
  process.env.NODE_ENV === 'test'
    ? databaseUriLocalDomain + '/resume_manager_test'
    : process.env.DATABASE_URL || databaseUriLocalDomain + '/resume_manager';

const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === 'test' ? 1 : 12;

console.log('Resume Manager Config:');
console.log('SECRET_KEY:', SECRET_KEY);
console.log('PORT:', PORT.toString());
console.log('BCRYPT_WORK_FACTOR:', BCRYPT_WORK_FACTOR);
console.log('DATABASE_URI:', DATABASE_URI);
console.log('---');

// ==================================================

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  DATABASE_URI,
};
