# Geek's Diary

[![Build Status](https://img.shields.io/travis/seokju-na/geeks-diary.svg?style=flat-square)](https://travis-ci.org/seokju-na/geeks-diary)

Geek's Diary is markdown editor with version control system integrated. It helps programmers to write TIL(Today I Learned). 

![Main Screenshot](https://user-images.githubusercontent.com/13250888/50562835-00e98600-0d5b-11e9-8d23-76b267a0fbf0.png)


## 🚀 Beta releases

You can download the installer from [Github Releases](https://github.com/seokju-na/geeks-diary/releases).

Currently, only macOS is supported. The official version (v1.0.0) will also support Windows.

AutoUpdater is omitted from beta release. When a new version is released, you will need to update it manually.


## Features

### Mix markdown with code

![gd1](https://user-images.githubusercontent.com/13250888/50505408-bea01a80-0ab6-11e9-9b03-0d8783a9544a.gif)

A note in Geek's Diary is comprised of snippets (markdown, code). You can freely mix different snippet types within one note.

### Categorize your note with development stack

![gd2](https://user-images.githubusercontent.com/13250888/50505409-bea01a80-0ab6-11e9-80cf-80fd1710a5c1.gif)

Geek's Diary is for programmers. You can categorize your note with numerous development stacks (from [konpa/devicon](https://github.com/konpa/devicon)).

### Contribute measurement

![gd3](https://user-images.githubusercontent.com/13250888/50505410-bea01a80-0ab6-11e9-9794-33d6cadb64b8.gif)

Geek's Diary measures contribution with commit counts in a day. You can look your contribution level with grass UI in calendar. Similar with github!

### Version Control System integrated

![gd4](https://user-images.githubusercontent.com/13250888/50505412-bea01a80-0ab6-11e9-8956-aece539158bd.gif)

Control your version with powerful VCS -- We currently supports git. Geek's Diary tracks your file changes from workspace, and you can committed it.

### Sync with remote repository

![gd5](https://user-images.githubusercontent.com/13250888/50505413-bf38b100-0ab6-11e9-8d2f-6a1c8725c6cd.gif)
 
Thanks to the integration of the version control system, you can sync your workspace with remote repository. Log in to github and sync your TILs.
 

 
## Plan

These are v1.0.0 features.

- [ ] Auto Updater #124
- [ ] Release win32 platform
- [ ] Performance issue for note editor #113


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


## Contributing

❤️ Thanks for your interest!

If you have suggestions for how this project could be improved, or want to report a bug, open an issue! We'd love all and any contributions. If you have questions, too, we'd love to hear them.

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.


## License

MIT Licensed
