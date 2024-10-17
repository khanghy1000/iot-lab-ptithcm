import express from 'express';
import 'dotenv/config';
import knex, { Knex } from 'knex';
import { clear } from 'console';

const app = express();

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

const esp8266Url = 'http://192.168.10.142';

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

async function fetchStats() {
  const response = await fetch(esp8266Url + '/stats');
  const stats = await response.json();
  return stats;
}

type Stats = {
  temperature: number;
  humidity: number;
};

setInterval(async () => {
  let stats: Stats;
  try {
    stats = await fetchStats();
  } catch (err) {
    console.error('Failed to fetch stats');
    console.log(err);
    return;
  }

  console.log(stats);

  try {
    await db.insert(stats).into('logs');
  } catch (err) {
    console.error('Failed to insert stats into db');
    console.log(err);
    return;
  }
}, 10000);

app.listen(3000, () => {
  console.log('Listening on http://localhost:3000');
});
