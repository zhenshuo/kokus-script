const request = require("request");

exports.asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

exports.sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

exports.postJson = async (url, jsonData, callback) => {
  return new Promise((resolve, reject) => {
    request.post(
      {
        url: url,
        header: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        json: jsonData
      },
      (err, response, body) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        if (callback) {
          callback(body);
        }
        resolve(body);
      }
    );
  });
};
