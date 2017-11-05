# legtv
[![Build Status](https://travis-ci.org/calimaborges/legtv.svg?branch=master)](https://travis-ci.org/calimaborges/legtv)

Unofficial Legendas TV CLI.


## Development run

```bash
yarn start "the walking dead"
rm *.srt                            # remove all subtitiles from dir since it downloads to current dir.
```

## Build

```bash
yarn build
```

An executable will be built inside `releases` folder. Run with `releases/legtv "the walking dead"`

## Test

```bash
LEGENDAS_TV_USERNAME=<username> LEGENDAS_TV_PASSWORD=<password> yarn test
```

## Release

```bash
npm version patch | minor | major && npm publish && yarn release
```