# Prisma Entity Relationship Diagram Generator

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-8-orange.svg?style=flat-square)](#contributors-)

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
    <td align="center"><a href="https://github.com/keonik"><img src="https://avatars.githubusercontent.com/u/46365891?v=4?s=100" width="100px;" alt=""/><br /><sub><b>John Fay</b></sub></a><br /><a href="#maintenance-keonik" title="Maintenance">🚧</a> <a href="https://github.com/keonik/prisma-erd-generator/commits?author=keonik" title="Code">💻</a> <a href="#ideas-keonik" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/keonik/prisma-erd-generator/issues?q=author%3Akeonik" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://jonas-strassel.de/"><img src="https://avatars.githubusercontent.com/u/4662748?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jonas Strassel</b></sub></a><br /><a href="https://github.com/keonik/prisma-erd-generator/issues?q=author%3Aboredland" title="Bug reports">🐛</a> <a href="https://github.com/keonik/prisma-erd-generator/commits?author=boredland" title="Code">💻</a></td>
    <td align="center"><a href="https://heystevegray.dev/"><img src="https://avatars.githubusercontent.com/u/66500112?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Steve Gray</b></sub></a><br /><a href="https://github.com/keonik/prisma-erd-generator/commits?author=heystevegray" title="Code">💻</a> <a href="#ideas-heystevegray" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://blog.trailimage.com/"><img src="https://avatars.githubusercontent.com/u/6289308?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jason Abbott</b></sub></a><br /><a href="https://github.com/keonik/prisma-erd-generator/issues?q=author%3AJason-Abbott" title="Bug reports">🐛</a> <a href="https://github.com/keonik/prisma-erd-generator/commits?author=Jason-Abbott" title="Code">💻</a></td>
    <td align="center"><a href="https://bradbit.com/"><img src="https://avatars.githubusercontent.com/u/20225909?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Manuel Maute</b></sub></a><br /><a href="https://github.com/keonik/prisma-erd-generator/issues?q=author%3Ajsbrain" title="Bug reports">🐛</a> <a href="https://github.com/keonik/prisma-erd-generator/commits?author=jsbrain" title="Code">💻</a></td>
    <td align="center"><a href="https://homerjam.es/"><img src="https://avatars.githubusercontent.com/u/1055769?v=4?s=100" width="100px;" alt=""/><br /><sub><b>James Homer</b></sub></a><br /><a href="https://github.com/keonik/prisma-erd-generator/commits?author=homerjam" title="Code">💻</a></td>
    <td align="center"><a href="https://janpiotrowski.de"><img src="https://avatars.githubusercontent.com/u/183673?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jan Piotrowski</b></sub></a><br /><a href="https://github.com/keonik/prisma-erd-generator/issues?q=author%3Ajanpio" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://lukevers.com/"><img src="https://avatars.githubusercontent.com/u/1558388?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Luke Evers</b></sub></a><br /><a href="https://github.com/keonik/prisma-erd-generator/commits?author=lukevers" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
