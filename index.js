require('dotenv').config();
const Discord = require('discord.js');

const client = new Discord.Client();

let votes = 0;
let gameActive = false;
let userScore = {};

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', (msg) => {
  const { username } = msg.author;

  if (username !== 'Four Word Bot') {
    if (msg.content === '!four' && !gameActive) {
      votes = votes + 1;
      if (votes >= 1) {
        gameActive = true;
        return msg.channel.send(
          'Starting the four word game! Messages using words with more than 4 characters (exluding @mentions and URLs) will be DELETED! Type !end to end the game and tally scores.',
        );
      }
      return msg.channel.send(`${votes} votes to start the four word game!`);
    }

    if (gameActive) {
      const words = msg.content.split(' ');
      console.log(words);
      if (words.some(word => word.length > 4 && !word.match(/https?:\/\//) && !word.match(/^@/))) {
        return msg.delete();
      }

      /* Check if there is already a score for the user */
      if (Object.keys(userScore).some(key => key === username)) {
        userScore[username] = userScore[username] + words.length;
      } else {
        userScore[username] = words.length;
      }

      /* Reset back to default state */
      if (words.some(word => word === '!end')) {
        gameActive = false;
        votes = 0;
        msg.channel.send('Four word game ended!');
        if (Object.keys(userScore).length) {
          msg.channel.send('tallying results...');
          msg.channel.send(Object.entries(userScore));
        }
      }
    }
  }
});

client.login(process.env.BOT_TOKEN);