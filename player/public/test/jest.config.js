module.exports = {
    globalSetup: './setup.js',
    globalTeardown: './teardown.js',
    testEnvironment: './puppeteer_environment.js',
    "reporters": [
      "default",
      ["jest-html-reporters", {
        "publicPath": "./testReport",
        "filename": "report.html",
        "expand": true
      }]
  ]
  }
  