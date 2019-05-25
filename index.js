require('dotenv').config();
const Discord = require('discord.js');

const client = new Discord.Client();

let votes = 0;
let gameActive = false;
const userScore = {};

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', (msg) => {
  const { username } = msg.author;

  /* Make sure we're not responding to our own messages */
  if (username !== 'Four Word Bot') {
    /* Check for people enabling the game by typing !four */
    if (msg.content === '!four' && !gameActive) {
      votes += 1;
      if (votes >= 5) {
        gameActive = true;
        return msg.channel.send(
          'Starting the four word game! Messages using words with more than 4 characters (exluding @mentions and URLs) will be DELETED! Type !end to end the game and tally scores.',
        );
      }
      return msg.channel.send(`${votes} votes to start the four word game!`);
    }

    if (gameActive) {
      const words = msg.content.split(' ');
      /* Check if a word is more than 4 chars long and isn't a link or a mention */
      if (words.some(word => word.length > 4 && !word.match(/https?:\/\//) && !word.match(/^@/))) {
        return msg.delete();
      }

      /* Check if there is already a score for the user */
      if (Object.keys(userScore).some(key => key === username) && words.every(word => word !== '!end')) {
        userScore[username] += words.length;
      } else {
        userScore[username] = words.length;
      }

      /* Reset back to default state */
      if (words.some(word => word === '!end')) {
        gameActive = false;
        votes = 0;
        msg.channel.send('Four word game ended!');
        if (Object.keys(userScore).length) {
          const finalScores = Object.entries(userScore).map(([user, score]) => `${user}: ${score} points!\n`);
          const winningScore = Math.max(...Object.values(userScore));
          const winner = Object.keys(userScore).find(key => userScore[key] === winningScore);

          msg.channel.send('Tallying results...');
          msg.channel.send(finalScores);
          return msg.channel.send(`Winner is: ${winner} with a score of ${winningScore}!`);
        }
      }
    }
  }
});

client.login(process.env.BOT_TOKEN);
