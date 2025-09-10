/* eslint-disable quotes */

console.log("✅ Loaded custom release.config.js");

module.exports = {
  branches: [
    { name: 'main' },
    { name: 'staging', prerelease: 'staging' },
  ],
  repositoryUrl: 'https://oauth2:glpat-33an5NfJQm9UEmX0FCqscW86MQp1Omc0ZHhhCw.01.1218fj9q7@gitlab.com/sbe-developers/notification-service.git',
  tagFormat: 'v${version}',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    [
      '@semantic-release/exec',
      {
        verifyReleaseCmd: 'echo ${nextRelease.version} > .VERSION',
      },
    ],
    '@semantic-release/git',
  ],
  preset: 'angular',
};
