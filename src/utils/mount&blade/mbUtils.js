const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');

const mbUtils = module.exports = {};

let currentIndex = '';
let index = {};

const indexTemplate = {
  locations: {
    global: {
      goods: {}
    }
  }
};

const goodGlobalTemplate = {
  value: {
    true: 0,
    buy: {
      lowest: 0,
      highest: 0,
      recommend: 0
    },
    sell: {
      lowest: 0,
      highest: 0,
      recommend: 0
    }
  }
};

const goodLocalTemplate = {
  value: {
    buy: {
      lowest: 0,
      highest: 0,
      historic: 0,
      recent: 0,
      prices: 0
    },
    sell: {
      lowest: 0,
      highest: 0,
      historic: 0,
      recent: 0,
      prices: 0
    }
  }
};

const updateIndex = () => {
  fs.writeFileSync(path.join(__dirname, 'indices', currentIndex, 'index.json'), JSON.stringify(index, null, 2), 'utf-8');
};

mbUtils.createIndex = (name) => {
  return new Promise((resolve, reject) => {
    const indexDir = path.join(__dirname, 'indices', name);
    fs.mkdir(indexDir, null, (err) => {
      if (err) {
        reject(err);
      } else {
        // eslint-disable-next-line max-len
        fs.writeFileSync(path.join(indexDir, 'index.json'), JSON.stringify(indexTemplate, null, 2), 'utf-8');
        currentIndex = name;
        index = require(path.join(indexDir, 'index.json'));
        resolve();
      }
    });
  });
};

mbUtils.loadIndex = (name) => {
  return new Promise((resolve, reject) => {
    if (currentIndex === name) {
      reject('LOADED');
    }
    const indexDir = path.join(__dirname, 'indices', name);
    fs.exists(indexDir, (exists) => {
      if (exists) {
        currentIndex = name;
        index = require(path.join(indexDir, 'index.json'));
        resolve();
      } else {
        reject();
      }
    });
  });
};

mbUtils.addGood = (good, trueValue=0) => {
  return new Promise((resolve, reject) => {
    if (currentIndex === '') {
      reject('NO_INDEX');
    } else if (good in index.locations.global.goods) {
      reject('ALREADY_REGISTERED');
    } else {
      index.locations.global.goods[good] = Object.assign({}, goodGlobalTemplate);
      index.locations.global.goods[good].value.true = trueValue;
      updateIndex();
      resolve();
    }
  });
};

mbUtils.addLocation = (location) => {
  return new Promise((resolve, reject) => {
    if (currentIndex === '') {
      reject('NO_INDEX');
    } else if (location in index.locations) {
      reject('ALREADY_REGISTERED');
    } else {
      index.locations[location] = { goods: {} };
      updateIndex();
      resolve();
    }
  });
};

mbUtils.addPrice = (name, price, priceType='buy', location='global') => {
  return new Promise((resolve, reject) => {
    let good;
    if (currentIndex === '') {
      reject('NO_INDEX');
    } else {
      if (name in index.locations[location].goods) {
        good = index.locations[location].goods[name];
      } else {
        index.locations[location].goods[name] = Object.assign({}, goodLocalTemplate);
        good = index.locations[location].goods[name];
      }

      good.value[priceType].lowest =
        (price < good.value[priceType].lowest || good.value[priceType].lowest === 0)
          ? price
          : good.value[priceType].lowest;
      good.value[priceType].highest =
        (price > good.value[priceType].highest)
          ? price
          : good.value[priceType].highest;

      if (location !== 'global') {
        mbUtils.addPrice(name, price, priceType);
        good.value[priceType].historic =
          ((good.value[priceType].historic * good.value[priceType].prices) + price)
            / (good.value[priceType].prices + 1);
        good.value[priceType].recent = price;
        good.value[priceType].prices++;
      } else {

      }

      updateIndex();
      resolve();
    }
  });
};

mbUtils.isGood = (good) => {
  return (good in index.locations.global.goods);
};

mbUtils.isLocation = (location) => {
  return (location in index.locations);
};
