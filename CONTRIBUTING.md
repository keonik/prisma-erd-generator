# Contributing

:+1::tada: First off, thanks for taking the time to contribute! :tada::+1:

## Bug Reporting

Check to make sure your bug is not already in an [issue](https://github.com/keonik/prisma-erd-generator/issues)

When creating an issue try to document all relevant troubleshooting information. With prisma it helps to know things like

-   OS
-   Node version
-   Output related to error
-   Explanation of steps to get error

## Developing

To develop locally:

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your
   own GitHub account and then
   [clone](https://help.github.com/articles/cloning-a-repository/) it to your
   local device.
2. Create a new branch:
    ```
    git checkout -b MY_BRANCH_NAME
    ```
3. Install dependencies
    ```
    npm install
    ```
4. Start developing and watch for code changes:
    ```
    npm run dev
    ```

## Enabling Debugging

You may benefit from seeing logs of the steps to making your ERD. Enable debugging by adding the following environment variable and re-running `prisma generate`.

```bash
ERD_DEBUG=true
```

## Submitting a Pull Request(PR)

Once your code is commited and you are ready to open a PR for review, please link the issue you are solving in this commit to provide details on how to test your contribution.

We also use [all-contributors](https://allcontributors.org/docs/en/overview) to showcase our contributors. Feel free to add yourself to the contributors by running

```bash
npx all-contributors add keonik code
```

where the `keonik` is your github username and the `code` is your contribution type from the list provided on all-contributors [emoji keys](https://allcontributors.org/docs/en/emoji-key).

## Testing

```
npm run test
```

Run only tests with string `many`:

```
npm run test --t many
```

## Publishing

Repository maintainers can use `npm run release` to publish a new version.
