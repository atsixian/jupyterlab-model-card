

class Graph {

    constructor(vertices) {
        this.vertices = vertices;
        this.edge = new Array(vertices+1);
        var i;
        for (i = 0; i <= vertices; i++) {
            this.edge[i] = [];
        }
        //console.log(this.edge);
    }

    addEdge(a, b) {
        this.edge[a].push(b);
    }

    storeDFS(node, adj, dp, visited, last_node) {
        visited[node] = true;
        var i;
        for (i = 0; i < adj[node].length; i++) {
            if (!visited[adj[node][i]]) {
                last_node.push([node, adj[node][i]]);
                this.storeDFS(adj[node][i], adj, dp, visited, last_node);
            }
            dp[node] = Math.max(dp[node], 1 + dp[adj[node][i]])
        }
        return last_node;
    }

    findLongestPathSrc(n, src) {
        var adj = this.edge;
        var dp = new Array(n+1).fill(0);
        var visited = new Array(n+1).fill(false);
        var last_node = [];

        var i;

        this.storeDFS(src, adj, dp, visited, last_node);
        var ans = 0;
        for (i = 1; i <= n; i++) {
            ans = Math.max(ans, dp[i]);
        }
        // first one is total traversal length, second one is last node
        var max = last_node.reduce(function(a, b) {
            return [0, Math.max(a[1], b[1])];
        });

        return [last_node, max[1]];
    }


}


// Now have to actually draw graph from visited nodes Order

/**

var n = 5;
var graph = new Graph(n);
    // Example-1
graph.addEdge( 1, 2);
graph.addEdge( 1, 3);
graph.addEdge( 3, 2);
graph.addEdge( 2, 4);
graph.addEdge( 3, 4);
graph.addEdge(4,5);
console.log(graph.edge);
answer = graph.findLongestPathSrc(5, 1);
console.log("Order visited: ", answer[0]);
console.log("Max node visited: ", answer[1])


 **/


module.exports = {
    Graph: Graph
}