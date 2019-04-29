# BitMex Account Report and Control

Instructions for configuring the BitMex Account Report and Control (aka "**the BARC**") are summarized below.

## Account Name

Store email account of your BitMex account in a file called **bitmexaccouts.json**. Do not include the domain. For example, if you registered your account with BitMex as usefulcoin@gmail.com, the **bitmexaccouts.json** files should contain the array below:

```json
["usefulcoin"]
```

## Account Credentials

Store account credentials for your BitMex account in dotfile that you export to the environment upon login. For example, if your account name (see "Account Name" section above) is "usefulcoin", then your credentials should look like:

```bash
usefulcoin_api_key=XXXXXXXXXXXXXXXXX
usefulcoin_api_secret=XXXXXXXXXXXXXX
```

## Exporting Credentials

Amend your **.profile** dotfile in order to have your BitMex account credentials already set in the environment upon login. For example, if you stored credentials in a dotfile called "usefulcoin-com-bitmex-api-credentials" in your home directory, then you'd want to append the following lines to the end of your **.profile**:

```bash

# export BitMex API credentials to environment
export $(find ~/.*usefulcoin-com-bitmex-api-credentials -exec cat {} \;)
```

## REST API Calls

Use the node-fetch module to make REST API calls. You also need the qs module to stringify request query strings. Add both to the list of dependencies by issuing the following command:

```bash
yarn add node-fetch
yarn add qs
```
