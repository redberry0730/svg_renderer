export class SVGRenderer {
    constructor(sceneInfo, image) {
        this.scene = sceneInfo;
        this.image = image;
        // clear image all white
        for (let i = 0; i < image.data.length; i++) {
            image.data[i] = 255;
        }
    }
    //from textbook
    lerp(i0, d0, i1, d1) {
        if (i0 == i1) {
            return [d0];
        }
        let values = [];
        let a = (d1 - d0) / (i1 - i0);
        let d = d0;
        for (let i = i0; i <= i1; i++) {
            values.push(Math.round(d));
            d = d + a;
        }
        return values;
    }

    blendPixel(row, col, r, g, b, alpha) {
        /*
        Update one pixel in the image array. (r,g,b) are 0-255 color values.
        */
        if (Math.round(row) != row) {
            console.error("Cannot put pixel in fractional row");
            return;
        }
        if (Math.round(col) != col) {
            console.error("Cannot put pixel in fractional col");
            return;
        }
        if (row < 0 || row >= this.image.height) {
            return;
        }
        if (col < 0 || col >= this.image.width) {
            return;
        }

        const i = 4 * (this.image.width * row + col);
        let R = Math.round(alpha*r + (1 - alpha) * this.image.data[i + 0]);
        let G = Math.round(alpha*g + (1 - alpha) * this.image.data[i + 1]);
        let B = Math.round(alpha*b + (1 - alpha) * this.image.data[i + 2]);
        this.image.data[i + 0] = R;
        this.image.data[i + 1] = G;
        this.image.data[i + 2] = B;
        this.image.data[i + 3] = 255;
    }

    // draw with alpha
    Alphadrawlines(points, color, alpha) {
        //convert world to pixel first, and then calculate line between 

        for (let i = 0; i < (points.length - 2); i = i + 2) {

            let parsedPoint0 = parsePoints(String(points.slice(i, i + 2)));
            let parsedPoint1 = parsePoints(String(points.slice(i + 2, i + 4)));
            let [x0, y0] = this.closestPixelTo(parsedPoint0[0][0], parsedPoint0[0][1]);
            let [x1, y1] = this.closestPixelTo(parsedPoint1[0][0], parsedPoint1[0][1]);

            let dx = x1 - x0;
            let dy = y1 - y0;

            if (Math.abs(dx) > Math.abs(dy)) {
                if (x0 > x1) {
                    [x0, x1] = [x1, x0];
                    [y0, y1] = [y1, y0];
                }
                let a = dy / dx;
                let y = y0;
                for (let x = x0; x <= x1; x++) {
                    let [row, col] = [Math.round(x), Math.round(y)];
                    this.blendPixel(row, col, color[0], color[1], color[2], alpha);
                    y = y + a;
                }
            } 
            else {
                if (y0 > y1) {
                    [x0, x1] = [x1, x0];
                    [y0, y1] = [y1, y0];
                }
                let a = dx / dy;
                let x = x0;
                for (let y = y0; y <= y1; y++) {
                    let [row, col] = [Math.round(x), Math.round(y)];
                    this.blendPixel(row, col, color[0], color[1], color[2], alpha);
                    x = x + a;
                }
            }
        }
    }
    
    drawpolyline(points, stroke)
    {
        let [col1,row1] = points[0]
        console.log(points.length)
        for(let i=1;i<points.length;i++){
            let [col2,row2] = points[i];
            this.drawline(row1,col1,row2,col2,stroke)
            row1 = row2
            col1 = col2
        }
    }

    drawline(y1,x1,y2,x2,stroke)
    {
        let [row1,col1] = this.closestPixelTo(x1,y1);
        let [row2,col2] = this.closestPixelTo(x2,y2);
        if(Math.abs(col2-col1)>Math.abs(row2-row1))
        {
            //horizontal line
            let temp=[]
            if(col1>col2){
                temp[0] = row1
                temp[1]= col1
                row1=row2
                col1=col2
                row2=temp[0]
                col2=temp[1]
            }
            let y_coords = this.lerp(col1,row1,col2,row2);
            for(let x=0; x<y_coords.length;x++)
            {
                this.putPixel(y_coords[x], col1+x,stroke[0],stroke[1],stroke[2])
            }
        }
        else{
            let temp=[]
            if(row1>row2){
                temp[0] = row1
                temp[1]= col1
                row1=row2
                col1=col2
                row2=temp[0]
                col2=temp[1]
            }
            let x_coords = this.lerp(row1, col1,row2, col2);
            for(let y=0; y<x_coords.length;y++)
            {
                this.putPixel(row1+y,x_coords[y],stroke[0],stroke[1],stroke[2])
            }  
        }
    }

    putPixel(row, col, r, g, b) { 
        /*
        Update one pixel in the image array. (r,g,b) are 0-255 color values.
        */
        if (Math.round(row) != row) {
            console.error("Cannot put pixel in fractional row");
            return;
        }
        if (Math.round(col) != col) {
            console.error("Cannot put pixel in fractional col");
            return;
        }
        if (row < 0 || row >= this.image.height) {
            return;
        }
        if (col < 0 || col >= this.image.width) {
            return;
        }
        const index = 4 * (this.image.width * row + col);
        this.image.data[index + 0] = Math.round(r);
        this.image.data[index + 1] = Math.round(g);
        this.image.data[index + 2] = Math.round(b);
        this.image.data[index + 3] = 255;
        // Do not modify the putPixel() function!
    }

    closestPixelTo(x, y) {
        /*
        Return the [row, col] of the canvas pixel closest to the point (x,y) where (x,y) are in world coordinates
        
        Use the convention that the point (minX, minY) is the center of the pixel in row 0 column 0
        The point (maxX, maxY) is the center of the pixel in the last row and the last column
        */
        let a = this.scene.viewBox.split();
        a = parsePoints(a[0]);
        let minx = a[0][0];
        let miny = a[1][0];
        let width = a[2][0];
        let height = a[3][0];

        let pix_row = Math.round((y-miny)*((this.image.height-1)/(height)));
        let pix_col = Math.round((x-minx)*((this.image.width-1)/(width)));

        return [pix_row, pix_col];
    }
    
    //following textbook 
    drawFilledTriangle(points, color, alpha) {

        let [y0, x0] = this.closestPixelTo(points[0][0], points[0][1]);
        let [y1, x1] = this.closestPixelTo(points[1][0], points[1][1]);
        let [y2, x2] = this.closestPixelTo(points[2][0], points[2][1]);

        // sort soy0 <= y1 <= y2
        if (y1 < y0) {
            [x1, x0] = [x0, x1];
            [y1, y0] = [y0, y1];
        }
        if (y2 < y0) {
            [x2, x0] = [x0, x2];
            [y2, y0] = [y0, y2];
        }
        if (y2 < y1) {
            [x2, x1] = [x1, x2];
            [y2, y1] = [y1, y2];
        }

        // Compute the x coordinates of triangle edges
        var x01 = this.lerp(y0, x0, y1, x1);
        var x12 = this.lerp(y1, x1, y2, x2);
        var x02 = this.lerp(y0, x0, y2, x2);

        // Concatenate the short sides
        x01.pop();
        let x012 = x01.concat(x12);
        
        // Determine which is left and which is right
        let m = Math.floor((x02.length / 2));
        if (x02[m] < x012[m]) {
            var x_left = x02;
            var x_right = x012;
        } else {
            var x_left = x012;
            var x_right = x02;
        }

        // Draw the horizontal segments
        for (var y = y0; y < y2; y++) {
            for (var x = x_left[y - y0]; x < x_right[y - y0]; x++) {
                this.blendPixel(y, x, color[0], color[1], color[2], alpha);
            }
        }
    }

    render() {
        /*
        Put all the pixels to light up the elements in scene.elements. 
        It will be necessary to parse the attributes of scene.elements, e.g. converting from stings to numbers.
        */
        for (const e of this.scene.elements) {
            if (e.type === 'point') {
                const x = Number(e.x);
                const y = Number(e.y);
                const color = parseRGB(e.color);
                const alpha = Number(e.opacity) || 1;
                const [row, col] = this.closestPixelTo(x, y);
                this.putPixel(row, col, color[0], color[1], color[2], alpha);
            } else if (e.type === 'line') {
                // TODO
                const x1 = Number(e.x1);
                const y1 = Number(e.y1);
                const x2 = Number(e.x2);
                const y2 = Number(e.y2);
                const stroke = parseRGB(e.stroke);
                const alpha = Number(e.opacity) || 1;
                this.drawline(y1,x1,y2,x2,stroke)
                //console.error("Line has not been implemented."); // placeholder
            } else if (e.type === 'polyline') {
                // TODO
                const points= parsePoints(e.points);
                const stroke = parseRGB(e.stroke);
                this.drawpolyline(points, stroke)
                
                //console.error("Polyline has not been implemented"); // placeholder
                
            } else if (e.type === 'polygon') {

                const pointsArray = parsePoints(e.points);
                const triangles = triangulate(pointsArray);
                const stroke = parseRGB(e.stroke);
                const strokeOpacity = Number(e['stroke-opacity']) || 1;
                const fillOpacity = Number(e['fill-opacity']) || 1;
                const fillColor = parseRGB(e.fill);

                //parsing e.points to pass into methods
                let spaced = e.points.replace(/,/g, " ");
                let result = spaced.split(" ");
                const arr = result.filter(function(x) {
                    return x !== "";
                });

                for(let element of triangles){
                    this.drawFilledTriangle(element, fillColor, fillOpacity)
                }
                this.Alphadrawlines(arr, stroke,strokeOpacity)
                //draw extra line from last point to first to complete polygon
                this.Alphadrawlines([arr[arr.length - 2], arr[arr.length - 1], arr[0], arr[1]], stroke, strokeOpacity);
            }
        }
    }
}

function parseRGB(colorString) {
    /*
    Return arguments as array [r,g,b] from string ilke "rgb(255, 0, 127)".
    */
    if (colorString === undefined) {
        // Default value for all colors
        return [0, 0, 0];
    }
    if (colorString[0] === "#") {
        const r = parseInt(colorString[1] + colorString[2], 16);
        const g = parseInt(colorString[3] + colorString[4], 16);
        const b = parseInt(colorString[5] + colorString[6], 16);
        return [r,g,b];
    }
    const parsed = colorString.match(/rgb\(( *\d* *),( *\d* *),( *\d* *)\)/);
    if (parsed.length !== 4) {
        console.error(`Could not parse color string ${colorString}`);
        return [0, 0, 0];
    }
    return [Number(parsed[1]), Number(parsed[2]), Number(parsed[3])];
}

function triangulate(points) {
    /*
    Return an array of triangles whose union equals the polygon described by points.
    Assume that points is an array of pairs of numbers. No coordinate transforms are applied.
    Assume that the polygon is non self-intersecting.
    */
    if (points.length <= 3) {
        return [points];
    } else if (points.length === 4) {
        // rearrange into CCW order with points[0] having greatest internal angle
        function f(u,v) {
            // angle between points u and v as if v were the origin
            const ret = Math.atan2(u[1]-v[1],u[0]-v[0]);
            return ret;
        }
        function angleAt(k) {
            const v = points[k];
            const u = points[(k-1+4) % 4];
            const w = points[(k+1) % 4];
            let a = f(w,v) - f(u,v);
            if ( a < 0) {
                return a + 2*Math.PI;
            }
            return a;
        };
        const angles = [angleAt(0), angleAt(1), angleAt(2), angleAt(3)];
        // Check for CCW order
        if (angles[0] + angles[1] + angles[2] + angles[3] > 4*Math.PI) {
            return triangulate([points[3], points[2],points[1],points[0]]);
        }
        // Check for points[0] greatest internal angle
        if (angles[0] !== Math.max(...angles)) {
            return triangulate([points[1], points[2], points[3], points[0]]);
        }
        // If so, the following triangulation is correct
        return [[points[0],points[1],points[2]],[points[0],points[2],points[3]]];
        
   
    } else {
        console.error("Only 3-polygons and 4-polygons supported");
    }
}

function parsePoints(points) {
    /*
    Helper method: convert string like "5,7 100,-2" to array [[5,7], [100,-2]]
    */
    const ret = [];
    const pairs = points.split(" ");
    for (const pair of pairs) {
        if (pair !== "") {
            const [x, y] = pair.split(",");
            ret.push([Number(x), Number(y)]);
        }
    }
    return ret;
}
