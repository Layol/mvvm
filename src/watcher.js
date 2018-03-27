var Dep=require('./dep')
var  Watcher=module.exports=exports= function(vm,expOrFn,cb){
    this.cb=cb
    this.vm=vm
    //传入的值（表达式）
    this.expOrFn=expOrFn
    //保存着订阅器信息
    this.depIds={}
    //expOrFn 属性值
    //this.getter处理exp表达式
    if(typeof expOrFn==='function'){
        //传入function则不为其定义getter，computed
        this.getter=expOrFn
    }else{
        //定义getter
        this.getter=this.parseGetter(expOrFn)
    }
    //通过getter获取真实的值并赋值
    this.value=this.get()
}
Watcher.prototype={
    //更新数据，监听者监听属性setter执行变化后随即通知相关订阅者
    update:function(){
        this.run()
    },
    run:function(){
        //获取值，注意，exp是不变的，变化的是exp的运算值
        var value=this.get()
        //初始化或者上一次改变时的值
        var oldVal=this.value
        if(value!=oldVal){
            this.value=value
            //更新完毕后执行回调
            this.cb.call(this.vm,value,oldVal)
        }
    },
    //订阅者订阅，加入订阅器，触发订阅属性getter时执行
    addDep:function(dep){
        if(!this.depIds.hasOwnProperty(dep.id)){
            dep.addSub(this)
            this.depIds[dep.id]=dep
        }
    },
    get:function(){
        //当前订阅者，
        Dep.target=this
        //触发订阅属性getter,同步更新此订阅者的值
        var value=this.getter.call(this.vm,this.vm)
        //更新完毕，清空当前订阅者
        Dep.target=null
        return value
    },
    parseGetter:function(exp){
        //正则是为了排除不能作为变量名的特殊字符以及空格等
        if(/[^\w.$]/.test(exp)) return
        var exps=exp.split('.')
        return function(obj){
            //obj:mvvm对象
            for(var i=0,len=exps.length;i<len;i++){
                if(!obj) return
                obj=obj[exps[i]]
            }
            return obj
        }
    }
}