export default {
  dbUri: 'MONGODB_URI',
  dbPass: 'MONGODB_PASS',
  dbLocalUser: 'MONGODB_LOCAL_USER',
  dbLocalPass: 'MONGODB_LOCAL_PASS',
  smtp: {
    host: 'EMAIL_HOST',
    pass: 'EMAIL_PASS',
    port: 'EMAIL_PORT',
    user: 'EMAIL_USER',
  },
  refreshPrivateKey: 'JWT_PRIVATE_REFRESH_TOKEN',
  refreshPublicKey: 'JWT_PUBLIC_REFRESH_TOKEN',
  accessPrivateKey: 'JWT_PRIVATE_ACCESS_TOKEN',
  accessPublicKey: 'JWT_PUBLIC_ACCESS_TOKEN',

  googleClientId: 'GOOGLE_OAUTH_CLIENT_ID',
  googleClientSecret: 'GOOGLE_OAUTH_CLIENT_SECRET',
  googleOauthRedirect: 'GOOGLE_OAUTH_REDIRECT_URL',

  githubClientId: 'GITHUB_OAUTH_CLIENT_ID',
  githubClientSecret: 'GITHUB_OAUTH_CLIENT_SECRET',
  githubOauthRedirect: 'GITHUB_OAUTH_REDIRECT_URL',

  awsBucketName: 'AWS_BUCKET_NAME',
};
