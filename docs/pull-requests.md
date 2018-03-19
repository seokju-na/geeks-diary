# Pull Requests


## Fork

Fork the project [on GitHub](https://github.com/seokju-na/geeks-diary) and clone your fork locally.

```bash
git clone git@gitnub.com:username/geeks-diary.git
cd geeks-diary
git remote add upstream https://github.com/seokju-na/geeks-diary.git
git fetch upstream
```


## Commit

It is recommended to keep your changes grouped logically within individual commits. Many contributors find it easier to review changes that are split across multiple commits. There is no limit to the number of commits in a pull request.


### Commit message guidelines

Follow [this article](https://chris.beams.io/posts/git-commit/).


1. Separate subject from body with a blank line
2. Limit the subject line to 50 characters
3. Capitalize the subject line
4. Do not end the subject line with a period
5. Use the imperative mood in the subject line
6. Wrap the body at 72 characters
7. Use the body to explain what and why vs. how



## Rebase

Once you have committed your changes, it is a good idea to use ``git rebase`` (not ``git merge``) to synchronize your work with the main repository.

```bash
git fetch upstream
git rebase upstream/master
```


## Test

Bug fixes and features should always come with tests.
Looking at other tests to see how they should be structured can help.

Before submitting your changes in a pull request, always run the full test suite. To run the tests:

```bash
npm run test
```


## Continuous Integration Testing

Every pull request is tested on the Continuous Integration (CI) system.

Ideally, the pull request will pass ("be green") on all of CI's platforms. This means that all tests pass and there are no linting errors.
