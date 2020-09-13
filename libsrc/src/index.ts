/**
 * gamepad api插件
 * @author Dusk_Y
 * @blog https://mingyus.com
 */
class QuadTree {
    public static MAX_OBJECTS = 10;
    public static MAX_LEVELS = 5;
    public objects: Array<any>;
    public object_refs: Array<any>;
    public nodes: Array<QuadTree>;
    public level: number;
    public bounds: {
        x: number, y: number, width: number, height: number
    };
    constructor(bounds: {
        x: number, y: number, width: number, height: number
    }, level: number = 0) {
        this.objects = [];
        this.nodes = [];
        this.object_refs = [];
        this.level = level;
        this.bounds = bounds;

    }

    public getIndex(pRect) {
        let index = -1,
            verticalMidpoint = this.bounds.x + (this.bounds.width / 2),
            horizontalMidpoint = this.bounds.y + (this.bounds.height / 2),

            //pRect can completely fit within the top quadrants
            topQuadrant = (pRect.y < horizontalMidpoint && pRect.y + pRect.height < horizontalMidpoint),

            //pRect can completely fit within the bottom quadrants
            bottomQuadrant = (pRect.y > horizontalMidpoint);

        //pRect can completely fit within the left quadrants
        if (pRect.x < verticalMidpoint && pRect.x + pRect.width < verticalMidpoint) {
            if (topQuadrant) {
                index = 1;
            } else if (bottomQuadrant) {
                index = 2;
            }

            //pRect can completely fit within the right quadrants	
        } else if (pRect.x > verticalMidpoint) {
            if (topQuadrant) {
                index = 0;
            } else if (bottomQuadrant) {
                index = 3;
            }
        }

        return index;
    };

    public split() {
        let nextLevel = this.level + 1,
            subWidth = Math.round(this.bounds.width / 2),
            subHeight = Math.round(this.bounds.height / 2),
            x = Math.round(this.bounds.x),
            y = Math.round(this.bounds.y);

        //top right node
        this.nodes[0] = new QuadTree({
            x: x + subWidth,
            y: y,
            width: subWidth,
            height: subHeight
        }, nextLevel);

        //top left node
        this.nodes[1] = new QuadTree({
            x: x,
            y: y,
            width: subWidth,
            height: subHeight
        }, nextLevel);

        //bottom left node
        this.nodes[2] = new QuadTree({
            x: x,
            y: y + subHeight,
            width: subWidth,
            height: subHeight
        }, nextLevel);

        //bottom right node
        this.nodes[3] = new QuadTree({
            x: x + subWidth,
            y: y + subHeight,
            width: subWidth,
            height: subHeight
        }, nextLevel);
    };

    /**
     * insert
     */
    public insert(obj) {
        let i = 0,
            index;

        //if we have subnodes ...
        if (typeof this.nodes[0] !== 'undefined') {
            index = this.getIndex(obj);

            if (index !== -1) {
                this.nodes[index].insert(obj);
                return;
            }
        }

        this.objects.push(obj);

        if (this.objects.length > QuadTree.MAX_OBJECTS && this.level < QuadTree.MAX_LEVELS) {

            //split if we don't already have subnodes
            if (typeof this.nodes[0] === 'undefined') {
                this.split();
            }

            //add all objects to there corresponding subnodes
            while (i < this.objects.length) {

                index = this.getIndex(this.objects[i]);

                if (index !== -1) {
                    this.nodes[index].insert(this.objects.splice(i, 1)[0]);
                } else {
                    i = i + 1;
                }
            }
        }
    }

    /**
     * retrieve 
     */
    public retrieve(pRect) {
        let index = this.getIndex(pRect),
            returnObjects = this.objects;

        //if we have subnodes ...
        if (typeof this.nodes[0] !== 'undefined') {

            //if pRect fits into a subnode ..
            if (index !== -1) {
                returnObjects = returnObjects.concat(this.nodes[index].retrieve(pRect));

                //if pRect does not fit into a subnode, check it against all subnodes
            } else {
                for (let i = 0; i < this.nodes.length; i = i + 1) {
                    returnObjects = returnObjects.concat(this.nodes[i].retrieve(pRect));
                }
            }
        }

        return returnObjects;
    };


    public getAll() {

        let objects = this.objects;

        for (let i = 0; i < this.nodes.length; i = i + 1) {
            objects = objects.concat(this.nodes[i].getAll());
        }

        return objects;
    }

    /**
     * getObjectNode 
     */
    public getObjectNode(obj) {
        let index;

        //if there are no subnodes, object must be here
        if (!this.nodes.length) {

            return this;

        } else {

            index = this.getIndex(obj);

            //if the object does not fit into a subnode, it must be here
            if (index === -1) {

                return this;

                //if it fits into a subnode, continue deeper search there
            } else {
                let node = this.nodes[index].getObjectNode(obj);
                if (node) return this.nodes[index].getObjectNode(obj);
            }
        }

        return false;
    }

    public removeObject(obj) {
        let node = this.getObjectNode(obj),
            index = node.objects.indexOf(obj);

        if (index === -1) return false;

        node.objects.splice(index, 1);
        
    }

    public clear() {
        this.objects = [];

        if (!this.nodes.length) return;

        for (let i = 0; i < this.nodes.length; i = i + 1) {

            this.nodes[i].clear();
        }

        this.nodes = [];
    }

    public cleanup() {
        let objects = this.getAll();
        this.clear();
        for (let i = 0; i < objects.length; i++) {
            this.insert(objects[i]);
        }
    }
}