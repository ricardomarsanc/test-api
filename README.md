## Node.js API

### VSC Config

You'll notice that there are some extra settings for this project. They are only necessary in case you do
have the Jest extension for VSC installed and the `autoRun` properties `watch`, `onStart` or `onSave` enabled.

This will cause an overlapping when you use the `npm run test:watch` script and you save changes in your
test file to re-run tests, since the Jest runner will execute tests both in the console and in the editor, 
so you will receive an error with the PORT setup since it will be in use by supertest in the other space.

If you don't have the Jest extension or the `autoRun` always disabled, don't worry at all. For more info,
check [VSC-Jest extension GitHub page](https://github.com/jest-community/vscode-jest#getting-started)