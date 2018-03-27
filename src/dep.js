//uid:订阅器id
var uid=0
var Dep=module.exports=exports=function(){
    this.id=uid++
    //订阅者数组
    this.subs=[]
}
Dep.prototype={
    addSub:function(sub){
        //订阅
        this.subs.push(sub)
    },
    depend:function(){
        //订阅者订阅并保存订阅器信息，真正的订阅完整动作
        Dep.target.addDep(this)
    },
    removeSub:function(sub){
        //取消订阅
        if(this.subs.indexof(sub)!=-1){
            this.subs.splice(index,1)
        }
    },
    notify:function(){
        this.subs.forEach(sub => {
            //通知订阅者更新数据
            sub.update()
        });
    }
}
//订阅者对象.所有订阅器对象公用，保存当前的订阅者对象
Dep.target=null
