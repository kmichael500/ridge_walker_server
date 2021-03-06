import * as Express from 'express';
import * as mongoose from 'mongoose';
import * as compression from 'compression';

import {masterPointsAPI} from './endpoints/masterPointsAPI';
// import {mongoURI} from './config/keys';
import {mapsAPI} from './endpoints/maps';
import {submittedPointAPI} from './endpoints/submitPointsAPI';

import * as bodyParser from 'body-parser';
import * as passport from 'passport';
import './auth/passport';

import {config as dotenvConfig} from 'dotenv';
dotenvConfig();

const app = Express();

/*

DB Config
Add your MongoDB connection string in the keys file.
This keys file is stored in a .env file at the root of the server folder
Do not commit this file.
The file looks like this:

  MONGOURI=connectionstringhere

*/

// Connect to MongoDB
let connectionString = '';
if (process.env.MONGOURI) {
  connectionString = process.env.MONGOURI;
}
mongoose
  .connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => console.log('MongoDB successfully connected'))
  .catch((err: Error) => console.log(err));

mongoose.set('useFindAndModify', false);

//Handle errors
// tslint:disable-next-line: no-any
app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.status || 500);
  res.json({error: err});
});

// Compression
const shouldCompress = (req: Express.Request, res: Express.Response) => {
  if (req.headers['x-no-compression']) {
    return false;
  }
  return compression.filter(req, res);
};

app.use(
  compression({
    // filter: shouldCompress,
  })
);

// fixes CORS issues
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE');
  next();
});

// Passport stuff
app.use(bodyParser.urlencoded({extended: false}));
import {userAPI} from './endpoints/authentication';
import {userInfoAPI} from './endpoints/userinformation';
import {statisticsAPI} from './endpoints/statistics';
import {leadPointAPI} from './endpoints/leadPointAPI';

import {noPendingUsers} from './auth/restrictFunctions';
import {parcelAPI} from './endpoints/parcelAPI';
// Routes
app.use('/api/user', userAPI);
app.use('/api/stats', statisticsAPI);
app.use(
  '/api/points/master',
  passport.authenticate('jwt', {session: false}),
  noPendingUsers(),
  masterPointsAPI
);
app.use(
  '/api/points/leads',
  passport.authenticate('jwt', {session: false}),
  noPendingUsers(),
  leadPointAPI
);
app.use(
  '/api/parcel',
  passport.authenticate('jwt', {session: false}),
  noPendingUsers(),
  parcelAPI
);
app.use(
  '/api/maps',
  passport.authenticate('jwt', {session: false}),
  noPendingUsers(),
  mapsAPI
);
app.use(
  '/api/submit/point',
  passport.authenticate('jwt', {session: false}),
  noPendingUsers(),
  submittedPointAPI
);

app.use(Express.static(__dirname + '/public'));
const port = process.env.PORT || 5000;

const server = app.listen(port, () =>
  console.log(`Server up and running on port ${port} !`)
);
