# Prisma Entity Relationship Diagram Generator

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

### Changing path to `node_modules`

If your project is nested inside a directory and your `node_modules` are at a higher level you can provide a path to get it working

```prisma
generator erd {
  provider = "prisma-erd-generator"
  nodeModulePath = "../node_modules"
}
```

default: `node_modules`
