export const mainLayout = `
digraph  {
graph [pad="0.2", nodesep="2", ranksep="2", fontname="calibri"];
node [shape=plain, fontname="calibri", style="rounded"]
edge [fontname="calibri"];
stylesheet="sample.css"

{{#each tables}}
    {{name}} [label=<
    <table border="0" cellspacing="0" cellpadding="2" style="rounded">
    <tr><td colspan="3" cellpadding="5" bgcolor="#0063ae"><b><font color="white">{{name}}</font></b></td></tr>
    {{#each fields}}
        <tr ><td port="{{@index}}" bgcolor="{{rowBgColor}}">{{primaryKey}}</td><td align="left" bgcolor="{{rowBgColor}}">  {{name}}  </td><td align="left" bgcolor="{{rowBgColor}}"><font color="#5c5c5c">  {{type}}  </font></td></tr>
    {{/each}}
    </table>>];
{{/each}}

{{#each relationships}}
    {{fromTableName}}:{{fromFieldIndex}} -> {{toTableName}}:{{toFieldIndex}} [taillabel="  {{fromRelationshipType}}  "; headlabel="  {{toRelationshipType}}  "; arrowhead=none];
{{/each}}
}
`;
