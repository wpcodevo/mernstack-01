require('dotenv').config();
import fs from 'fs';
import reviewModel from '../model/review.model';
import productModel from '../model/product.model';
import userModel from '../model/user.model';
import connectDB from './connectDB';
import log from './logger';

const products = JSON.parse(
  fs.readFileSync(`${__dirname}/../../dev-data/data/products.json`, 'utf-8')
);

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/../../dev-data/data/users.json`, 'utf-8')
);

const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/../../dev-data/data/reviews.json`, 'utf-8')
);

connectDB();

const importData = async () => {
  try {
    await productModel.create(products);
    await userModel.create(users);
    await reviewModel.create(reviews);
    log.info('Data imported...');
    process.exit(1);
  } catch (err: any) {
    log.error(err);
  }
};

const deleteData = async () => {
  try {
    await productModel.deleteMany();
    await userModel.deleteMany();
    await reviewModel.deleteMany();
    log.info('Data delete...');
    process.exit(1);
  } catch (err: any) {
    log.error(err);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
