/**
 * gamepad api插件
 * @author Dusk_Y
 * @blog https://mingyus.com
 */
declare class QuadTree {
    static MAX_OBJECTS: number;
    static MAX_LEVELS: number;
    objects: Array<any>;
    object_refs: Array<any>;
    nodes: Array<QuadTree>;
    level: number;
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    constructor(bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    }, level?: number);
    getIndex(pRect: any): number;
    split(): void;
    /**
     * insert
     */
    insert(obj: any): void;
    /**
     * retrieve
     */
    retrieve(pRect: any): any[];
    getAll(): any[];
    /**
     * getObjectNode
     */
    getObjectNode(obj: any): any;
    removeObject(obj: any): boolean;
    clear(): void;
    cleanup(): void;
}
