/* eslint-disable no-console */
import colors from 'colors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Tour from '../models/Tour.js';
import User from '../models/User.js';
import connectMongoDB from './connectMongoDB.js';

dotenv.config();

connectMongoDB();

const tours = JSON.parse(
  fs.readFileSync(path.resolve('dev-data', 'data', 'tours.json'), 'utf-8')
);

const users = JSON.parse(
  fs.readFileSync(path.resolve('dev-data', 'data', 'users.json'), 'utf-8')
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    console.log(colors.green.inverse('Data successfuly imported'));
  } catch (error) {
    console.error(colors.red(error));
  }
  process.exit();
};

// DELETE ALL DATA FROM COLLECTION
const deleteData = async () => {
  try {
    await Tour.deleteMany({});
    await User.deleteMany({});
    console.log(colors.red.inverse('Data successfuly deleted'));
  } catch (error) {
    console.error(colors.red(error));
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
