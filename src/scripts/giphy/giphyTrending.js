const giphyUtils = require('../../utils/giphy/giphyUtils.js');

const MAX_GIFS = 5;

// Regex command keywords
const giphy = 'giphy|gifs?';
const trending = 'trend(?:y|ing)?';
const capture = '\\d+|a';

const giphyTrending = {
  help: 'Get some trending Giphy gifs!',
  listens: 'mention',
  match: `^(?=.*\\b(?:${giphy})\\b)(?=.*\\b(?:${trending})\\b).*\\b(${capture})?\\b.*$`,
  func: (msg, args) => {
    let numGifs = args[1];
    numGifs = numGifs === 'a' ? 1 : numGifs; // If a, num = 1
    numGifs = typeof numGifs === 'number' ? numGifs : 3; // If unset, num = 3 (default)
    if (numGifs > MAX_GIFS) {
      const min = 3;
      numGifs = Math.floor(Math.random() * (MAX_GIFS - min + 1)) + min;
      msg.channel.sendMessage(`Ugh, that's too many gifs.  I'll get ${numGifs} instead`);
    } else {
      msg.channel.sendMessage('Some trendy gifs coming up!');
    }
    giphyUtils.getGifsTrending(numGifs).then( (gifs) => {
      gifs.forEach( gif =>
        msg.channel.sendFile(gif.location, gif.name)
      );
    }).catch( (err) => {
      console.log('ERROR: ', err);
      msg.channel.sendMessage('Ugh, Giphy\'s trending gifs are lame right now...');
    });
  }
};

module.exports = giphyTrending;
