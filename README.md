# Prisma Entity Relationship Diagram Generator

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

Prisma generator to create an ER Diagram every time you generate your prisma client.

> Like this tool? [@Skn0tt](https://github.com/Skn0tt) started this effort with his [web app ER diagram generator](https://prisma-erd.simonknott.de/)

```bash
npm i -D prisma-erd-generator
# or
yarn add -D prisma-erd-generator
```

Add to your `schema.prisma`

```prisma
generator erd {
  provider = "prisma-erd-generator"
}
```

Run the generator

```bash
npx prisma generate
```

![Example ER Diagram](https://raw.githubusercontent.com/keonik/prisma-erd-generator/main/ERD.svg)

## Options

Additional configuration

### Output

Change output type and location

Usage

```prisma
generator erd {
  provider = "prisma-erd-generator"
  output = "../ERD.svg"
}
```

Extensions

-   svg (default: `./prisma/ERD.svg`)
-   png
-   pdf
-   md

### Theme

Theme selection

Usage

```prisma
generator erd {
  provider = "prisma-erd-generator"
  theme = "forest"
}
```

Options

-   default (default)
-   forest
-   dark
-   neutral

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/keonik"><img src="https://avatars.githubusercontent.com/u/46365891?v=4?s=100" width="100px;" alt=""/><br /><sub><b>John Fay</b></sub></a><br /><a href="#maintenance-keonik" title="Maintenance">🚧</a> <a href="https://github.com/keonik/prisma-erd-generator/commits?author=keonik" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
