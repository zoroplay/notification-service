/* eslint-disable quotes */

console.log("✅ Loaded custom release.config.js");

module.exports = {
  branches: [
    { name: 'main' },
    { name: 'staging', prerelease: 'staging' },
  ],
  repositoryUrl: 'https://github.com/zoroplay/notification-service.git',
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
