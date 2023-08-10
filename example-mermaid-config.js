/** @type {import('mermaid').MermaidConfig} */
const config = {
    deterministicIds: true,
    maxTextSize: 90000,
    er: {
        /**
         * When this flag is set to `true`, the height and width is set to 100%
         * and is then scaled with the available space.
         * If set to `false`, the absolute space required is used.
         *
         */
        useMaxWidth: false,
    },
    theme: 'forest',
};

module.exports = config;
