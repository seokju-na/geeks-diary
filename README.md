# Geek's Diary

[![Build Status](https://img.shields.io/travis/seokju-na/geeks-diary.svg?style=flat-square
)](https://travis-ci.org/seokju-na/geeks-diary)

TIL writing tool for geek.

Geek's Diary is [Electron](https://electronjs.org)-based app. It is written [Typescript](http://www.typescriptlang.org/) and uses [Angular](https://angular.io).

**Under-Development**

Screenshot at Oct, 15 2018:
![Screenshot-indevelopment](https://user-images.githubusercontent.com/13250888/46998648-1e488400-d15e-11e8-9627-2a9177a57c99.png)

Screenshot at Dec, 15 2018:
![Screenshot-indevelopment-2](https://user-images.githubusercontent.com/13250888/50042408-9f13f580-00a5-11e9-87e3-1625a37263cd.png)

## Development

### Requirements

- node.js@>=8 [https://nodejs.org/en/download/](https://nodejs.org/en/download/)
- yarn@>=1.5 [https://yarnpkg.com/en/docs/install](https://yarnpkg.com/en/docs/install)


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
