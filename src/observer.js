var Dep=require('./dep')
var Observer= function(data){
    this.data=data
    this.walk(data)
}
Observer.prototype={
    walk:function(data){
        var _self=this
        Object.keys(data).forEach(function(key){
            _self.convert(key,data[key])
        })
    },
    convert:function(key,val){
        this.defineReactive(this.data,key,val)
    },
    defineReactive:function(data,key,val){
        var dep=new Dep()
        //值为对象时监听值
        var childObj=observe(val)
        Object.defineProperty(data,key,{
            enumerable:true,
            configurable:false,
            get:function(){
                //监听到当前有准备完毕待订阅的订阅者
                if(Dep.target){
                    //订阅
                    dep.depend()
                }
                return val
            },
            set:function(newVal){
                console.log('observer trigger! old: '+newVal+' new: '+val)
                if(newVal==val){
                    return 
                }
                //更新值
                val=newVal
                //监听值对象
                childObj=observe(newVal)
                //通知更新到订阅器
                dep.notify()
            }

        })

    }
}
var observe=module.exports=exports= function(value,vm){
    if(!value||typeof value!=='object'){
        return
    }
    return new Observer(value)
}