var Watcher=require('./watcher')
var Compile=module.exports=exports=function(el,vm){
    this.$vm=vm
    this.$el=this.isElementNode(el)?el:document.querySelector(el)
    if(this.$el){
        this.$fragment=this.node2Fragment(this.$el)
        this.init()
        this.$el.appendChild(this.$fragment)
    }
}
Compile.prototype={
    node2Fragment:function(el){
        var fragment=document.createDocumentFragment(),child
        while(child=el.firstChild){
            fragment.appendChild(child)
        }
        return fragment
    },
    init:function(){
        this.compileElement(this.$fragment)
    },
    compileElement:function(el){
        var childNodes=el.childNodes,
        _self=this
        //类数组对象转换为数组遍历
        Array.prototype.slice.call(childNodes).forEach(node => {
            var text=node.textContent
            //匹配{{}}
            var reg=/\{\{(.*)\}\}/
            //元素节点类型解析
            if(_self.isElementNode(node)){
                _self.compile(node)
                //包含{{}}形式的文本节点类型解析
            }else if(_self.isTextNode(node)&&reg.test(text)){
                _self.compileText(node,RegExp.$1)
            }
            if(node.childNodes&&node.childNodes.length){
                _self.compileElement(node)
            }
        });
    },
    compile:function(node){
        var nodeAttrs=node.attributes,_self=this
        Array.prototype.slice.call(nodeAttrs).forEach(function(attr){
            var attrName=attr.name
            //v-
            if(_self.isDirective(attrName)){
                var exp=attr.value
                var dir=attrName.substring(2)
                //on
                if(_self.isEventDirective(dir)){
                    compileUtil.eventHandler(node,_self.$vm,exp,dir)
                }else{
                    compileUtil[dir]&&compileUtil[dir](node,_self.$vm,exp)
                }
                node.removeAttribute(attrName)
            }
        })
    },
    compileText:function(node,exp){
        compileUtil.text(node,this.$vm,exp)
    },
    isDirective:function(attr){
        return attr.indexOf('v-')==0
    },
    isEventDirective:function(dir){
        return dir.indexOf('on')===0
    },
    isElementNode:function(node){
        return node.nodeType==1
    },
    isTextNode:function(node){
        return node.nodeType==3
    }
}

var compileUtil={
    text:function(node,vm,exp){
        this.bind(node,vm,exp,'text')
    },
    html:function(node,vm,exp){
        this.bind(node,vm,exp,'html')
    },
    model:function(node,vm,exp){
        this.bind(node,vm,exp,'model')
        var _self=this,
            val=this._getVMVal(vm,exp)
        node.addEventListener('input',function(e){
            var newVal=e.target.value
            console.log('val: '+val,'new:'+newVal)
            if(val===newVal){
                return
            }
            _self._setVMVal(vm,exp,newVal)
            //??
            val=newVal
        })
    },
    class:function(node,vm,exp){
        this.bind(node,vm,exp,'class')
    },
    bind:function(node,vm,exp,dir){
        var updaterFn=updater[dir+'Updater']
        //初始化页面数据
        updaterFn&&updaterFn(node,this._getVMVal(vm,exp))
        //创建订阅者，订阅，单项绑定
        new Watcher(vm,exp,function(value,oldVal){
            //需要双向绑定的，订阅后反向更新数据
            updaterFn&&updaterFn(node,value,oldVal)
        })
    },
    eventHandler:function(node,vm,exp,dir){
        //v-on:click=function(){},取得事件句柄
        var eventType=dir.split(':')[1],
        fn=vm.option.methods&&vm.option.methods[exp]
        if(eventType&&fn){
            node.addEventListener(eventType,fn.bind(vm),false)
        }
    },
    _getVMVal:function(vm,exp){
        var val=vm
        exp=exp.split('.')
        exp.forEach(function(k){
            //触发observer的getter进而订阅，单向绑定
            val=val[k]
        })
        return val
    },
    _setVMVal:function(vm,exp,value){
        var val=vm
        exp=exp.split('.')
        exp.forEach(function(k,i){
            if(i<exp.length-1){
                val=val[k]
            }else{
                //触发observer的setter进而更新订阅者数据，双向绑定
                val[k]=value
            }
        })
    }
}
var updater={
    textUpdater:function(node,value){
        node.textContent=typeof value=="undefined"?"":value
    },
    htmlUpdater:function(node,value){
        node.innerHTML=typeof value=="undefined"?"":value
    },
    classUpdater:function(node,value,oldVal){
        var className=node.className
        className=className.replace(oldVal,'').replace(/\s$/,'')
        var space=className&&String(value)?' ':''
        node.className=className+space+value
    },
    modelUpdater:function(node,value,oldVal){
        node.value=typeof value=='undefined'?'':value
    }
}