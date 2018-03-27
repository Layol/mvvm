/*
    1.新建vm对象，传入参数
    2.解析参数，新建监听
    3.getter时添加订阅者，订阅
    4.解析html语句，更新数据
*/
var observe=require('./observer')
var Compile=require('./compile')
window.MVVM=function(options){
    this.option=options||{}
    var data=this._data=this.option.data
    var _self=this
    Object.keys(data).forEach(function(key){
        _self._proxyData(key)
    })
    this._initComputed()
    observe(data,this)
    this.$compile=new Compile(options.el||document.body,this)
}

MVVM.prototype={
    $watch:function(key,cb,options){
        new Watcher(this.key,cb)
    },
    _proxyData:function(key){
        var _self=this,
        setter=setter||Object.defineProperty(_self,key,{
            configurable:false,
            enumerable:true,
            get:function proxyGetter(){
                return _self._data[key]
            },
            set:function proxySetter(newVal){
                _self._data[key]=newVal
            }
        })
    },
    _initComputed:function(){
        var me=this
        var computed=this.option.computed
        if(typeof computed==='object'){
            Object.keys(computed).forEach(function(){
                Object.defineProperty(me,key,{
                    get:typeof computed[key]==='function'?computed[key]:computed.get,
                    set:function(){}
                })
            })
        }
    }
}
