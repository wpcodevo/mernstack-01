import config from 'config';
import mongoose from 'mongoose';
import log from './logger';

const DB_URI = config
  .get<string>('dbUri')
  .replace('<password>', config.get<string>('dbPass'));

  
  const localDB = `mongodb://${config.get<string>(
    'dbLocalUser'
    )}:${config.get<string>('dbLocalPass')}@mongo:27017/Hcommerce?authSource=admin`;

const connectDB = async () => {
  try {
    await mongoose.connect(localDB);
    log.info('Database connected successfully...');
  } catch (err: any) {
    setTimeout(connectDB, 5000);
    log.error(err);
  }
};

export default connectDB;
