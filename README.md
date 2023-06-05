# Prisma Entity Relationship Diagram Generator

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-15-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Prisma generator to create an ER Diagram every time you generate your prisma client.

> Like this tool? [@Skn0tt](https://github.com/Skn0tt) started this effort with his [web app ER diagram generator](https://prisma-erd.simonknott.de/)

```bash
npm i -D prisma-erd-generator @mermaid-js/mermaid-cli
# or
yarn add -D prisma-erd-generator @mermaid-js/mermaid-cli
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

## Versions

-   Prisma >= 4 use 1.x.x
-   Prisma <4 use 0.11.x

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

### mmdcPath

In order for this generator to succeed you must have `mmdc` installed. This is the mermaid cli tool that is used to generate the ERD. By default the generator searches for an existing binary file at `/node_modules/.bin`. If it fails to find that binary it will run `find ../.. -name mmdc` to search through your folder for a `mmdc` binary. If you are using a different package manager or have a different location for your binary files, you can specify the path to the binary file.

```prisma
generator erd {
  provider = "prisma-erd-generator"
  theme = "forest"
  mmdcPath = "node_modules/.bin"
}
```

### Disabled

You won't always need to generate a new ERD. For instance, when you are building your docker containers you often run `prisma generate` and if this generator is included, odds are you aren't relying on an updated ERD inside your docker container. It also adds additional space to the container because of dependencies such as puppeteer. To disabled running this generator just add an environment variable to the environment running `prisma generate`.

```bash
DISABLE_ERD=true
```

Another option used is to remove the generator lines from your schema before installing dependencies and running the `prisma generate` command. I have used `sed` to remove the lines the generator is located on in my `schema.prisma` file to do so. Here is an example of the ERD generator being removed on lines 5-9 in a dockerfile.

```dockerfile
# remove and replace unnecessary generators (erd generator)
# Deletes lines 5-9 from prisma/schema.prisma
RUN sed -i '5,9d' prisma/schema.prisma
```

### Debugging

If you have issues with generating or outputting an ERD as expected, you may benefit from seeing output of the steps to making your ERD. Enable debugging by either adding the following environment variable

```bash
ERD_DEBUG=true
```

or adding in the debug configuration key set to `true`

```prisma
generator erd {
  provider = "prisma-erd-generator"
  erdDebug = true
}
```

and re-running `prisma generate`. You should see a directory and files created labeling the steps to create an ER diagram under `prisma/debug`.

Please use these files as part of opening an issue if you run into problems.

### Table only mode

Table mode only draws your models and skips the attributes and columns associated with your table. This feature is helpful for when you have lots of table columns and they are less helpful than seeing the tables and their relationships

```prisma
generator erd {
  provider = "prisma-erd-generator"
  tableOnly = true
}
```

### Ignore enums

If you enable this option, enum entities will be hidden.
This is useful if you want to reduce the number of entities and focus on the tables and their columns and relationships.

```prisma
generator erd {
  provider = "prisma-erd-generator"
  ignoreEnums = true
}
```

### Include relation from field

By default this module skips relation fields in the result diagram. For example fields `userId` and `productId` will not be generated from this prisma schema.

```prisma
model User {
  id            String         @id
  email         String
  favoriteProducts  FavoriteProducts[]
}


model Product {
  id              String        @id
  title           String
  inFavorites  FavoriteProducts[]
}

model FavoriteProducts {
  userId      String
  user        User    @relation(fields: [userId], references: [id])
  productId   String
  product     Product @relation(fields: [productId], references: [id])

  @@id([userId, productId])
}

```

It can be useful to show them when working with RDBMS. To show them use `includeRelationFromFields = true`

```prisma
generator erd {
  provider = "prisma-erd-generator"
  includeRelationFromFields = true
}
```

## Issues

Because this package relies on [mermaid js](https://mermaid.js.org/) and [puppeteer](https://pptr.dev/) issues often are opened that relate to those libraries causing issues between different versions of Node.js and your operating system. As a fallback, if you are one of those people not able to generate an ERD using this generator, try running the generator to output a markdown file `.md` first. Trying to generate a markdown file doesn't run into puppeteer to represent the contents of a mermaid drawing in a browser and often will succeed. This will help get you a functioning ERD while troubleshooting why puppeteer is not working for your machine. Please open an issue if you have any problems or suggestions.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/keonik"><img src="https://avatars.githubusercontent.com/u/46365891?v=4?s=100" width="100px;" alt="John Fay"/><br /><sub><b>John Fay</b></sub></a><br /><a href="#maintenance-keonik" title="Maintenance">🚧</a> <a href="https://github.com/keonik/prisma-erd-generator/commits?author=keonik" title="Code">💻</a> <a href="#ideas-keonik" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/keonik/prisma-erd-generator/issues?q=author%3Akeonik" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://jonas-strassel.de/"><img src="https://avatars.githubusercontent.com/u/4662748?v=4?s=100" width="100px;" alt="Jonas Strassel"/><br /><sub><b>Jonas Strassel</b></sub></a><br /><a href="https://github.com/keonik/prisma-erd-generator/issues?q=author%3Aboredland" title="Bug reports">🐛</a> <a href="https://github.com/keonik/prisma-erd-generator/commits?author=boredland" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://heystevegray.dev/"><img src="https://avatars.githubusercontent.com/u/66500112?v=4?s=100" width="100px;" alt="Steve Gray"/><br /><sub><b>Steve Gray</b></sub></a><br /><a href="https://github.com/keonik/prisma-erd-generator/commits?author=heystevegray" title="Code">💻</a> <a href="#ideas-heystevegray" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://blog.trailimage.com/"><img src="https://avatars.githubusercontent.com/u/6289308?v=4?s=100" width="100px;" alt="Jason Abbott"/><br /><sub><b>Jason Abbott</b></sub></a><br /><a href="https://github.com/keonik/prisma-erd-generator/issues?q=author%3AJason-Abbott" title="Bug reports">🐛</a> <a href="https://github.com/keonik/prisma-erd-generator/commits?author=Jason-Abbott" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://bradbit.com/"><img src="https://avatars.githubusercontent.com/u/20225909?v=4?s=100" width="100px;" alt="Manuel Maute"/><br /><sub><b>Manuel Maute</b></sub></a><br /><a href="https://github.com/keonik/prisma-erd-generator/issues?q=author%3Ajsbrain" title="Bug reports">🐛</a> <a href="https://github.com/keonik/prisma-erd-generator/commits?author=jsbrain" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://homerjam.es/"><img src="https://avatars.githubusercontent.com/u/1055769?v=4?s=100" width="100px;" alt="James Homer"/><br /><sub><b>James Homer</b></sub></a><br /><a href="https://github.com/keonik/prisma-erd-generator/commits?author=homerjam" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://janpiotrowski.de"><img src="https://avatars.githubusercontent.com/u/183673?v=4?s=100" width="100px;" alt="Jan Piotrowski"/><br /><sub><b>Jan Piotrowski</b></sub></a><br /><a href="https://github.com/keonik/prisma-erd-generator/issues?q=author%3Ajanpio" title="Bug reports">🐛</a> <a href="https://github.com/keonik/prisma-erd-generator/commits?author=janpio" title="Code">💻</a> <a href="https://github.com/keonik/prisma-erd-generator/pulls?q=is%3Apr+reviewed-by%3Ajanpio" title="Reviewed Pull Requests">👀</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://lukevers.com/"><img src="https://avatars.githubusercontent.com/u/1558388?v=4?s=100" width="100px;" alt="Luke Evers"/><br /><sub><b>Luke Evers</b></sub></a><br /><a href="https://github.com/keonik/prisma-erd-generator/commits?author=lukevers" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ripry"><img src="https://avatars.githubusercontent.com/u/59201481?v=4?s=100" width="100px;" alt="rikuyam"/><br /><sub><b>rikuyam</b></sub></a><br /><a href="https://github.com/keonik/prisma-erd-generator/commits?author=ripry" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/francismanansala"><img src="https://avatars.githubusercontent.com/u/10519099?v=4?s=100" width="100px;" alt="Francis Manansala"/><br /><sub><b>Francis Manansala</b></sub></a><br /><a href="https://github.com/keonik/prisma-erd-generator/issues?q=author%3Afrancismanansala" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Vitalii4as"><img src="https://avatars.githubusercontent.com/u/71256742?v=4?s=100" width="100px;" alt="Vitalii Yarmus"/><br /><sub><b>Vitalii Yarmus</b></sub></a><br /><a href="https://github.com/keonik/prisma-erd-generator/commits?author=Vitalii4as" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/balzafin"><img src="https://avatars.githubusercontent.com/u/4311269?v=4?s=100" width="100px;" alt="Petri Julkunen"/><br /><sub><b>Petri Julkunen</b></sub></a><br /><a href="https://github.com/keonik/prisma-erd-generator/issues?q=author%3Abalzafin" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/dznbk"><img src="https://avatars.githubusercontent.com/u/46421953?v=4?s=100" width="100px;" alt="D-PONTARO"/><br /><sub><b>D-PONTARO</b></sub></a><br /><a href="https://github.com/keonik/prisma-erd-generator/commits?author=dznbk" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/stephenramthun"><img src="https://avatars.githubusercontent.com/u/4243438?v=4?s=100" width="100px;" alt="Stephen Ramthun"/><br /><sub><b>Stephen Ramthun</b></sub></a><br /><a href="https://github.com/keonik/prisma-erd-generator/commits?author=stephenramthun" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.chintristan.io/"><img src="https://avatars.githubusercontent.com/u/23557893?v=4?s=100" width="100px;" alt="Tristan Chin"/><br /><sub><b>Tristan Chin</b></sub></a><br /><a href="https://github.com/keonik/prisma-erd-generator/commits?author=maxijonson" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
