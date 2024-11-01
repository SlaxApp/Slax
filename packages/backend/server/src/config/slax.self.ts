/* eslint-disable @typescript-eslint/no-non-null-assertion */
// Custom configurations for Slax Cloud
// ====================================================================================
// Q: WHY THIS FILE EXISTS?
// A: Slax deployment environment may have a lot of custom environment variables,
//    which are not suitable to be put in the `Slax.ts` file.
//    For example, Slax Cloud Clusters are deployed on Google Cloud Platform.
//    We need to enable the `gcloud` plugin to make sure the nodes working well,
//    but the default selfhost version may not require it.
//    So it's not a good idea to put such logic in the common `Slax.ts` file.
//
//    ```
//    if (Slax.deploy) {
//      Slax.plugins.use('gcloud');
//    }
//    ```
// ====================================================================================
const env = process.env;

Slax.metrics.enabled = !Slax.node.test;

if (env.R2_OBJECT_STORAGE_ACCOUNT_ID) {
  Slax.plugins.use('cloudflare-r2', {
    accountId: env.R2_OBJECT_STORAGE_ACCOUNT_ID,
    credentials: {
      accessKeyId: env.R2_OBJECT_STORAGE_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_OBJECT_STORAGE_SECRET_ACCESS_KEY!,
    },
  });
  Slax.storage.storages.avatar.provider = 'cloudflare-r2';
  Slax.storage.storages.avatar.bucket = 'account-avatar';
  Slax.storage.storages.avatar.publicLinkFactory = key =>
    `https://avatar.Slaxassets.com/${key}`;

  Slax.storage.storages.blob.provider = 'cloudflare-r2';
  Slax.storage.storages.blob.bucket = `workspace-blobs-${
    Slax.Slax.canary ? 'canary' : 'prod'
  }`;

  Slax.storage.storages.copilot.provider = 'cloudflare-r2';
  Slax.storage.storages.copilot.bucket = `workspace-copilot-${
    Slax.Slax.canary ? 'canary' : 'prod'
  }`;
}

Slax.plugins.use('copilot', {
  openai: {},
  fal: {},
});
Slax.plugins.use('redis');
Slax.plugins.use('payment', {
  stripe: {
    keys: {
      // fake the key to ensure the server generate full GraphQL Schema even env vars are not set
      APIKey: '1',
      webhookKey: '1',
    },
  },
});
Slax.plugins.use('oauth');

if (Slax.deploy) {
  Slax.mailer = {
    service: 'gmail',
    auth: {
      user: env.MAILER_USER,
      pass: env.MAILER_PASSWORD,
    },
  };

  Slax.plugins.use('gcloud');
}
