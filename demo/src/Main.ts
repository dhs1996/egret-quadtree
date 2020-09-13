class Main extends egret.DisplayObjectContainer {
    private tree: QuadTree;
    private itemList: Array<eui.Rect>;
    public constructor() {
        super();
        this.init();
    }

    private init() {
        this.itemList = [];
        this.width = 1920;
        this.height = 1080;
        let rect = new eui.Rect(1920, 1080, 0x000000);
        this.addChild(rect)
        this.addEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
        this.showFPS();
        this.createGame();
        this.tree = new QuadTree(rect);
    }

    //模拟个fps显示，方便观察实际效率
    private timer;
    private tnum;
    private debugInfo: eui.Group;
    private fpsText: eui.Label;
    private showFPS() {
        this.debugInfo = new eui.Group();
        let layout = new eui.VerticalLayout()
        layout.horizontalAlign = 'left';
        layout.gap = 0;
        this.debugInfo.layout = layout;
        this.debugInfo.width = 120;
        this.debugInfo.x = 10;
        this.debugInfo.y = 10;
        this.fpsText = new eui.Label('FPS:60');
        this.fpsText.stroke = 2;
        this.debugInfo.addChild(this.fpsText);
        this.addChild(this.debugInfo);
    }

    private onEnterFrame() {
        let ntimer = new Date().getTime();
        if (this.timer) {
            this.tnum++;
            let dt = ntimer - this.timer;
            if (dt > 1000) {
                this.debugInfo.zIndex = 1000000;
                this.fpsText.text = 'FPS:' + (this.tnum > 60 ? 60 : this.tnum);
                this.tnum = 0;
                this.timer = ntimer;
            }
        } else {
            this.tnum = 0;
            this.timer = ntimer;
        }
        this.update();
    }

    private menuList: eui.Group;
    private createGame() {
        this.menuList = new eui.Group();
        this.menuList.x = 400;
        this.menuList.y = 200;
        let layout = new eui.VerticalLayout()
        layout.horizontalAlign = 'center';
        layout.gap = 20;
        this.menuList.layout = layout;
        let gp_1 = new eui.Group();
        gp_1.width = 300;
        gp_1.height = 60;
        let start_1 = new eui.Label();
        start_1.text = '普通碰撞测试';
        gp_1.addChild(new eui.Rect(300, 60, 0xA8A8A8));
        gp_1.addChild(start_1);
        start_1.horizontalCenter = 0;
        start_1.verticalCenter = 0;
        gp_1.addEventListener('touchTap', this.enterType1, this);
        let gp_2 = new eui.Group();
        gp_2.width = 300;
        gp_2.height = 40;
        let start_2 = new eui.Label();
        start_2.text = '四叉树优化碰撞测试';
        gp_2.addChild(new eui.Rect(300, 60, 0xA8A8A8));
        gp_2.addChild(start_2);
        start_2.horizontalCenter = 0;
        start_2.verticalCenter = 0;
        gp_2.addEventListener('touchTap', this.enterType2, this);
        this.menuList.addChild(gp_1);
        this.menuList.addChild(gp_2);
        this.addChild(this.menuList)
    }

    private enterType1() {
        this.menuList.parent.removeChild(this.menuList);
        this.drawItemList();
        this.type = 1;
    }

    private enterType2() {
        this.menuList.parent.removeChild(this.menuList);
        this.drawItemList();
        this.type = 2;
    }

    private type;
    private update() {
        this.autoMove();
        if (this.type == 1) {
            this.hitCheckType1();
        } else if (this.type == 2) {
            this.hitCheckType2();
        }
    }

    private drawItemList() {
        let speed = 10;
        for (var i = 0; i < 500; i++) {
            let item = new eui.Rect(20, 20, 0xFFFFFF);
            item['dx'] = Math.random() * speed * 2 - speed;
            item['dy'] = Math.random() * speed * 2 - speed;
            item.x = Math.random() * (1920 - 20);
            item.y = Math.random() * (1080 - 20);
            this.addChild(item);
            this.itemList.push(item);
            this.tree.insert(item);
        }
    }

    private autoMove() {
        for (var i = 0; i < this.itemList.length; i++) {
            let item = this.itemList[i];
            item.x += item['dx'];
            item.y += item['dy'];
            if (item.x < 0 || item.x > 1920 - 20) item['dx'] = -item['dx'];
            if (item.y < 0 || item.y > 1080 - 20) item['dy'] = -item['dy'];
        }
    }

    //正常碰撞检测
    private hitCheckType1() {
        for (var i = 0; i < this.itemList.length; i++) {
            let item = this.itemList[i];
            for (var j = 0; j < this.itemList.length; j++) {
                if (i == j) continue;
                let oitem = this.itemList[j];
                if (this.isHit(item, oitem)) {
                    item['dx'] = -item['dx'];
                    item['dy'] = -item['dy'];
                    oitem['dx'] = -oitem['dx'];
                    oitem['dy'] = -oitem['dy'];
                }
            }
        }
    }

    //四叉树优化后的碰撞检测
    private hitCheckType2() {
        for (var i = 0; i < this.itemList.length; i++) {
            let item = this.itemList[i];
            let list = this.tree.retrieve(item);
            for (var j = 0; j < list.length; j++) {
                let oitem = list[j];
                if (this.isHit(item, oitem)) {
                    item['dx'] = -item['dx'];
                    item['dy'] = -item['dy'];
                    oitem['dx'] = -oitem['dx'];
                    oitem['dy'] = -oitem['dy'];
                }
            }
        }

    }

    private isHit(source: egret.DisplayObject, target: egret.DisplayObject) {
        return !(
            ((source.y + source.height * source.scaleY) < (target.y)) ||
            (source.y > (target.y + target.height * target.scaleY)) ||
            ((source.x + source.width * source.scaleX) < target.x) ||
            (source.x > (target.x + target.width * target.scaleX))
        );
    }


}