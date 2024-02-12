# graph-visualizer
Graph visualization tool

## Distributive usage

To open application - open file [dist/web/index.html](dist/web/index.html)

To create svg chart from command line
```
node dist/cli/svg-tree-chart.js path/to/source.xml path/to/dest.svg
`````
or 
```
node dist/cli/svg-tree-chart.js path/to/source.xml
````

file "path/to/source.xml.svg" will be created 



## Development
### install live server and development environment

```
npm i
```

### start live server (for dev purposes)
`````
npm start
``````

[Application will be available on port 3000](http://localhost:3000)

## in development environment

### Create file from command line
`````
node src/cli/svg-tree-chart.mjs path/to/source.xml path/to/dest.svg
`````
or 
```
node src/cli/svg-tree-chart.mjs path/to/source.xml
````
file "path/to/source.xml.svg" will be created 