<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Path Intersections</title>
    <link rel="stylesheet" href="../css/style.css">
    <script type="text/javascript" src="./paper-full.js"></script>
    <script type="text/paperscript" canvas="canvas">
        // Imported SVG Groups have their applyMatrix flag turned off by
        // default. This is required for SVG importing to work correctly. Turn
        // it on now, so we don't have to deal with nested coordinate spaces.
        var words = project.importSVG(document.getElementById('svg'));
        words.visible = true; // Turn off the effect of display:none;
        words.fillColor = null;
        words.strokeColor = 'black';
        var yesGroup = words.children.yes;

        var noGroup = words.children.no;
        // Resize the words to fit snugly inside the view:
        words.fitBounds(view.bounds);
        words.scale(0.8);

        yesGroup.position = view.center;
        noGroup.position = [-900, -900];

        function onMouseMove(event) {
            noGroup.position = event.point;
            for (var i = 0; i < yesGroup.children.length; i++) {
                for (var j = 0; j < noGroup.children.length; j++) {
                    showIntersections(noGroup.children[j], yesGroup.children[i])
                }
            }
        }

        function showIntersections(path1, path2) {
            var intersections = path1.getIntersections(path2);
            for (var i = 0; i < intersections.length; i++) {
                new Path.Circle({
                    center: intersections[i].point,
                    radius: 5,
                    fillColor: '#009dec'
                }).removeOnMove();
            }
        }
    </script>
</head>
<body>
<canvas id="canvas" resize></canvas>
<svg xmlns="http://www.w3.org/2000/svg"
         xmlns:xlink="http://www.w3.org/1999/xlink"
         height="600" width="600" id="svg" style="display:none">
<g id="yes">
    <path d="M427.151,85.781h27.331l-38.608,72.151v43.283h-24.121v-43.283l-39.94-72.151h28.428l23.964,50.277L427.151,85.781z"/>
    <path d="M553.467,106.221h-61.084v24.512h56.073v20.048h-56.073v29.681h63.905v20.753H468.81V85.781h84.657V106.221z"/>
    <path d="M592.307,165.583c0.746,5.274,2.213,9.215,4.396,11.826c3.998,4.751,10.848,7.126,20.551,7.126
        c5.811,0,10.529-0.626,14.152-1.88c6.877-2.4,10.316-6.864,10.316-13.392c0-3.811-1.686-6.761-5.053-8.849
        c-3.371-2.036-8.713-3.837-16.027-5.404l-12.498-2.741c-12.283-2.714-20.721-5.664-25.314-8.849
        c-7.779-5.326-11.668-13.652-11.668-24.982c0-10.337,3.805-18.925,11.414-25.765c7.611-6.839,18.789-10.259,33.537-10.259
        c12.312,0,22.816,3.224,31.512,9.671c8.693,6.449,13.252,15.807,13.676,28.076h-23.182c-0.428-6.943-3.531-11.877-9.312-14.801
        c-3.855-1.931-8.645-2.897-14.371-2.897c-6.369,0-11.455,1.253-15.254,3.759c-3.801,2.506-5.701,6.004-5.701,10.494
        c0,4.125,1.873,7.205,5.621,9.241c2.408,1.358,7.52,2.95,15.336,4.777l20.258,4.777c8.879,2.089,15.533,4.882,19.965,8.379
        c6.881,5.431,10.32,13.288,10.32,23.572c0,10.547-4.076,19.305-12.23,26.274c-8.152,6.97-19.67,10.455-34.551,10.455
        c-15.197,0-27.15-3.433-35.857-10.298c-8.707-6.865-13.061-16.302-13.061-28.311H592.307z"/>
</g>
<g id="no">
    <path d="M400.993,246.168h25.287l45.821,80.49v-80.49h22.476v115.435h-24.115l-46.993-81.906v81.906h-22.476V246.168z"/>
    <path d="M605.936,351.343c-8.721,8.98-21.33,13.471-37.826,13.471c-16.498,0-29.107-4.49-37.824-13.471
        c-11.697-11.016-17.542-26.887-17.542-47.615c0-21.144,5.845-37.015,17.542-47.614c8.717-8.979,21.326-13.47,37.824-13.47
        c16.496,0,29.105,4.491,37.826,13.47c11.641,10.6,17.463,26.47,17.463,47.614C623.398,324.457,617.576,340.328,605.936,351.343z
         M590.859,333.801c5.611-7.048,8.418-17.072,8.418-30.073c0-12.947-2.807-22.958-8.418-30.033
        c-5.613-7.074-13.195-10.611-22.75-10.611s-17.178,3.524-22.867,10.572c-5.691,7.048-8.537,17.072-8.537,30.072
        c0,13.001,2.846,23.025,8.537,30.073c5.689,7.048,13.312,10.572,22.867,10.572S585.246,340.849,590.859,333.801z"/>
</g>
</svg>
</body>
</html>
