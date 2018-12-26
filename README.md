# Geek's Diary

[![Build Status](https://img.shields.io/travis/seokju-na/geeks-diary.svg?style=flat-square
)](https://travis-ci.org/seokju-na/geeks-diary)

TIL writing tool for geek.

Geek's Diary is [Electron](https://electronjs.org)-based app. It is written [Typescript](http://www.typescriptlang.org/) and uses [Angular](https://angular.io).

![Main Screenshot](https://user-images.githubusercontent.com/13250888/50434040-1f94ea80-091f-11e9-86f8-298bce529b40.png)


## 🚀 Beta releases

You can download the installer from [Github Releases](https://github.com/seokju-na/geeks-diary/releases).

Currently, only macOS is supported. The official version (v1.0.0) will also support Windows.

AutoUpdater is omitted from beta release. When a new version is released, you will need to update it manually.


## Features

- Developer-friendly markdown editor
- Version control system integrated
- Contribute measurement (with Commit) appears on the calendar
- Mark development stack icons in notes
 

## Development

### Requirements

- node.js@~8.12 [https://nodejs.org/en/download/](https://nodejs.org/en/download/)
- yarn@>=1.9 [https://yarnpkg.com/en/docs/install](https://yarnpkg.com/en/docs/install)


### Project setup

Fork the project [on GitHub](https://github.com/seokju-na/geeks-diary) and clone your fork locally.

```bash
git clone git@gitnub.com:username/geeks-diary.git
cd geeks-diary

git remote add upstream https://github.com/seokju-na/geeks-diary.git
git fetch upstream

yarn install
```


### Starting

```bash
yarn serve:browser:app
yarn serve:browser:wizard
yarn serve:main-process

// After build completed.

yarn start
```

### Test

```bash
yarn test
```


## License

MIT Licensed
