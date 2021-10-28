
window.addEventListener("DOMContentLoaded", ()=>{
    var vm = new Vue({
        el: '#app',
        data:{
            "beforeImage":null,
            "afterImage":null,
            "afterImage":null,
            "moveBeforeImage":null,
            "moveAfterImage":null,
            "exitMoveImageMode":null,
            "canvas":null,
            "videoUrl":"",
            "recoder":null,
            "funcMoveFrame":()=>{},
            "changeBeforeScale":()=>{},
            "changeSfterScale ":()=>{},
            "step":1,
        },
         methods: {
            beforeLoad(e) {
            if(e.target.files || e.dataTransfer){
                const file = (e.target.files || e.dataTransfer)[0]
                if (file.type.startsWith("image/")) {
                    this.beforeImage = window.URL.createObjectURL(file);
                    if(this.afterImage != null){
                        this.refresh()
                        this.step = 2
                    }
                }
            }
           },
           afterLoad(e) {
            if(e.target.files || e.dataTransfer){
                const file = (e.target.files || e.dataTransfer)[0]
                if (file.type.startsWith("image/")) {
                    this.afterImage = window.URL.createObjectURL(file);
                    if(this.beforeImage != null){
                        this.refresh()
                        this.step = 2
                    }
                }
            }
           },
           recode(){
            const stream = this.canvas.captureStream();
            this.recorder = new MediaRecorder(stream,
{mimeType:'video/webm;codecs=vp9'});
            this.recorder.ondataavailable = (e)=> {
                let videoBlob = new Blob([e.data], { type: e.data.type });
                this.videoUrl = window.URL.createObjectURL(videoBlob);
            }
            this.funcMoveFrame(()=>{
                this.recorder.start();
            },()=>{
                setTimeout(()=>{this.recorder.stop()},250);
            })
           },
           refresh(){
            const PIXI_container = document.getElementById("container")
            PIXI_container.innerHTML = ""
            const canvasSize = {
                "width":PIXI_container.clientWidth / 2,
                "height":PIXI_container.clientWidth / 2
            }

            const app = new PIXI.Application({ width:
canvasSize.width, height: canvasSize.height })
            PIXI_container.appendChild(app.view);
            this.canvas = app.view

            PIXI.Texture.fromURL(this.beforeImage).then((beforeTexture)=>{

                PIXI.Texture.fromURL(this.afterImage).then((afterTexture)=>{



                    const beforeContainer = new PIXI.Container();
                    app.stage.addChild(beforeContainer);

                    let beforeSprite = new PIXI.Sprite.from(this.beforeImage);
                    beforeSprite.x = 0
                    beforeSprite.y = 0
                    beforeSprite.width = canvasSize.width
                    beforeSprite.height = canvasSize.height
                    beforeSprite.interactive = true;

                    beforeSprite.scale.x = canvasSize.width /
beforeTexture.width
                    beforeSprite.scale.y = canvasSize.width /
beforeTexture.width

                    beforeContainer.addChild(beforeSprite);

                    let center = canvasSize.width / 2

                    const afterContainer = new PIXI.Container();
                    app.stage.addChild(afterContainer);

                    let afterSprite = new PIXI.Sprite.from(this.afterImage);
                    afterSprite.x = 0
                    afterSprite.y = 0
                    afterSprite.width = canvasSize.width
                    afterSprite.height = canvasSize.height
                    afterSprite.interactive = true;

                    afterSprite.scale.x = canvasSize.width / afterTexture.width
                    afterSprite.scale.y = canvasSize.width / afterTexture.width

                    afterContainer.addChild(afterSprite);

                    const afterMask = new PIXI.Graphics();
                    // beforeMask.beginFill(0xFFFFFF);
                    afterMask.beginFill(0x000000)
                        .drawRect(center, 0, canvasSize.width,
canvasSize.height)
                        .endFill()
                    afterContainer.mask = afterMask


                    const frame = new PIXI.Graphics();
                    frame.beginFill(0x555555);
                    frame.drawRect(0, 0, 10, canvasSize.height)
                    frame.x = center
                    frame.y = 0
                    frame.interactive = true;


                    const beforeMask = new PIXI.Graphics();
                    // beforeMask.beginFill(0xFFFFFF);
                    beforeMask.beginFill(0x000000)
                        .drawRect(0, 0, center, canvasSize.height)
                        .endFill()
                    beforeContainer.mask = beforeMask

                    const moveFuncFactory = ({sprite, noY, after})=>{
                        return (e)=>{
                            let position = e.data.getLocalPosition(app.stage);
                            let dest  = position.x > 0 ?  position.x : 0
                            dest  = dest < canvasSize.width -10 ?
dest : canvasSize.width -10
                            // 位置変更
                            sprite.x = dest;
                            if(!noY){
                                let dest_y = position.y > 0 ?  position.y : 0
                                dest_y  = dest_y < canvasSize.height
-10 ?  dest_y : canvasSize.height -10
                                sprite.y = dest_y;
                            }
                            if(after){
                                after(position, dest)
                            }
                        }
                    }


                    const ImageMoveFuncFactory = ({sprite})=>{
                        let piv = {}
                        return (e)=>{
                            let position = e.data.getLocalPosition(app.stage);
                            let dest  = position.x > 0 ?  position.x : 0
                            dest  = dest < canvasSize.width -15 ?
dest : canvasSize.width -15

                            if(piv.x !== undefined){
                                sprite.x = sprite.x - (piv.x - dest);
                            }
                            piv.x = dest;

                            let dest_y = position.y > 0 ?  position.y : 0
                            dest_y  = dest_y < canvasSize.height -15 ?
 dest_y : canvasSize.height -15

                            if(piv.y !== undefined){
                                sprite.y = sprite.y - ( piv.y - dest_y);
                            }
                            piv.y = dest_y;
                        }
                    }


                    const onFramePointerMove =
moveFuncFactory({sprite:frame, noY:true, after:(position, dest)=>{
                        center = dest
                        beforeMask.clear()
                            .beginFill(0x000000)
                            .drawRect(0, 0, center, canvasSize.height)
                            .endFill()

                        afterMask.clear()
                            .beginFill(0x000000)
                            .drawRect(center, 0, canvasSize.width,
canvasSize.height)
                            .endFill()
                    }})

                    this.funcMoveFrame = (onStart,onComplete)=>{
                        // TweenMax
                        gsap.fromTo(frame, 3,

                            /* ==============
                            * 初期値(from)
                            * ================ */
                            {
                                x:canvasSize.width-10,
                            },
                            /* ==============
                            * 終了値（To）
                            * ================ */
                            {
                                x:0,
                                onStart:onStart ? onStart : ()=>{},
                                onComplete:onComplete ? onComplete : ()=>{},
                                onUpdate:()=>{
                                    let dest  = frame.x > 0 ?  frame.x : 0
                                    dest  = dest < canvasSize.width
-10 ?  dest : canvasSize.width -10
                                    beforeMask.clear()
                                        .beginFill(0x000000)
                                        .drawRect(0, 0, dest, canvasSize.height)
                                        .endFill()

                                    afterMask.clear()
                                        .beginFill(0x000000)
                                        .drawRect(dest, 0,
canvasSize.width, canvasSize.height)
                                        .endFill()
                                },

                                repeat: 1, // 繰り返し回数（-1で無限ループ）
                                repeatDelay:0.75,
                                yoyo: true, // アニメーションの往復を有効化
                                ease: "power1.in",// イージング設定
                            }
                        );
                    }

                    this.moveBeforeImage = ()=>{
                        const beforeSpriteClick = ()=>{
                            const beforeSpriteMove =
ImageMoveFuncFactory({sprite:beforeSprite})
                            beforeSprite.on("pointermove", beforeSpriteMove )

document.addEventListener('pointerup',()=>{beforeSprite.off("pointermove",
beforeSpriteMove )});
                        }
                        beforeSprite.on('pointerdown', beforeSpriteClick)


                        afterSprite.alpha = 0.5
                        beforeSprite.alpha = 0.5

                        beforeMask.clear()
                            .beginFill(0x000000)
                            .drawRect(0, 0, canvasSize.width, canvasSize.height)
                            .endFill()

                        afterMask.clear()
                            .beginFill(0x000000)
                            .drawRect(0, 0, canvasSize.width, canvasSize.height)
                            .endFill()

                        app.stage.removeChild(beforeContainer)
                        app.stage.addChild(beforeContainer)

                        this.exitMoveImageMode = ()=>{
                            beforeSprite.off('pointerdown', beforeSpriteClick)

                            afterSprite.alpha = 1
                            beforeSprite.alpha = 1


                            beforeMask.clear()
                                .beginFill(0x000000)
                                .drawRect(0, 0, center, canvasSize.height)
                                .endFill()

                            afterMask.clear()
                                .beginFill(0x000000)
                                .drawRect(center, 0, canvasSize.width,
canvasSize.height)
                                .endFill()

                            this.exitMoveImageMode = null
                        }
                    }



                    this.moveAfterImage = ()=>{
                        const fullViewMask = new PIXI.Graphics();
                        fullViewMask.beginFill(0x000000)
                            .endFill()

                        const afterSpriteClick = ()=>{
                            const afterSpriteMove =
ImageMoveFuncFactory({sprite:afterSprite})
                            afterSprite.on("pointermove", afterSpriteMove )

document.addEventListener('pointerup',()=>{afterSprite.off("pointermove",
afterSpriteMove )});
                        }
                        afterSprite.on('pointerdown', afterSpriteClick)

                        afterSprite.alpha = 0.5
                        beforeSprite.alpha = 0.5

                        beforeMask.clear()
                            .beginFill(0x000000)
                            .drawRect(0, 0, canvasSize.width, canvasSize.height)
                            .endFill()

                        afterMask.clear()
                            .beginFill(0x000000)
                            .drawRect(0, 0, canvasSize.width, canvasSize.height)
                            .endFill()

                        app.stage.removeChild(afterContainer)
                        app.stage.addChild(afterContainer)

                        this.exitMoveImageMode = ()=>{
                            afterSprite.off('pointerdown', afterSpriteClick)

                            afterSprite.alpha = 1
                            beforeSprite.alpha = 1

                            beforeMask.clear()
                                .beginFill(0x000000)
                                .drawRect(0, 0, center, canvasSize.height)
                                .endFill()

                            afterMask.clear()
                                .beginFill(0x000000)
                                .drawRect(center, 0, canvasSize.width,
canvasSize.height)
                                .endFill()

                            app.stage.removeChild(beforeContainer)
                            app.stage.addChild(beforeContainer)

                            app.stage.removeChild(frame)
                            app.stage.addChild(frame)

                            this.exitMoveImageMode = null
                        }
                    }

                    const changeScaleFactory = (sprite)=>{
                        let initX = sprite.scale.x
                        let initY = sprite.scale.y
                        return (event, reset)=>{
                            let val = event.srcElement.value / 100
                            if(reset){
                                sprite.scale.x = initX
                                sprite.scale.y = initY
                            }else{
                                sprite.scale.x = initX * val
                                sprite.scale.y = initY * val
                            }
                        }
                    }

                    this.changeBeforeScale = changeScaleFactory(beforeSprite)
                    this.changeAfterScale = changeScaleFactory(afterSprite)

                    frame.on('pointerdown',
()=>{frame.on("pointermove",onFramePointerMove )})

document.addEventListener('pointerup',()=>{frame.off("pointermove",onFramePointerMove
)});

                    app.stage.addChild(frame);
                });
            });

           }
        },
      })
})
